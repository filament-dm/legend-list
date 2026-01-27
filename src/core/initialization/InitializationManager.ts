/**
 * Initialization Manager
 *
 * Centralizes all initialization state and logic. The initialization system handles
 * the complex process of filling the viewport when navigating to a specific timeline
 * position (e.g., jumping to a message in chat history).
 *
 * This manager provides a single source of truth for initialization state and
 * clear interfaces for the rest of the system to interact with initialization behavior.
 */

import { getContentSize } from "@/state/getContentSize";
import type { StateContext } from "@/state/state";
import { checkForcePagination, type ForcePaginationConfig } from "./forcePagination";
import {
    type DataArrivalInfo,
    type InitializationConfig,
    InitializationMode,
    InitializationPhase,
    type InitializationState,
    PaginationDirection,
} from "./types";

/**
 * Manages initialization state and behavior
 */
export class InitializationManager {
    private state: InitializationState;
    private ctx: StateContext;

    constructor(ctx: StateContext) {
        this.ctx = ctx;
        this.state = {
            anchorId: undefined,
            anchorIndex: undefined,
            didCompleteInitialScroll: false,
            didInitialRecenter: false,
            endRequestDataCount: undefined,
            endRequestTimestamp: undefined,
            isEndBufferSufficient: false,
            isStartBufferSufficient: false,
            mode: InitializationMode.IDLE,
            pendingEndRequest: false,
            pendingStartRequest: false,
            phase: InitializationPhase.IDLE,
            stabilizationFrames: 0,
            startRequestDataCount: undefined,
            startRequestTimestamp: undefined,
            targetScroll: undefined,
            targetViewPosition: undefined,
            timelineId: undefined,
        };
    }

    // ===== Phase Management =====

    /**
     * Enter initialization mode for a new timeline
     */
    enterInitialization(config: InitializationConfig): void {
        // Detect mode from props and config using three-case logic
        let mode: InitializationMode;

        if (config.mode && config.mode !== InitializationMode.IDLE) {
            // Explicit mode provided in config
            mode = config.mode;
        } else if (!this.ctx.state.props.maintainScrollAtEnd && config.anchorId) {
            // Case 1: Focused timeline - center target, paginate both directions
            mode = InitializationMode.MID_TIMELINE;
        } else if (this.ctx.state.props.maintainScrollAtEnd && !config.anchorId) {
            // Case 2: Live timeline, no target - bottom position, paginate backward only
            mode = InitializationMode.CHAT;
        } else if (this.ctx.state.props.maintainScrollAtEnd && config.anchorId) {
            // Case 3: Live timeline with target - attempt positioning, paginate backward only
            mode = InitializationMode.CHAT_WITH_TARGET;
        } else {
            // Fallback default
            mode = InitializationMode.MID_TIMELINE;
        }

        // Set targetViewPosition based on mode
        // For chat modes (live timelines), use 1.0 (bottom)
        // For focused timeline, use 0.5 (center)
        const targetViewPosition =
            config.targetViewPosition ??
            (mode === InitializationMode.CHAT || mode === InitializationMode.CHAT_WITH_TARGET ? 1.0 : 0.5);

        console.log("[INIT-MANAGER-1] Entering initialization mode:", {
            anchorId: config.anchorId,
            maintainScrollAtEnd: this.ctx.state.props.maintainScrollAtEnd,
            mode,
            targetViewPosition,
            timelineId: config.timelineId,
        });

        this.state.phase = InitializationPhase.FILLING;
        this.state.mode = mode;
        this.state.timelineId = config.timelineId;
        this.state.anchorId = config.anchorId;
        this.state.targetViewPosition = targetViewPosition;
        this.state.didCompleteInitialScroll = false;
        this.state.didInitialRecenter = false;
        this.state.stabilizationFrames = 0;
        this.state.pendingStartRequest = false;
        this.state.pendingEndRequest = false;
        this.state.isStartBufferSufficient = false;
        this.state.isEndBufferSufficient = false;

        // Sync to InternalState
        this.ctx.state.isInitializing = true;
        this.ctx.state.lastTimelineId = config.timelineId;
        this.ctx.state.stabilizationStableFrames = 0;
        this.ctx.state.pendingStartRequest = false;
        this.ctx.state.pendingEndRequest = false;
    }

    /**
     * Prepare initial scroll configuration when data arrives
     * This replaces the logic previously in LegendList.tsx lines 407-430
     *
     * @param data - Current data array
     * @param keyExtractor - Function to extract keys from items
     * @returns true if initial scroll was prepared, false if anchor not found or data empty
     */
    prepareInitialScroll(data: readonly unknown[], keyExtractor: (item: unknown, index: number) => string): boolean {
        if (!this.isInitializing()) {
            console.warn("[INIT-MANAGER-SCROLL] Not initializing, skipping prepareInitialScroll");
            return false;
        }

        // Wait for initial data to arrive
        if (!data || data.length === 0) {
            console.log("[INIT-MANAGER-SCROLL] No data yet, waiting for initial data arrival");
            return false;
        }

        // If no anchor, we're in chat mode - scroll to bottom (most recent message)
        if (!this.state.anchorId) {
            const lastIndex = Math.max(0, data.length - 1);
            console.log("[INIT-MANAGER-SCROLL] No anchor (chat mode), scrolling to bottom:", {
                index: lastIndex,
                mode: this.state.mode,
                viewPosition: this.state.targetViewPosition,
            });

            this.ctx.state.initialScroll = {
                index: lastIndex,
                viewPosition: this.state.targetViewPosition ?? 1.0,
            };
            return true;
        }

        // Find anchor in data
        const anchorIndex = data.findIndex((item, index) => keyExtractor(item, index) === this.state.anchorId);

        if (anchorIndex >= 0) {
            // Anchor found - set initial scroll
            console.log("[INIT-MANAGER-SCROLL] Anchor found, setting initial scroll:", {
                anchorId: this.state.anchorId,
                anchorIndex,
                dataLength: data.length,
                mode: this.state.mode,
                viewPosition: this.state.targetViewPosition,
            });

            this.ctx.state.initialScroll = {
                index: anchorIndex,
                viewPosition: this.state.targetViewPosition ?? 0.5,
            };
            return true;
        }

        // Anchor not found - apply graceful degradation
        console.warn("[INIT-MANAGER-SCROLL] Anchor not found, applying fallback:", {
            anchorId: this.state.anchorId,
            dataLength: data.length,
            mode: this.state.mode,
        });

        if (this.state.mode === "chat-with-target") {
            // Fallback: chat-with-target → chat (scroll to bottom)
            console.log("[INIT-MANAGER-SCROLL] Falling back from chat-with-target to chat mode");
            this.state.mode = InitializationMode.CHAT;
            this.state.targetViewPosition = 1.0;
            this.state.anchorId = undefined; // Clear anchor since it's not found

            const lastIndex = Math.max(0, data.length - 1);
            this.ctx.state.initialScroll = {
                index: lastIndex,
                viewPosition: 1.0,
            };
            return true;
        }

        if (this.state.mode === InitializationMode.MID_TIMELINE) {
            // Fallback: mid-timeline → anchor to middle item on screen
            const middleIndex = Math.floor(data.length / 2);
            console.log("[INIT-MANAGER-SCROLL] Falling back to middle item:", {
                fallbackIndex: middleIndex,
            });

            // Update anchor to the fallback item
            this.state.anchorId = keyExtractor(data[middleIndex], middleIndex);
            this.ctx.state.initialScroll = {
                index: middleIndex,
                viewPosition: 0.5,
            };
            return true;
        }

        // Should not reach here, but provide safe fallback
        console.error("[INIT-MANAGER-SCROLL] Unexpected mode, falling back to first item");
        this.ctx.state.initialScroll = {
            index: 0,
            viewPosition: 0,
        };
        return false;
    }

    /**
     * Enter SCROLLING phase - called after initial scroll is prepared
     * During this phase, the target item is being positioned and pagination/MVCP are blocked
     */
    enterScrollingPhase(): void {
        if (!this.isInitializing()) {
            console.warn("[INIT-PHASE] Cannot enter SCROLLING phase - not initializing");
            return;
        }

        console.log("[INIT-PHASE] Entering SCROLLING phase");
        this.state.phase = InitializationPhase.SCROLLING;
    }

    /**
     * Transition from SCROLLING to FILLING phase - called after initial scroll completes
     * This enables MVCP lock and forced pagination
     */
    transitionToFillingPhase(): void {
        if (!this.isInitializing()) {
            console.warn("[INIT-PHASE] Cannot transition to FILLING phase - not initializing");
            return;
        }

        console.log("[INIT-PHASE] Transitioning to FILLING (post-scroll) phase");
        this.state.phase = InitializationPhase.FILLING;
    }

    /**
     * Transition to STABILIZING phase - called when buffers are sufficient
     * This begins counting stable frames before completion
     */
    transitionToStabilizingPhase(): void {
        if (!this.isInitializing()) {
            console.warn("[INIT-PHASE] Cannot transition to STABILIZING phase - not initializing");
            return;
        }

        console.log("[INIT-PHASE] Transitioning to STABILIZING phase");
        this.state.phase = InitializationPhase.STABILIZING;
    }

    /**
     * Exit initialization mode
     */
    exitInitialization(): void {
        console.log("[INIT-MANAGER-2] Exiting initialization mode");

        this.state.phase = InitializationPhase.IDLE;
        this.state.mode = InitializationMode.IDLE;
        this.state.timelineId = undefined;
        this.state.anchorId = undefined;
        this.state.anchorIndex = undefined;
        this.state.targetScroll = undefined;
        this.state.targetViewPosition = undefined;
        this.state.didCompleteInitialScroll = false;
        this.state.didInitialRecenter = false;
        this.state.stabilizationFrames = 0;

        // Sync to InternalState
        this.ctx.state.isInitializing = false;
        this.ctx.state.stabilizationStableFrames = 0;
        this.ctx.state.initialAnchor = undefined;
    }

    // ===== State Queries =====

    /**
     * Check if initialization is active
     */
    isInitializing(): boolean {
        return this.state.phase !== InitializationPhase.IDLE;
    }

    /**
     * Get current initialization phase
     */
    getCurrentPhase(): InitializationPhase {
        return this.state.phase;
    }

    /**
     * Check if initial scroll has completed
     */
    didCompleteInitialScroll(): boolean {
        return this.state.didCompleteInitialScroll;
    }

    /**
     * Get buffer multiplier for current phase
     * Returns 4x during initialization, 1x otherwise
     */
    getBufferMultiplier(): number {
        return this.isInitializing() ? 4 : 1;
    }

    /**
     * Check if MVCP should be locked to anchor
     */
    shouldLockMVCP(): boolean {
        if (!this.isInitializing()) return false;
        if (!this.state.anchorId) return false;

        // Don't lock during SCROLLING phase - wait for initial scroll to complete
        if (this.state.phase === InitializationPhase.SCROLLING) return false;

        // Don't lock until initial scroll has completed
        if (!this.state.didCompleteInitialScroll) return false;

        // Check if anchor is ready (exists in data and has position)
        const anchorIndex = this.ctx.state.indexByKey.get(this.state.anchorId);
        const hasPosition = this.ctx.state.positions.has(this.state.anchorId);

        return anchorIndex !== undefined && hasPosition;
    }

    /**
     * Get MVCP anchor override (if should lock)
     * Returns undefined if MVCP should use normal behavior
     */
    getMVCPAnchorOverride(): string | undefined {
        if (!this.shouldLockMVCP()) return undefined;
        return this.state.anchorId;
    }

    // ===== Position Management =====

    /**
     * Get the initialization mode (chat, mid-timeline, chat-with-target, or idle)
     */
    getInitializationMode(): InitializationMode {
        return this.state.mode;
    }

    /**
     * Get the target viewport position for the anchor
     * Returns undefined if not initializing or no target position set
     */
    getTargetViewPosition(): number | undefined {
        return this.state.targetViewPosition;
    }

    /**
     * Check if re-centering should be performed
     * Returns true only once after initial scroll completes and before first recenter
     */
    shouldRecenterAnchor(): boolean {
        if (!this.isInitializing()) return false;
        if (!this.state.anchorId) return false;
        if (!this.state.didCompleteInitialScroll) return false;
        if (this.state.didInitialRecenter) return false;

        // Verify anchor is ready
        const anchorIndex = this.ctx.state.indexByKey.get(this.state.anchorId);
        const hasPosition = this.ctx.state.positions.has(this.state.anchorId);

        return anchorIndex !== undefined && hasPosition;
    }

    /**
     * Mark that initial scroll to anchor has completed
     */
    markInitialScrollComplete(): void {
        if (!this.isInitializing()) return;

        console.log("[INIT-MANAGER-POS-1] Initial scroll complete");
        this.state.didCompleteInitialScroll = true;
    }

    /**
     * Mark that initial re-centering has been performed
     */
    markRecenterComplete(): void {
        if (!this.isInitializing()) return;

        console.log("[INIT-MANAGER-POS-2] Re-center complete");
        this.state.didInitialRecenter = true;
    }

    /**
     * Check if buffer forcing should be active
     * Returns true during FILLING phase
     */
    shouldForceBufferCheck(): boolean {
        return this.state.phase === InitializationPhase.FILLING;
    }

    // ===== Event Handlers =====

    /**
     * Handle pagination data arrival during initialization
     * Clears pending pagination flags based on which direction data arrived from
     *
     * @param info - Information about the data arrival including direction and counts
     */
    onPaginationDataArrived(info: DataArrivalInfo): void {
        if (!this.isInitializing()) return;

        console.log("[INIT-MANAGER-3] Pagination data arrived:", {
            direction: info.direction,
            isEndEmpty: info.isEndEmpty,
            isStartEmpty: info.isStartEmpty,
            itemsAddedAtEnd: info.itemsAddedAtEnd,
            itemsAddedAtStart: info.itemsAddedAtStart,
            itemsRemoved: info.itemsRemoved,
            newCount: info.newCount,
            oldCount: info.oldCount,
        });

        // Handle based on direction
        switch (info.direction) {
            case PaginationDirection.START:
                // Data arrived from start pagination
                console.log("[INIT-MANAGER-3] Clearing pendingStartRequest");
                this.state.pendingStartRequest = false;
                this.ctx.state.pendingStartRequest = false;

                // If empty response, mark start buffer as sufficient (no more data)
                if (info.isStartEmpty || info.itemsAddedAtStart === 0) {
                    console.log("[INIT-MANAGER-3] Start returned empty, marking start buffer sufficient");
                    this.state.isStartBufferSufficient = true;
                    this.ctx.state.isStartBufferSufficient = true;
                }
                break;

            case PaginationDirection.END:
                // Data arrived from end pagination
                console.log("[INIT-MANAGER-3] Clearing pendingEndRequest");
                this.state.pendingEndRequest = false;
                this.ctx.state.pendingEndRequest = false;

                // If empty response, mark end buffer as sufficient (no more data)
                if (info.isEndEmpty || info.itemsAddedAtEnd === 0) {
                    console.log("[INIT-MANAGER-3] End returned empty, marking end buffer sufficient");
                    this.state.isEndBufferSufficient = true;
                    this.ctx.state.isEndBufferSufficient = true;
                }
                break;

            case PaginationDirection.BOTH:
                // Data arrived in both directions (initial load or simultaneous pagination)
                console.log("[INIT-MANAGER-3] Clearing both pending flags");
                this.state.pendingStartRequest = false;
                this.state.pendingEndRequest = false;
                this.ctx.state.pendingStartRequest = false;
                this.ctx.state.pendingEndRequest = false;

                // Check for empty responses in each direction
                if (info.isStartEmpty || info.itemsAddedAtStart === 0) {
                    this.state.isStartBufferSufficient = true;
                    this.ctx.state.isStartBufferSufficient = true;
                }
                if (info.isEndEmpty || info.itemsAddedAtEnd === 0) {
                    this.state.isEndBufferSufficient = true;
                    this.ctx.state.isEndBufferSufficient = true;
                }
                break;

            case PaginationDirection.REPLACEMENT:
                // Complete data replacement (timeline switch)
                // Don't clear pending flags - let forced pagination re-evaluate
                console.log("[INIT-MANAGER-3] Data replacement detected, keeping pending flags for re-evaluation");
                break;

            case PaginationDirection.NONE:
                // No structural changes (content updates only)
                // Don't clear pending flags - pagination not complete
                console.log("[INIT-MANAGER-3] No structural changes, keeping pending flags");
                break;
        }

        // Clear request metadata after processing
        if (info.direction === PaginationDirection.START || info.direction === PaginationDirection.BOTH) {
            this.state.startRequestTimestamp = undefined;
            this.state.startRequestDataCount = undefined;
        }
        if (info.direction === PaginationDirection.END || info.direction === PaginationDirection.BOTH) {
            this.state.endRequestTimestamp = undefined;
            this.state.endRequestDataCount = undefined;
        }
    }

    /**
     * Handle MVCP adjustment during initialization
     * Resets stabilization frame counter
     */
    onMVCPAdjusted(): void {
        if (!this.isInitializing()) return;

        console.log("[INIT-MANAGER-4] MVCP adjusted, resetting stabilization counter");

        this.state.stabilizationFrames = 0;

        // Sync to InternalState
        this.ctx.state.stabilizationStableFrames = 0;
    }

    /**
     * Handle pagination request
     * Sets pending flag for the direction and tracks request metadata
     */
    onPaginationRequested(direction: "start" | "end", dataCount?: number): void {
        if (!this.isInitializing()) return;

        const timestamp = Date.now();

        console.log(`[INIT-MANAGER-5] Pagination requested for ${direction}, setting pending flag`, {
            dataCount,
            timestamp,
        });

        if (direction === "start") {
            this.state.pendingStartRequest = true;
            this.ctx.state.pendingStartRequest = true;
            this.state.startRequestTimestamp = timestamp;
            this.state.startRequestDataCount = dataCount;
        } else {
            this.state.pendingEndRequest = true;
            this.ctx.state.pendingEndRequest = true;
            this.state.endRequestTimestamp = timestamp;
            this.state.endRequestDataCount = dataCount;
        }
    }

    /**
     * Update buffer sufficiency flags
     * Called by forced pagination logic
     */
    updateBufferSufficiency(isStartSufficient: boolean, isEndSufficient: boolean): void {
        this.state.isStartBufferSufficient = isStartSufficient;
        this.state.isEndBufferSufficient = isEndSufficient;

        // Sync to InternalState
        this.ctx.state.isStartBufferSufficient = isStartSufficient;
        this.ctx.state.isEndBufferSufficient = isEndSufficient;
    }

    // ===== Stabilization =====

    /**
     * Increment stabilization frame counter
     */
    incrementStabilizationFrames(): void {
        this.state.stabilizationFrames++;
        this.ctx.state.stabilizationStableFrames = this.state.stabilizationFrames;
    }

    /**
     * Reset stabilization frame counter
     */
    resetStabilizationFrames(): void {
        this.state.stabilizationFrames = 0;
        this.ctx.state.stabilizationStableFrames = 0;
    }

    /**
     * Get current stabilization frame count
     */
    getStabilizationFrames(): number {
        return this.state.stabilizationFrames;
    }

    /**
     * Check if pending requests are active
     */
    hasPendingRequests(): boolean {
        return this.state.pendingStartRequest || this.state.pendingEndRequest;
    }

    /**
     * Get buffer sufficiency status
     */
    getBufferSufficiency(): {
        isStartBufferSufficient: boolean;
        isEndBufferSufficient: boolean;
    } {
        return {
            isEndBufferSufficient: this.state.isEndBufferSufficient,
            isStartBufferSufficient: this.state.isStartBufferSufficient,
        };
    }

    // ===== Buffer Forcing =====

    /**
     * Check buffer sufficiency and determine if forced pagination is needed
     * This centralizes the buffer forcing logic during initialization
     *
     * @returns Object indicating which pagination callbacks should be forced
     */
    checkAndForceBuffers(): {
        shouldForceStartReached: boolean;
        shouldForceEndReached: boolean;
    } {
        if (!this.isInitializing()) {
            return { shouldForceEndReached: false, shouldForceStartReached: false };
        }

        // Block forced pagination during SCROLLING phase
        if (this.state.phase === InitializationPhase.SCROLLING) {
            return { shouldForceEndReached: false, shouldForceStartReached: false };
        }

        const state = this.ctx.state;
        const contentSize = getContentSize(this.ctx);
        const { scroll, scrollLength } = state;
        const { hasMoreEnd, hasMoreStart, onEndReachedThreshold, onStartReachedThreshold } = state.props;

        // Get anchor position if available
        const anchorPosition = this.state.anchorId ? state.positions.get(this.state.anchorId) : undefined;

        // Build config for force pagination check
        const config: ForcePaginationConfig = {
            anchorPosition,
            contentSize,
            hasMoreEnd: hasMoreEnd ?? true,
            hasMoreStart: hasMoreStart ?? true,
            maintainScrollAtEnd: !!state.props.maintainScrollAtEnd,
            onEndReachedThreshold: onEndReachedThreshold ?? 0.5,
            onStartReachedThreshold: onStartReachedThreshold ?? 0.5,
            scroll,
            scrollLength,
        };

        // Check if buffers are sufficient and if pagination should be forced
        const result = checkForcePagination(config);

        // Update buffer sufficiency flags
        this.state.isStartBufferSufficient = result.isStartBufferSufficient;
        this.state.isEndBufferSufficient = result.isEndBufferSufficient;
        this.ctx.state.isStartBufferSufficient = result.isStartBufferSufficient;
        this.ctx.state.isEndBufferSufficient = result.isEndBufferSufficient;

        // For chat and chat-with-target modes, immediately mark end buffer as sufficient
        // These modes are on live timelines where we're already at the end and can only paginate backward
        if (this.state.mode === "chat" || this.state.mode === "chat-with-target") {
            this.state.isEndBufferSufficient = true;
            this.ctx.state.isEndBufferSufficient = true;
            console.log("[INIT-MANAGER-BUFFERS] Chat mode: marking end buffer as sufficient (live timeline)");
        }

        console.log("[INIT-MANAGER-BUFFERS] Buffer check complete:", {
            anchorPosition,
            contentSize,
            distanceFromAnchorToEnd: anchorPosition !== undefined ? contentSize - anchorPosition : undefined,
            distanceFromAnchorToStart: anchorPosition,
            isEndBufferSufficient: this.state.isEndBufferSufficient,
            isStartBufferSufficient: this.state.isStartBufferSufficient,
            mode: this.state.mode,
            shouldForceEndReached: result.shouldForceEndReached,
            shouldForceStartReached: result.shouldForceStartReached,
        });

        return {
            shouldForceEndReached: result.shouldForceEndReached ?? false,
            shouldForceStartReached: result.shouldForceStartReached ?? false,
        };
    }

    // ===== Stabilization Check =====

    /**
     * Check if initialization should complete based on stabilization criteria
     * This centralizes the stabilization detection logic
     *
     * @returns true if stabilization is complete and initialization exited
     */
    checkStabilization(): boolean {
        if (!this.isInitializing()) return false;

        // Check if viewport is filled (buffers sufficient AND no pending requests)
        const isViewportFilled =
            this.state.isStartBufferSufficient &&
            this.state.isEndBufferSufficient &&
            !this.state.pendingStartRequest &&
            !this.state.pendingEndRequest;

        if (isViewportFilled) {
            // Transition to STABILIZING phase if we're in FILLING
            if (this.state.phase === InitializationPhase.FILLING) {
                this.transitionToStabilizingPhase();
            }

            // Increment stable frame counter
            this.state.stabilizationFrames++;
            this.ctx.state.stabilizationStableFrames = this.state.stabilizationFrames;

            console.log("[INIT-MANAGER-STABILIZATION] Viewport filled, stable frames:", this.state.stabilizationFrames);

            // Check if we've reached 3 consecutive stable frames
            if (this.state.stabilizationFrames >= 3) {
                console.log("[INIT-MANAGER-STABILIZATION] Stabilization complete, exiting initialization");

                // Exit initialization mode
                this.exitInitialization();

                // Fire completion callback
                this.ctx.state.props.onStabilizationComplete?.();

                return true;
            }
        } else {
            // Reset counter if conditions are not met
            if (this.state.stabilizationFrames > 0) {
                console.log("[INIT-MANAGER-STABILIZATION] Conditions not met, resetting stable frames:", {
                    isEndBufferSufficient: this.state.isEndBufferSufficient,
                    isStartBufferSufficient: this.state.isStartBufferSufficient,
                    pendingEndRequest: this.state.pendingEndRequest,
                    pendingStartRequest: this.state.pendingStartRequest,
                });
                this.state.stabilizationFrames = 0;
                this.ctx.state.stabilizationStableFrames = 0;
            }
        }

        return false;
    }
}

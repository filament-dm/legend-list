/**
 * Initialization Manager
 *
 * Centralizes all initialization state and logic. The initialization system handles
 * scrolling to a specific timeline position (e.g., jumping to a message in chat history)
 * and stabilizing the viewport while items resize.
 *
 * This manager provides a single source of truth for initialization state and
 * clear interfaces for the rest of the system to interact with initialization behavior.
 */

import { MvcpMode, type StateContext, set$ } from "@/state/state";
import {
    type InitializationCompletionInfo,
    type InitializationConfig,
    InitializationCompletionType,
    InitializationMode,
    InitializationPhase,
    type InitializationState,
} from "./types";

/**
 * Manages initialization state and behavior
 */
export class InitializationManager {
    private state: InitializationState;
    private ctx: StateContext;
    private stabilizationCheckId: number | undefined;

    constructor(ctx: StateContext) {
        this.ctx = ctx;
        this.state = {
            anchorId: undefined,
            anchorIndex: undefined,
            didCompleteInitialScroll: false,
            didInitialRecenter: false,
            isImperative: false,
            mode: InitializationMode.IDLE,
            phase: InitializationPhase.IDLE,
            stabilizationFrames: 0,
            targetScroll: undefined,
            targetViewPosition: undefined,
            timelineId: undefined,
        };
    }

    // ===== Phase Management =====

    /**
     * Set MVCP mode declaratively based on initialization phase
     */
    private setMvcpMode(mode: MvcpMode): void {
        console.log(`[INIT-MVCP] Setting MVCP mode: ${mode}`);
        set$(this.ctx, "mvcpMode", mode);
    }

    /**
     * Enter initialization mode for a new timeline
     */
    enterInitialization(config: InitializationConfig): void {
        // Guard against re-entry while already initializing
        if (this.isInitializing()) {
            console.warn("[INIT-MANAGER] Already initializing, ignoring duplicate call");
            return;
        }

        // Detect mode from props and config using three-case logic
        let mode: InitializationMode;

        if (config.mode && config.mode !== InitializationMode.IDLE) {
            // Explicit mode provided in config
            mode = config.mode;
        } else {
            // Derive live timeline mode from both prop and timelineId to avoid timing issues
            // Props may lag behind timelineId changes, so check both sources
            const isLiveTimeline =
                this.ctx.state.props.maintainScrollAtEnd ||
                config.timelineId?.includes('live-timeline');

            if (!isLiveTimeline && config.anchorId) {
                // Case 1: Focused timeline - center target, paginate both directions
                mode = InitializationMode.MID_TIMELINE;
            } else if (isLiveTimeline && !config.anchorId) {
                // Case 2: Live timeline, no target - bottom position, paginate backward only
                mode = InitializationMode.CHAT;
            } else if (isLiveTimeline && config.anchorId) {
                // Case 3: Live timeline with target - attempt positioning, paginate backward only
                mode = InitializationMode.CHAT_WITH_TARGET;
            } else {
                // Fallback default (focused timeline without anchor)
                mode = InitializationMode.MID_TIMELINE;
            }
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
            timelineId: config.timelineId,
            detectedAsLiveTimeline: config.timelineId?.includes('live-timeline'),
            mode,
            targetViewPosition,
            isImperative: config.isImperative ?? false,
        });

        this.state.phase = InitializationPhase.SCROLLING;
        console.log("[INIT-PHASE] 🔄 Phase transition: IDLE → SCROLLING");
        this.state.mode = mode;
        this.state.timelineId = config.timelineId;
        this.state.anchorId = config.anchorId;
        this.state.targetViewPosition = targetViewPosition;
        this.state.isImperative = config.isImperative ?? false;
        this.state.didCompleteInitialScroll = false;
        this.state.didInitialRecenter = false;
        this.state.stabilizationFrames = 0;

        // Sync to InternalState
        this.ctx.state.isInitializing = true;

        // Only update lastTimelineId for prop-driven initialization
        // Imperative initialization (e.g., jumpToLatest) uses the current timeline
        // and doesn't trigger timeline change detection
        if (!config.isImperative) {
            this.ctx.state.lastTimelineId = config.timelineId;
        }

        this.ctx.state.stabilizationStableFrames = 0;

        // Set MVCP mode: disable during SCROLLING phase
        this.setMvcpMode(MvcpMode.NONE);
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
     * Transition from SCROLLING to STABILIZING phase - called after initial scroll completes
     * Skips FILLING phase since app provides sufficient data upfront (no pagination needed)
     */
    transitionToStabilizingPhase(): void {
        if (!this.isInitializing()) {
            console.warn("[INIT-PHASE] ❌ Cannot transition - not initializing");
            return;
        }

        const currentPhase = this.state.phase;
        console.log("[INIT-PHASE] 🔄 Phase transition: SCROLLING → STABILIZING", {
            currentPhase,
            expectedPhase: InitializationPhase.SCROLLING,
            isCorrectPhase: currentPhase === InitializationPhase.SCROLLING,
        });

        if (currentPhase !== InitializationPhase.SCROLLING) {
            console.warn("[INIT-PHASE] ⚠️ Unexpected phase transition - expected SCROLLING", {
                actualPhase: currentPhase,
            });
        }

        // Skip FILLING phase - app provides sufficient data upfront, no pagination needed
        this.state.phase = InitializationPhase.STABILIZING;
        // Set MVCP mode: enable initialization MVCP during STABILIZING phase
        this.setMvcpMode(MvcpMode.INITIALIZATION);
		console.log("[INIT-PHASE-STABILIZING] MVCP set to INITIALIZATION mode for STABILIZING phase");
		console.log("[INIT-PHASE-STABILIZING] Triggering items in view calculation to apply initialization MVCP");
		this.ctx.state.triggerCalculateItemsInView?.({ doMVCP: true, forceFullItemPositions: true });

		// Start continuous stabilization checking loop
		this.startStabilizationLoop();
    }


    /**
     * Exit initialization mode
     * @param completionInfo - Information about how/why initialization completed
     */
    exitInitialization(completionInfo?: InitializationCompletionInfo): void {
        const currentPhase = this.state.phase;
        const currentMode = this.state.mode;
        const timelineId = this.state.timelineId;
        const isImperative = this.state.isImperative;

        console.log("[INIT-PHASE] 🔄 Phase transition: → IDLE (EXIT)", {
            currentPhase,
            completionInfo,
            note: "Simplified mode - exiting from any phase",
        });

        console.log("[INIT-MANAGER-2] 🎉 Exiting initialization mode - returning to normal operation");

        // Stop stabilization loop if running
        this.stopStabilizationLoop();

        this.state.phase = InitializationPhase.IDLE;
        this.state.mode = InitializationMode.IDLE;
        this.state.timelineId = undefined;
        this.state.anchorId = undefined;
        this.state.anchorIndex = undefined;
        this.state.targetScroll = undefined;
        this.state.targetViewPosition = undefined;
        this.state.isImperative = false;
        this.state.didCompleteInitialScroll = false;
        this.state.didInitialRecenter = false;
        this.state.stabilizationFrames = 0;

        // Sync to InternalState
        this.ctx.state.isInitializing = false;
        this.ctx.state.stabilizationStableFrames = 0;
        this.ctx.state.initialAnchor = undefined;

        // Set MVCP mode: restore regular MVCP after initialization
        this.setMvcpMode(MvcpMode.REGULAR);

        // Build completion info with defaults if not provided
        const info: InitializationCompletionInfo = completionInfo || {
            type: InitializationCompletionType.FAILED,
            mode: currentMode,
            reason: "exitInitialization called without completion info",
            timelineId,
            isImperative,
        };

        this.ctx.state.props.onInitializationComplete?.(info);
    }

    /**
     * Start the stabilization checking loop
     * Continuously checks for stable frames using requestAnimationFrame
     */
    private startStabilizationLoop(): void {
        // Cancel any existing loop
        this.stopStabilizationLoop();

        console.log("[INIT-STABILIZATION-LOOP] Starting stabilization checking loop");

        const checkFrame = () => {
            // Stop if no longer in STABILIZING phase
            if (this.state.phase !== InitializationPhase.STABILIZING) {
                console.log("[INIT-STABILIZATION-LOOP] Stopping - no longer in STABILIZING phase");
                this.stopStabilizationLoop();
                return;
            }

            // Trigger calculateItemsInView which will call checkStabilization
            this.ctx.state.triggerCalculateItemsInView?.({ doMVCP: true });

            // Schedule next check
            this.stabilizationCheckId = requestAnimationFrame(checkFrame);
        };

        // Start the loop
        this.stabilizationCheckId = requestAnimationFrame(checkFrame);
    }

    /**
     * Stop the stabilization checking loop
     */
    private stopStabilizationLoop(): void {
        if (this.stabilizationCheckId !== undefined) {
            console.log("[INIT-STABILIZATION-LOOP] Stopping stabilization checking loop");
            cancelAnimationFrame(this.stabilizationCheckId);
            this.stabilizationCheckId = undefined;
        }
    }

    // ===== State Queries =====

    /**
     * Check if initialization is active
     */
    isInitializing(): boolean {
        return this.state.phase !== InitializationPhase.IDLE;
    }

    /**
     * Get the current initialization mode
     */
    getMode(): InitializationMode {
        return this.state.mode;
    }

    /**
     * Check if current initialization is imperative (e.g., from jumpToLatest())
     * Returns false if not initializing
     */
    isImperativeInit(): boolean {
        return this.isInitializing() && this.state.isImperative;
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
        if (!this.isInitializing() || !this.state.anchorId) {
			return false;
		}

        // Don't lock during SCROLLING phase - wait for initial scroll to complete
        if (this.state.phase === InitializationPhase.SCROLLING || !this.state.didCompleteInitialScroll) {
			return false;
		}

        // Check if anchor is ready (exists in data and has position)
        const anchorIndex = this.ctx.state.indexByKey.get(this.state.anchorId);
        const hasPosition = this.ctx.state.positions.has(this.state.anchorId);

        // Detect anchor loss - exit initialization gracefully if anchor was removed
        if (anchorIndex === undefined) {
            console.warn("[INIT-MVCP] Anchor lost during initialization, exiting gracefully");
            this.exitInitialization({
                type: InitializationCompletionType.FAILED,
                mode: this.state.mode,
                reason: "Anchor lost during initialization",
                timelineId: this.state.timelineId,
                isImperative: this.state.isImperative,
            });
            return false;
        }

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


    // ===== Event Handlers =====

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
     * Handle MVCP adjustment during initialization
     * Resets stabilization frame counter when scroll position is adjusted significantly.
     *
     * Note: Called from requestAdjust() only for adjustments > 1px to avoid infinite
     * loops caused by sub-pixel position changes during data updates.
     */
    onMVCPAdjusted(): void {
        if (!this.isInitializing()) return;

        console.log("[INIT-MANAGER] MVCP adjusted, resetting stabilization counter");

        this.state.stabilizationFrames = 0;
        this.ctx.state.stabilizationStableFrames = 0;
    }

    // ===== Stabilization Check =====

    /**
     * After initial layout, items may resize or shift due to images loading, fonts rendering,
	 * url previews expanding, etc. This can cause the target message to move away from the
	 * intended viewport position. During STABILIZING phase, initializationMVCP is active to
	 * keep the target item at the correct viewport position.
	 *
	 * This method counts 3 consecutive stable frames (no MVCP adjustments needed) before
	 * declaring initialization complete. The counter is reset by onMVCPAdjusted() whenever
	 * scroll position needs adjustment due to item resizing.
     *
     * @returns true if stabilization is complete and initialization exited
     */
    checkStabilization(): boolean {
        if (!this.isInitializing()) {
            return false;
        }

        // Only stabilize during STABILIZING phase
        if (this.state.phase !== InitializationPhase.STABILIZING) {
            return false;
        }

        // Increment stable frame counter
        // This gets reset by onMVCPAdjusted() if scroll position needs adjustment
        this.state.stabilizationFrames++;
        this.ctx.state.stabilizationStableFrames = this.state.stabilizationFrames;

        console.log("[INIT-STABILIZATION] 📊 Stable frames:", {
            count: this.state.stabilizationFrames,
            needed: 3,
            remaining: 3 - this.state.stabilizationFrames,
        });

        // Check if we've reached 3 consecutive stable frames
        if (this.state.stabilizationFrames >= 3) {
            console.log("[INIT-STABILIZATION] 🎉 Stabilization complete! Exiting initialization");

            // Determine completion type based on mode
            let completionType: InitializationCompletionType;
            switch (this.state.mode) {
                case InitializationMode.MID_TIMELINE:
                    completionType = InitializationCompletionType.STABILIZED_MID_TIMELINE;
                    break;
                case InitializationMode.CHAT:
                    completionType = InitializationCompletionType.STABILIZED_CHAT;
                    break;
                case InitializationMode.CHAT_WITH_TARGET:
                    completionType = InitializationCompletionType.STABILIZED_CHAT_WITH_TARGET;
                    break;
                default:
                    completionType = InitializationCompletionType.FAILED;
                    break;
            }

            // Exit initialization mode (this will also fire onInitializationComplete callback)
            this.exitInitialization({
                type: completionType,
                mode: this.state.mode,
                timelineId: this.state.timelineId,
                isImperative: this.state.isImperative,
            });

            return true;
        }

        return false;
    }
}

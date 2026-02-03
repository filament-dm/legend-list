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

    // ===== Debug Helper =====

    /**
     * Check if debug logging is enabled for initialization
     */
    private shouldLog(): boolean {
        return this.ctx.state.props.debugInitialization;
    }

    // ===== Phase Management =====

    /**
     * Set MVCP mode declaratively based on initialization phase
     */
    private setMvcpMode(mode: MvcpMode): void {
        set$(this.ctx, "mvcpMode", mode);
    }

    /**
     * Enter initialization mode for a new timeline
     */
    enterInitialization(config: InitializationConfig): void {
        if (this.shouldLog()) {
            console.log('[InitializationManager] enterInitialization called', {
                config,
                currentPhase: this.state.phase,
                currentMode: this.state.mode,
                isAlreadyInitializing: this.isInitializing(),
            });
        }

        // Guard against re-entry while already initializing
        if (this.isInitializing()) {
            if (this.shouldLog()) {
                console.log('[InitializationManager] Already initializing, ignoring re-entry');
            }
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

        this.state.phase = InitializationPhase.SCROLLING;
        this.state.mode = mode;
        this.state.timelineId = config.timelineId;
        this.state.anchorId = config.anchorId;
        this.state.targetViewPosition = targetViewPosition;
        this.state.isImperative = config.isImperative ?? false;
        this.state.didCompleteInitialScroll = false;
        this.state.didInitialRecenter = false;
        this.state.stabilizationFrames = 0;

        if (this.shouldLog()) {
            console.log('[InitializationManager] Initialization state set', {
                phase: this.state.phase,
                mode: this.state.mode,
                timelineId: this.state.timelineId,
                anchorId: this.state.anchorId,
                targetViewPosition: this.state.targetViewPosition,
                isImperative: this.state.isImperative,
            });
        }

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

        if (this.shouldLog()) {
            console.log('[InitializationManager] MVCP mode set to NONE for SCROLLING phase');
        }
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
        if (this.shouldLog()) {
            console.log('[InitializationManager] prepareInitialScroll called', {
                isInitializing: this.isInitializing(),
                dataLength: data?.length ?? 0,
                anchorId: this.state.anchorId,
                phase: this.state.phase,
            });
        }

        if (!this.isInitializing()) {
            if (this.shouldLog()) {
                console.log('[InitializationManager] Not initializing, skipping prepareInitialScroll');
            }
            return false;
        }

        // Wait for initial data to arrive
        if (!data || data.length === 0) {
            if (this.shouldLog()) {
                console.log('[InitializationManager] No data available, skipping prepareInitialScroll');
            }
            return false;
        }

        // If no anchor, we're in chat mode - scroll to bottom (most recent message)
        if (!this.state.anchorId) {
            const lastIndex = Math.max(0, data.length - 1);
            this.ctx.state.initialScroll = {
                index: lastIndex,
                viewPosition: this.state.targetViewPosition ?? 1.0,
            };
            if (this.shouldLog()) {
                console.log('[InitializationManager] Chat mode - scrolling to bottom', {
                    lastIndex,
                    viewPosition: this.state.targetViewPosition ?? 1.0,
                });
            }
            return true;
        }

        // Find anchor in data
        const anchorIndex = data.findIndex((item, index) => keyExtractor(item, index) === this.state.anchorId);

        if (anchorIndex >= 0) {
            // Anchor found - set initial scroll
            this.ctx.state.initialScroll = {
                index: anchorIndex,
                viewPosition: this.state.targetViewPosition ?? 0.5,
            };
            if (this.shouldLog()) {
                console.log('[InitializationManager] Anchor found - setting initial scroll', {
                    anchorIndex,
                    viewPosition: this.state.targetViewPosition ?? 0.5,
                });
            }
            return true;
        }

        if (this.shouldLog()) {
            console.log('[InitializationManager] Anchor not found, applying fallback', {
                mode: this.state.mode,
                anchorId: this.state.anchorId,
            });
        }

        if (this.state.mode === "chat-with-target") {
            // Fallback: chat-with-target → chat (scroll to bottom)
            this.state.mode = InitializationMode.CHAT;
            this.state.targetViewPosition = 1.0;
            this.state.anchorId = undefined; // Clear anchor since it's not found

            const lastIndex = Math.max(0, data.length - 1);
            this.ctx.state.initialScroll = {
                index: lastIndex,
                viewPosition: 1.0,
            };
            if (this.shouldLog()) {
                console.log('[InitializationManager] Fallback to CHAT mode - scrolling to bottom', { lastIndex });
            }
            return true;
        }

        if (this.state.mode === InitializationMode.MID_TIMELINE) {
            // Fallback: mid-timeline → anchor to middle item on screen
            const middleIndex = Math.floor(data.length / 2);
            // Update anchor to the fallback item
            this.state.anchorId = keyExtractor(data[middleIndex], middleIndex);
            this.ctx.state.initialScroll = {
                index: middleIndex,
                viewPosition: 0.5,
            };
            if (this.shouldLog()) {
                console.log('[InitializationManager] Fallback to middle item', { middleIndex, anchorId: this.state.anchorId });
            }
            return true;
        }

        if (this.shouldLog()) {
            console.log('[InitializationManager] WARNING: No fallback matched, returning false');
        }
        // Should not reach here, but provide safe fallback
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
            return;
        }
        this.state.phase = InitializationPhase.SCROLLING;
    }

    /**
     * Transition from SCROLLING to STABILIZING phase - called after initial scroll completes
     * Skips FILLING phase since app provides sufficient data upfront (no pagination needed)
     */
    transitionToStabilizingPhase(): void {
        if (this.shouldLog()) {
            console.log('[InitializationManager] transitionToStabilizingPhase called', {
                isInitializing: this.isInitializing(),
                currentPhase: this.state.phase,
                mode: this.state.mode,
            });
        }

        if (!this.isInitializing()) {
            if (this.shouldLog()) {
                console.log('[InitializationManager] Not initializing, ignoring transition');
            }
            return;
        }

        // Guard against re-entry - prevent double-transition
        if (this.state.phase === InitializationPhase.STABILIZING) {
            if (this.shouldLog()) {
                console.log('[InitializationManager] Already in STABILIZING phase, ignoring transition');
            }
            return;
        }

        this.state.phase = InitializationPhase.STABILIZING;

        if (this.shouldLog()) {
            console.log('[InitializationManager] Transitioned to STABILIZING phase');
        }

        // Set MVCP mode: enable initialization MVCP during STABILIZING phase
        this.setMvcpMode(MvcpMode.INITIALIZATION);
        if (this.shouldLog()) {
            console.log('[InitializationManager] MVCP mode set to INITIALIZATION');
        }

		this.ctx.state.triggerCalculateItemsInView?.({ doMVCP: true, forceFullItemPositions: true });
        if (this.shouldLog()) {
            console.log('[InitializationManager] Triggered calculateItemsInView with MVCP');
        }

		// Start continuous stabilization checking loop
		this.startStabilizationLoop();
        if (this.shouldLog()) {
            console.log('[InitializationManager] Started stabilization loop');
        }
    }


    /**
     * Exit initialization mode
     * @param completionInfo - Information about how/why initialization completed
     */
    exitInitialization(completionInfo?: InitializationCompletionInfo): void {
        if (this.shouldLog()) {
            console.log('[InitializationManager] exitInitialization called', {
                currentPhase: this.state.phase,
                currentMode: this.state.mode,
                completionType: completionInfo?.type,
                stabilizationFrames: this.state.stabilizationFrames,
            });
        }

        const timelineId = this.state.timelineId;
        const isImperative = this.state.isImperative;

        // Stop stabilization loop if running
        this.stopStabilizationLoop();
        if (this.shouldLog()) {
            console.log('[InitializationManager] Stopped stabilization loop');
        }

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
        if (this.shouldLog()) {
            console.log('[InitializationManager] MVCP mode restored to REGULAR');
        }

        // Build completion info with defaults if not provided
        const info: InitializationCompletionInfo = completionInfo || {
            type: InitializationCompletionType.FAILED,
            mode: this.state.mode,
            reason: "exitInitialization called without completion info",
            timelineId,
            isImperative,
        };

        if (this.shouldLog()) {
            console.log('[InitializationManager] Calling onInitializationComplete', { info });
        }
        this.ctx.state.props.onInitializationComplete?.(info);
        if (this.shouldLog()) {
            console.log('[InitializationManager] Initialization complete');
        }
    }

    /**
     * Start the stabilization checking loop
     * Continuously checks for stable frames using requestAnimationFrame
     */
    private startStabilizationLoop(): void {
        // Cancel any existing loop
        this.stopStabilizationLoop();

        const checkFrame = () => {
            // Stop if no longer in STABILIZING phase
            if (this.state.phase !== InitializationPhase.STABILIZING) {
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

        this.state.didCompleteInitialScroll = true;
    }

    /**
     * Mark that initial re-centering has been performed
     */
    markRecenterComplete(): void {
        if (!this.isInitializing()) return;
        
        this.state.didInitialRecenter = true;
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
     * Handle MVCP adjustment during initialization
     * Resets stabilization frame counter when scroll position is adjusted significantly.
     *
     * Note: Called from requestAdjust() only for adjustments > 1px to avoid infinite
     * loops caused by sub-pixel position changes during data updates.
     */
    onMVCPAdjusted(): void {
        if (!this.isInitializing()) return;

        if (this.shouldLog()) {
            console.log('[InitializationManager] MVCP adjusted - resetting stabilization counter', {
                previousFrames: this.state.stabilizationFrames,
                phase: this.state.phase,
            });
        }

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
        if (this.shouldLog()) {
            console.log('[InitializationManager] checkStabilization called', {
                isInitializing: this.isInitializing(),
                phase: this.state.phase,
                stabilizationFrames: this.state.stabilizationFrames,
            });
        }

        if (!this.isInitializing()) {
            if (this.shouldLog()) {
                console.log('[InitializationManager] Not initializing, skipping stabilization check');
            }
            return false;
        }

        // Only stabilize during STABILIZING phase
        if (this.state.phase !== InitializationPhase.STABILIZING) {
            if (this.shouldLog()) {
                console.log('[InitializationManager] Not in STABILIZING phase, skipping check');
            }
            return false;
        }

        // Increment stable frame counter
        // This gets reset by onMVCPAdjusted() if scroll position needs adjustment
        this.state.stabilizationFrames++;
        this.ctx.state.stabilizationStableFrames = this.state.stabilizationFrames;

        if (this.shouldLog()) {
            console.log('[InitializationManager] Incremented stable frames', {
                stabilizationFrames: this.state.stabilizationFrames,
                needsMore: this.state.stabilizationFrames < 3,
            });
        }

        // Check if we've reached 3 consecutive stable frames
        if (this.state.stabilizationFrames >= 3) {
            if (this.shouldLog()) {
                console.log('[InitializationManager] 3 stable frames reached, completing initialization');
            }
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

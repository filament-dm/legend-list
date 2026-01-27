import { calculateItemsInView } from "@/core/calculateItemsInView";
import type { StateContext } from "@/state/state";
import type { InternalState } from "@/types";
import { updateAlignItemsPaddingTop } from "@/utils/updateAlignItemsPaddingTop";

// Number of consecutive stable frames required before exiting initialization
// Prevents flickering caused by rapid threshold state changes
const STABILIZATION_FRAME_COUNT = 3;

/**
 * Checks if stabilization has completed (viewport has been filled with enough content)
 * and fires the onStabilizationComplete callback.
 *
 * Stabilization is complete when:
 * 1. Each direction (start/end) is satisfied by EITHER:
 *    - The pagination threshold is satisfied (isEndReached/isStartReached === true), OR
 *    - No more data exists in that direction (hasMoreEnd/hasMoreStart === false)
 * 2. No pending pagination requests are in flight
 *
 * This allows stabilization to complete in mid-timeline scenarios where the viewport
 * is filled but neither threshold can be satisfied because we're in the middle of
 * available data.
 *
 * Uses debouncing (3 consecutive stable frames) to ensure stability before firing
 * the callback and exiting initialization mode.
 *
 * Should be called after threshold checks update isEndReached/isStartReached.
 */
export function checkStabilizationComplete(state: InternalState, ctx?: StateContext): void {
    // Only check for stabilization completion when in initialization mode
    if (!state.isInitializing) {
        return;
    }

    const { isEndReached, isStartReached, pendingStartRequest, pendingEndRequest, props } = state;
    const { hasMoreEnd, hasMoreStart } = props;

    // A direction is "complete" if the buffer is sufficient (distance ≥ threshold × 1.3)
    // OR no more data exists in that direction
    const isEndComplete = state.isEndBufferSufficient;
    const isStartComplete = state.isStartBufferSufficient;

    console.log("[STABLE-1] Checking stabilization conditions:", {
        hasMoreEnd,
        hasMoreStart,
        isEndBufferSufficient: state.isEndBufferSufficient,
        isEndComplete,
        isEndReached,
        isStartBufferSufficient: state.isStartBufferSufficient,
        isStartComplete,
        isStartReached,
        pendingEndRequest,
        pendingStartRequest,
        requiredFrames: STABILIZATION_FRAME_COUNT,
        stabilizationStableFrames: state.stabilizationStableFrames ?? 0,
    });

    // Check if viewport is filled (both directions complete)
    // AND no pending pagination requests (prevents premature stabilization during async data loads)
    const isViewportFilled = isEndComplete && isStartComplete && !pendingStartRequest && !pendingEndRequest;

    if (isViewportFilled) {
        // Increment stable frame counter
        state.stabilizationStableFrames = (state.stabilizationStableFrames ?? 0) + 1;
        console.log("[STABLE-2] Viewport filled! Incrementing stable frame counter:", {
            requiredFrames: STABILIZATION_FRAME_COUNT,
            stableFrames: state.stabilizationStableFrames,
            willComplete: state.stabilizationStableFrames >= STABILIZATION_FRAME_COUNT,
        });

        // Fire callback and exit initialization mode after N consecutive stable frames
        if (state.stabilizationStableFrames >= STABILIZATION_FRAME_COUNT) {
            console.log("[STABLE-3] 🎉 STABILIZATION COMPLETE! Exiting initialization mode");
            state.isInitializing = false;
            state.stabilizationStableFrames = 0;
            state.initialAnchor = undefined; // Stop re-centering

            // Now that initialization is complete, calculate alignItemsPaddingTop if needed
            // Then force recalculation of item positions to account for the updated padding
            if (ctx && state.props.alignItemsAtEnd) {
                console.log("[STABLE-4] Updating alignItemsPaddingTop for alignItemsAtEnd mode");
                updateAlignItemsPaddingTop(ctx);
                // Force full position recalculation to move containers from POSITION_OUT_OF_VIEW
                // to their correct visible positions with the updated padding
                calculateItemsInView(ctx, { forceFullItemPositions: true });
            }

            console.log("[STABLE-5] Calling onStabilizationComplete callback");
            state.props.onStabilizationComplete?.();
        }
    } else {
        // Reset counter if we're not stable anymore
        if (state.stabilizationStableFrames > 0) {
            console.log("[STABLE-6] NOT stable anymore, resetting counter:", {
                from: state.stabilizationStableFrames,
                reason: {
                    isEndComplete,
                    isStartComplete,
                    pendingEndRequest,
                    pendingStartRequest,
                },
                to: 0,
            });
        }
        state.stabilizationStableFrames = 0;
    }
}

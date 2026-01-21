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
 * Stabilization is complete when both isEndReached and isStartReached are true,
 * indicating that sufficient content has been loaded to fill the viewport and pagination
 * buffers in both directions.
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

    const { isEndReached, isStartReached } = state;

    // Check if viewport is filled (both pagination thresholds satisfied)
    const isViewportFilled = isEndReached === true && isStartReached === true;

    if (isViewportFilled) {
        // Increment stable frame counter
        state.stabilizationStableFrames = (state.stabilizationStableFrames ?? 0) + 1;

        // Fire callback and exit initialization mode after N consecutive stable frames
        if (state.stabilizationStableFrames >= STABILIZATION_FRAME_COUNT) {
            state.isInitializing = false;
            state.stabilizationStableFrames = 0;

            // Now that initialization is complete, calculate alignItemsPaddingTop if needed
            // Then force recalculation of item positions to account for the updated padding
            if (ctx && state.props.alignItemsAtEnd) {
                updateAlignItemsPaddingTop(ctx);
                // Force full position recalculation to move containers from POSITION_OUT_OF_VIEW
                // to their correct visible positions with the updated padding
                calculateItemsInView(ctx, { forceFullItemPositions: true });
            }

            state.props.onStabilizationComplete?.();
        }
    } else {
        // Reset counter if we're not stable anymore
        state.stabilizationStableFrames = 0;
    }
}

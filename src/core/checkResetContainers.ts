import { calculateItemsInView } from "@/core/calculateItemsInView";
import { doMaintainScrollAtEnd } from "@/core/doMaintainScrollAtEnd";
import { getContentSize } from "@/state/getContentSize";
import type { StateContext } from "@/state/state";
import type { MaintainScrollAtEndOptions } from "@/types";
import { checkAtBottom } from "@/utils/checkAtBottom";
import { checkAtTop } from "@/utils/checkAtTop";
import { updateAveragesOnDataChange } from "@/utils/updateAveragesOnDataChange";

export function checkResetContainers(ctx: StateContext, dataProp: readonly unknown[]) {
    const state = ctx.state;
    const { previousData } = state;
    // Preserve averages for items that are considered equal before updating data
    if (previousData) {
        updateAveragesOnDataChange(state, previousData, dataProp);
    }
    const { maintainScrollAtEnd } = state.props;

    calculateItemsInView(ctx, { dataChanged: true, doMVCP: true });

    const shouldMaintainScrollAtEnd =
        maintainScrollAtEnd === true || (maintainScrollAtEnd as MaintainScrollAtEndOptions).onDataChange;

    const didMaintainScrollAtEnd = shouldMaintainScrollAtEnd && doMaintainScrollAtEnd(ctx, false);

    // Automatic viewport filling: Paginate until content extends beyond threshold zones
    // This ensures the threshold state machine can properly initialize (null → false transition)
    const contentSize = getContentSize(ctx);
    const { scrollLength, scroll } = state;
    const { onEndReachedThreshold, onStartReachedThreshold } = state.props;

    // Use hysteresis multiplier (1.3) to guarantee we're outside the threshold zone
    // This prevents immediate re-entry after the user scrolls slightly
    const HYSTERESIS = 1.3;

    // Calculate thresholds with safety margin
    const endThreshold = (onEndReachedThreshold ?? 0.5) * scrollLength;
    const startThreshold = (onStartReachedThreshold ?? 0.5) * scrollLength;

    // Measure actual distances from each edge
    const distanceFromEnd = contentSize - scroll - scrollLength;
    const distanceFromStart = scroll;

    // Determine which directions need more content
    if (maintainScrollAtEnd) {
        // Live chat: only need backward buffer (older messages at index 0)
        // User is at bottom visually, should only check top threshold (start)
        const needsStartBuffer = distanceFromStart < startThreshold * HYSTERESIS;
        if (needsStartBuffer) {
            state.isStartReached = false;
        }
    } else {
        // Mid-timeline: check BOTH directions independently
        // Must ensure buffer on both sides to position outside threshold zones
        const needsEndBuffer = distanceFromEnd < endThreshold * HYSTERESIS;
        const needsStartBuffer = distanceFromStart < startThreshold * HYSTERESIS;

        if (needsEndBuffer) {
            state.isEndReached = false;
        }
        if (needsStartBuffer) {
            state.isStartReached = false;
        }
    }

    // Check thresholds if we didn't just maintain scroll OR if the relevant direction needs filling
    const needsThresholdCheck = maintainScrollAtEnd
        ? !didMaintainScrollAtEnd || distanceFromStart < startThreshold * HYSTERESIS
        : !didMaintainScrollAtEnd ||
          distanceFromEnd < endThreshold * HYSTERESIS ||
          distanceFromStart < startThreshold * HYSTERESIS;

    if (needsThresholdCheck) {
        checkAtTop(state);
        if (!maintainScrollAtEnd) {
            checkAtBottom(ctx);
        }
    }

    delete state.previousData;
}

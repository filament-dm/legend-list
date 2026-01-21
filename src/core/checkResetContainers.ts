import { calculateItemsInView } from "@/core/calculateItemsInView";
import { doMaintainScrollAtEnd } from "@/core/doMaintainScrollAtEnd";
import { getContentSize } from "@/state/getContentSize";
import type { StateContext } from "@/state/state";
import type { MaintainScrollAtEndOptions } from "@/types";
import { checkAtBottom } from "@/utils/checkAtBottom";
import { checkAtTop } from "@/utils/checkAtTop";
import { checkStabilizationComplete } from "@/utils/checkStabilizationComplete";
import { HYSTERESIS_MULTIPLIER } from "@/utils/checkThreshold";
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

    // Always check thresholds after data changes to allow state machine to progress
    checkAtTop(state, ctx);
    checkAtBottom(ctx);

    // During initialization: Force pagination until viewport is filled
    // This drives the paginate-until-full loop by forcing flags to false
    // when content is insufficient, ensuring callbacks fire again after each data load
    if (state.isInitializing) {
        const contentSize = getContentSize(ctx);
        const { scrollLength, scroll } = state;
        const { onEndReachedThreshold, onStartReachedThreshold } = state.props;

        // Use hysteresis multiplier to guarantee we're outside the threshold zone
        // Content must extend beyond: scroll + viewport + (threshold * 130%)
        const endThreshold = (onEndReachedThreshold ?? 0.5) * scrollLength;
        const startThreshold = (onStartReachedThreshold ?? 0.5) * scrollLength;

        const distanceFromEnd = contentSize - scroll - scrollLength;
        const distanceFromStart = scroll;

        if (maintainScrollAtEnd) {
            // Live chat: only need backward buffer (older messages at index 0)
            const needsStartBuffer = distanceFromStart < startThreshold * HYSTERESIS_MULTIPLIER;
            if (needsStartBuffer) {
                state.isStartReached = false;
            }
        } else {
            // Mid-timeline: check both directions independently
            const needsEndBuffer = distanceFromEnd < endThreshold * HYSTERESIS_MULTIPLIER;
            const needsStartBuffer = distanceFromStart < startThreshold * HYSTERESIS_MULTIPLIER;

            if (needsEndBuffer) {
                state.isEndReached = false;
            }
            if (needsStartBuffer) {
                state.isStartReached = false;
            }
        }
    }

    // Check if stabilization completed and fire callback
    checkStabilizationComplete(state, ctx);

    delete state.previousData;
}

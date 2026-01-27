import { calculateItemsInView } from "@/core/calculateItemsInView";
import { doMaintainScrollAtEnd } from "@/core/doMaintainScrollAtEnd";
import { detectDataDirection } from "@/core/initialization/detectDataDirection";
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

    // Detect pagination direction and update pending flags when data arrives during initialization
    if (state.isInitializing && previousData) {
        const keyExtractor = state.props.keyExtractor || ((item: unknown, index: number) => String(index));
        const arrivalInfo = detectDataDirection(previousData, dataProp, keyExtractor);

        // Delegate to InitializationManager to handle directional flag clearing
        ctx.initializationManager.onPaginationDataArrived(arrivalInfo);
    }

    calculateItemsInView(ctx, { dataChanged: true, doMVCP: true });

    // Note: Re-centering during initialization is now handled by mvcpInitialization.ts
    // which continuously maintains the anchor at the target viewport position.
    // This is more efficient than the previous approach which used scrollToIndex
    // to re-center after each data change.

    const shouldMaintainScrollAtEnd =
        maintainScrollAtEnd === true || (maintainScrollAtEnd as MaintainScrollAtEndOptions).onDataChange;

    if (shouldMaintainScrollAtEnd) {
        doMaintainScrollAtEnd(ctx, false);
    }

    // Always check thresholds after data changes to allow state machine to progress
    checkAtTop(state, ctx);
    checkAtBottom(ctx);

    // During initialization: Force pagination until viewport is filled
    if (state.isInitializing) {
        const result = ctx.initializationManager.checkAndForceBuffers();

        if (result.shouldForceStartReached) {
            state.isStartReached = false;
            state.pendingStartRequest = true;
        }

        if (result.shouldForceEndReached) {
            state.isEndReached = false;
            state.pendingEndRequest = true;
        }
    }

    // Check if stabilization completed and fire callback
    ctx.initializationManager.checkStabilization();

    delete state.previousData;
}

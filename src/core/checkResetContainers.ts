import { calculateItemsInView } from "@/core/calculateItemsInView";
import { doMaintainScrollAtEnd } from "@/core/doMaintainScrollAtEnd";
import type { StateContext } from "@/state/state";
import type { MaintainScrollAtEndOptions } from "@/types.base";
import { checkThresholds } from "@/utils/checkThresholds";
import { updateAveragesOnDataChange } from "@/utils/updateAveragesOnDataChange";

export function checkResetContainers(ctx: StateContext, dataProp: readonly unknown[]) {
    const state = ctx.state;
    const { previousData } = state;
    // Preserve averages for items that are considered equal before updating data
    if (previousData) {
        updateAveragesOnDataChange(state, previousData, dataProp);
    }
    const { maintainScrollAtEnd, debugSizing } = state.props;

    if (debugSizing) {
        console.log("[DRIFT DEBUG] Data changed, calling calculateItemsInView:", {
            dataChangeNeedsScrollUpdate: state.dataChangeNeedsScrollUpdate,
            mvcpAnchorLock: state.mvcpAnchorLock ? "ACTIVE" : "none",
            mvcpAnchorLockExpires: state.mvcpAnchorLock?.expiresAt,
            newLength: dataProp.length,
            prevLength: previousData?.length,
            timestamp: Date.now(),
        });
    }

    calculateItemsInView(ctx, { dataChanged: true, doMVCP: true });

    const shouldMaintainScrollAtEnd =
        maintainScrollAtEnd === true || (maintainScrollAtEnd as MaintainScrollAtEndOptions).onDataChange;

    const didMaintainScrollAtEnd = shouldMaintainScrollAtEnd && doMaintainScrollAtEnd(ctx, false);

    // Reset the endReached flag if new data has been added and we didn't
    // just maintain the scroll at end
    if (!didMaintainScrollAtEnd && previousData && dataProp.length > previousData.length) {
        state.isEndReached = false;
    }

    if (!didMaintainScrollAtEnd) {
        checkThresholds(ctx);
    }

    state.previousData = dataProp;
}

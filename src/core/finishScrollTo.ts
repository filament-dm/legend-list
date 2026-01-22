import { addTotalSize } from "@/core/addTotalSize";
import { PlatformAdjustBreaksScroll } from "@/platform/Platform";
import type { StateContext } from "@/state/state";
import { setInitialRenderState } from "@/utils/setInitialRenderState";

export function finishScrollTo(ctx: StateContext) {
    const state = ctx.state;

    if (state?.scrollingTo) {
        // Save scrollingTo before clearing it so we can pass it to commitPendingAdjust
        const scrollingTo = state.scrollingTo;
        const callback = scrollingTo.onSettled;

        state.scrollHistory.length = 0;
        state.initialScroll = undefined;
        state.initialAnchor = undefined;
        state.scrollingTo = undefined;

        if (state.pendingTotalSize !== undefined) {
            addTotalSize(ctx, null, state.pendingTotalSize);
        }

        if (state.props?.data) {
            state.triggerCalculateItemsInView?.({ doMVCP: true, forceFullItemPositions: true });
        }

        if (PlatformAdjustBreaksScroll) {
            state.scrollAdjustHandler.commitPendingAdjust(scrollingTo);
        }

        setInitialRenderState(ctx, { didInitialScroll: true });

        // Invoke callback after all state cleanup and updates are complete
        if (callback) {
            callback();
        }
    }
}

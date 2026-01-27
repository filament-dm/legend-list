import { addTotalSize } from "@/core/addTotalSize";
import { PlatformAdjustBreaksScroll } from "@/platform/Platform";
import type { StateContext } from "@/state/state";
import { setInitialRenderState } from "@/utils/setInitialRenderState";

export function finishScrollTo(ctx: StateContext) {
    const state = ctx.state;

    console.log("[FINISH-SCROLL-TO] 🏁 Called:", {
        hasScrollingTo: !!state?.scrollingTo,
        isInitialScroll: !!state?.scrollingTo?.isInitialScroll,
        isInitializing: ctx.initializationManager?.isInitializing(),
        currentPhase: ctx.initializationManager?.getCurrentPhase(),
        hasCallback: !!state?.scrollingTo?.onSettled,
    });

    if (state?.scrollingTo) {
        // Save scrollingTo before clearing it so we can pass it to commitPendingAdjust
        const scrollingTo = state.scrollingTo;
        const callback = scrollingTo.onSettled;

        console.log("[FINISH-SCROLL-TO] Processing scroll completion:", {
            isInitialScroll: scrollingTo.isInitialScroll,
            hasCallback: !!callback,
        });

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

        // Notify initialization manager that initial scroll completed
        console.log("[FINISH-SCROLL-TO] 🔍 Checking if should transition to STABILIZING phase:", {
            isInitialScroll: scrollingTo.isInitialScroll,
            isInitializing: ctx.initializationManager.isInitializing(),
            shouldTransition: scrollingTo.isInitialScroll && ctx.initializationManager.isInitializing(),
        });

        if (scrollingTo.isInitialScroll && ctx.initializationManager.isInitializing()) {
            console.log("[FINISH-SCROLL-TO] ✅ This is initial scroll completion. Moving on to STABILIZING phase.");
            ctx.initializationManager.markInitialScrollComplete();
            ctx.initializationManager.transitionToStabilizingPhase();
        } else {
            console.log("[FINISH-SCROLL-TO] ℹ️ Not initial scroll or not initializing - no phase transition");
        }

        // Invoke callback after all state cleanup and updates are complete
        if (callback) {
            // console.log("[finishScrollTo] Invoking callback");
            callback();
            // console.log("[finishScrollTo] Callback invoked");
        } else {
            // console.log("[finishScrollTo] No callback to invoke");
        }
    } else {
        // console.warn("[finishScrollTo] Called but no scrollingTo state!");
    }
}

import { calculateOffsetWithOffsetPosition } from "@/core/calculateOffsetWithOffsetPosition";
import { clampScrollOffset } from "@/core/clampScrollOffset";
import { doScrollTo } from "@/core/doScrollTo";
import { finishScrollTo } from "@/core/finishScrollTo";
import { Platform } from "@/platform/Platform";
import type { StateContext } from "@/state/state";
import type { ScrollTarget } from "@/types";

export function scrollTo(ctx: StateContext, params: ScrollTarget & { noScrollingTo?: boolean; forceScroll?: boolean }) {
    const state = ctx.state;
    const { noScrollingTo, forceScroll, ...scrollTarget } = params;
    const { animated, isInitialScroll, offset: scrollTargetOffset, precomputedWithViewOffset } = scrollTarget;
    const {
        props: { horizontal },
    } = state;

    console.log("[SCROLL-7] scrollTo called:", {
        animated,
        isInitialScroll,
        forceScroll,
        hasCallback: !!scrollTarget.onSettled,
        currentScroll: state.scroll,
        targetOffset: scrollTargetOffset,
        viewPosition: scrollTarget.viewPosition,
        isInitializing: state.isInitializing,
    });

    // Clear out previous timeouts which would finishScrollTo
    if (state.animFrameCheckFinishedScroll) {
        // console.log("[scrollTo] Canceling previous animFrame");
        cancelAnimationFrame(ctx.state.animFrameCheckFinishedScroll);
    }
    if (state.timeoutCheckFinishedScrollFallback) {
        // console.log("[scrollTo] Canceling previous timeout");
        clearTimeout(ctx.state.timeoutCheckFinishedScrollFallback);
    }

    let offset = precomputedWithViewOffset
        ? scrollTargetOffset
        : calculateOffsetWithOffsetPosition(ctx, scrollTargetOffset, scrollTarget);

    offset = clampScrollOffset(ctx, offset);

    console.log("[SCROLL-8] scrollTo offset calculated:", {
        offset,
        diff: Math.abs(offset - state.scroll),
        currentScroll: state.scroll,
    });

    // Disable scroll adjust while scrolling so that it doesn't do extra work affecting the target offset
    state.scrollHistory.length = 0;

    // noScrollingTo is used for the workaround in mvcp to fake it with scroll
    if (!noScrollingTo) {
        state.scrollingTo = scrollTarget;
    }
    state.scrollPending = offset;

    // Check if already at target position (within 1px tolerance)
    if (!forceScroll && Math.abs(offset - state.scroll) < 1) {
        console.log("[SCROLL-9] Already at target (within 1px), calling finishScrollTo directly");
        // Already at target - callback is already wrapped in double RAF, so just call finishScrollTo directly
        finishScrollTo(ctx);
        return;
    }

    if (forceScroll || !isInitialScroll || Platform.OS === "android") {
        console.log("[SCROLL-10] Taking doScrollTo path:", {
            forceScroll,
            isInitialScroll,
            platform: Platform.OS,
        });
        doScrollTo(ctx, { animated, horizontal, isInitialScroll, offset });
    } else {
        console.log("[SCROLL-11] Taking direct scroll path (iOS initial scroll - callback may not fire!):", {
            offset,
            hasCallback: !!scrollTarget.onSettled,
        });
        state.scroll = offset;
    }
}

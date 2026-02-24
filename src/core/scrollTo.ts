import { calculateOffsetWithOffsetPosition } from "@/core/calculateOffsetWithOffsetPosition";
import { clampScrollOffset } from "@/core/clampScrollOffset";
import { doScrollTo } from "@/core/doScrollTo";
import { finishScrollTo } from "@/core/finishScrollTo";
import { Platform } from "@/platform/Platform";
import type { StateContext } from "@/state/state";
import type { ScrollTarget } from "@/types.base";

export function scrollTo(ctx: StateContext, params: ScrollTarget & { noScrollingTo?: boolean; forceScroll?: boolean }) {
    const state = ctx.state;
    const { noScrollingTo, forceScroll, ...scrollTarget } = params;
    const { animated, isInitialScroll, offset: scrollTargetOffset, precomputedWithViewOffset } = scrollTarget;
    const {
        props: { horizontal },
    } = state;

    // Clear out previous timeouts which would finishScrollTo
    if (state.animFrameCheckFinishedScroll) {
        cancelAnimationFrame(ctx.state.animFrameCheckFinishedScroll);
    }
    if (state.timeoutCheckFinishedScrollFallback) {
        clearTimeout(ctx.state.timeoutCheckFinishedScrollFallback);
    }

    let offset = precomputedWithViewOffset
        ? scrollTargetOffset
        : calculateOffsetWithOffsetPosition(ctx, scrollTargetOffset, scrollTarget);

    offset = clampScrollOffset(ctx, offset, scrollTarget);

    // Disable scroll adjust while scrolling so that it doesn't do extra work affecting the target offset
    state.scrollHistory.length = 0;

    // Check if already at target position (within 1px tolerance)
    if (!forceScroll && Math.abs(offset - state.scroll) < 1) {
        // Already at target - set scrollingTo so finishScrollTo can complete properly
        if (!noScrollingTo) {
            state.scrollingTo = scrollTarget;
        }
        // callback is already wrapped in double RAF, so just call finishScrollTo directly
        finishScrollTo(ctx);
        return;
    }

    // noScrollingTo is used for the workaround in mvcp to fake it with scroll
    if (!noScrollingTo) {
        state.scrollingTo = scrollTarget;
    }
    state.scrollPending = offset;

    if (forceScroll || !isInitialScroll || Platform.OS === "android") {
        doScrollTo(ctx, { animated, horizontal, isInitialScroll, offset });
    } else {
        // For initial scroll on web (not android), we set scroll directly without animation
        // to avoid janky initial positioning. However, we still need to call finishScrollTo
        // to trigger phase transitions and callbacks.
        if (state.props.debugInitialization) {
            console.log("[scrollTo] Using web optimization path for initial scroll", {
                animated,
                isInitialScroll,
                offset,
            });
        }

        state.scroll = offset;

        // CRITICAL: Also update the actual DOM scroll position to match internal state
        // This prevents state/DOM mismatch that causes MVCP to calculate wrong adjustments
        const scroller = state.refScroller.current;
        const node = typeof scroller?.getScrollableNode === "function" ? scroller.getScrollableNode() : scroller;
        if (node) {
            node[horizontal ? "scrollLeft" : "scrollTop"] = offset;
        }

        // Use setTimeout to ensure scroll state is updated before finishing
        // This matches the pattern in doScrollTo.ts for non-animated scrolls
        setTimeout(() => finishScrollTo(ctx), 100);
    }
}

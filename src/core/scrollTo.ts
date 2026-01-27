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
        currentScroll: state.scroll,
        forceScroll,
        hasCallback: !!scrollTarget.onSettled,
        isInitializing: state.isInitializing,
        isInitialScroll,
        targetOffset: scrollTargetOffset,
        viewPosition: scrollTarget.viewPosition,
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

    // Enhanced logging to debug positioning issues
    const debugInfo: any = {
        currentScroll: state.scroll,
        diff: Math.abs(offset - state.scroll),
        offset,
        scrollLength: state.scrollLength,
        totalSize: state.totalSize,
    };

    // If this is a viewPosition-based scroll, add detailed positioning info
    if (scrollTarget.viewPosition !== undefined && scrollTarget.index !== undefined) {
        const targetKey = state.idCache[scrollTarget.index];
        if (targetKey) {
            const targetPosition = state.positions.get(targetKey);
            if (targetPosition !== undefined) {
                // Calculate what the scroll SHOULD be for the given viewPosition
                const itemSize = scrollTarget.itemSize || 0;
                const expectedScroll = targetPosition - scrollTarget.viewPosition * (state.scrollLength - itemSize);

                debugInfo.targetIndex = scrollTarget.index;
                debugInfo.targetPosition = targetPosition;
                debugInfo.targetItemSize = itemSize;
                debugInfo.viewPosition = scrollTarget.viewPosition;
                debugInfo.expectedScroll = expectedScroll;
                debugInfo.scrollDiffFromExpected = offset - expectedScroll;
                debugInfo.targetIsAtScrollTop = Math.abs(targetPosition - state.scroll) < 1;
                debugInfo.targetIsAtViewportCenter =
                    Math.abs(targetPosition - (state.scroll + state.scrollLength / 2)) < 1;
            }
        }
    }

    console.log("[SCROLL-8] scrollTo offset calculated:", debugInfo);

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
            hasCallback: !!scrollTarget.onSettled,
            offset,
        });
        state.scroll = offset;
    }
}

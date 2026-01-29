import { addTotalSize } from "@/core/addTotalSize";
import { calculateOffsetForIndex } from "@/core/calculateOffsetForIndex";
import { calculateOffsetWithOffsetPosition } from "@/core/calculateOffsetWithOffsetPosition";
import { PlatformAdjustBreaksScroll } from "@/platform/Platform";
import { scrollTo } from "@/core/scrollTo";
import type { StateContext } from "@/state/state";
import { getId } from "@/utils/getId";
import { getItemSize } from "@/utils/getItemSize";
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

        // Check if this was a scrollToEnd operation that didn't reach the actual end
        if (scrollingTo.isScrollToEnd) {
            const currentLastIndex = state.props.data.length - 1;
            const isAtEnd = state.isAtEnd;
            const retryCount = scrollingTo.retryCount ?? 0;
            const MAX_RETRIES = 3;

            // Detect why we might need to retry
            const dataChanged = scrollingTo.index !== currentLastIndex;
            const notAtBottom = !isAtEnd;

            console.log("[FINISH-SCROLL-TO] ScrollToEnd completion check:", {
                targetWas: scrollingTo.index,
                currentEnd: currentLastIndex,
                isAtEnd,
                retryCount,
                dataChanged,
                notAtBottom,
            });

            // Retry if:
            // 1. Data changed (index doesn't match current end) OR not at bottom
            // 2. Still have data (currentLastIndex >= 0)
            // 3. Haven't exceeded max retries
            const shouldRetry = (dataChanged || notAtBottom) && currentLastIndex >= 0 && retryCount < MAX_RETRIES;

            if (shouldRetry) {
                console.log("[FINISH-SCROLL-TO] ScrollToEnd incomplete - retrying:", {
                    targetWas: scrollingTo.index,
                    currentEnd: currentLastIndex,
                    reason: dataChanged ? "data changed" : "not at bottom",
                    attempt: retryCount + 1,
                    maxRetries: MAX_RETRIES,
                });

                // Clear scrollingTo before retry
                state.scrollHistory.length = 0;
                state.scrollingTo = undefined;

                // Retry scrollToEnd (this will create a new scrollingTo with updated index)
                const targetId = getId(state, currentLastIndex);
                const itemSize = getItemSize(ctx, targetId, currentLastIndex, state.props.data[currentLastIndex]);
                const currentOffset = calculateOffsetForIndex(ctx, currentLastIndex);

                scrollTo(ctx, {
                    animated: false, // Don't animate the correction
                    index: currentLastIndex,
                    isScrollToEnd: true,
                    itemKey: targetId,
                    itemSize,
                    offset: currentOffset,
                    onSettled: callback, // Preserve original callback
                    viewOffset: scrollingTo.viewOffset,
                    viewPosition: scrollingTo.viewPosition ?? 1,
                    forceScroll: true,
                    retryCount: retryCount + 1, // Track retry attempts
                });

                return; // Don't proceed with normal finishScrollTo
            }

            // If we exhausted retries and still not at end, log warning
            if (retryCount >= MAX_RETRIES && (dataChanged || notAtBottom)) {
                console.warn("[FINISH-SCROLL-TO] ScrollToEnd reached max retries, giving up:", {
                    retryCount,
                    targetWas: scrollingTo.index,
                    currentEnd: currentLastIndex,
                    isAtEnd,
                    dataChanged,
                });
                // Continue with normal finishScrollTo - let callback fire
            }
        }

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

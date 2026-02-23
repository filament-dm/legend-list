import { addTotalSize } from "@/core/addTotalSize";
import { calculateOffsetForIndex } from "@/core/calculateOffsetForIndex";
import { scrollTo } from "@/core/scrollTo";
import { PlatformAdjustBreaksScroll } from "@/platform/Platform";
import type { StateContext } from "@/state/state";
import { checkThresholds } from "@/utils/checkThresholds";
import { getId } from "@/utils/getId";
import { getItemSize } from "@/utils/getItemSize";
import { setInitialRenderState } from "@/utils/setInitialRenderState";

export function finishScrollTo(ctx: StateContext) {
    const state = ctx.state;
    if (state?.scrollingTo) {
        // Save scrollingTo before clearing it so we can pass it to commitPendingAdjust
        const scrollingTo = state.scrollingTo;
        const callback = scrollingTo.onSettled;

        // Check if this was a scrollToEnd operation that didn't reach the actual end
        if (scrollingTo.isScrollToEnd) {
            const currentLastIndex = state.props.data.length - 1;
            const isAtEnd = state.isAtEnd;
            const retryCount = scrollingTo.retryCount ?? 0;
            const MAX_RETRIES = 3;

            // Detect why we might need to retry
            const dataChanged = scrollingTo.index !== currentLastIndex;
            const notAtBottom = !isAtEnd;

            // Retry if data changed or not at bottom
            const shouldRetry = (dataChanged || notAtBottom) && currentLastIndex >= 0 && retryCount < MAX_RETRIES;

            if (shouldRetry) {
                // Clear scrollingTo before retry
                state.scrollHistory.length = 0;
                state.scrollingTo = undefined;

                // Retry scrollToEnd with updated index
                const targetId = getId(state, currentLastIndex);
                const itemSize = getItemSize(ctx, targetId, currentLastIndex, state.props.data[currentLastIndex]);
                const currentOffset = calculateOffsetForIndex(ctx, currentLastIndex);

                scrollTo(ctx, {
                    animated: false, // Don't animate the correction
                    forceScroll: true,
                    index: currentLastIndex,
                    isScrollToEnd: true,
                    itemKey: targetId,
                    itemSize,
                    offset: currentOffset,
                    onSettled: callback,
                    retryCount: retryCount + 1,
                    viewOffset: scrollingTo.viewOffset,
                    viewPosition: scrollingTo.viewPosition ?? 1,
                });
                return; // Don't proceed with normal finishScrollTo
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
            state.triggerCalculateItemsInView?.({ forceFullItemPositions: true });
        }

        if (PlatformAdjustBreaksScroll) {
            state.scrollAdjustHandler.commitPendingAdjust(scrollingTo);
        }

        setInitialRenderState(ctx, { didInitialScroll: true });

        checkThresholds(ctx);

        // Notify initialization manager that initial scroll completed
        if (scrollingTo.isInitialScroll && ctx.initializationManager.isInitializing()) {
            ctx.initializationManager.markInitialScrollComplete();
            ctx.initializationManager.transitionToStabilizingPhase();
        }

        // Invoke callback after all state cleanup and updates are complete
        if (callback) {
            callback();
        }
    }
}

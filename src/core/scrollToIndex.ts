import { calculateOffsetForIndex } from "@/core/calculateOffsetForIndex";
import { scrollTo } from "@/core/scrollTo";
import type { StateContext } from "@/state/state";
import type { LegendListRef } from "@/types";
import { getId } from "@/utils/getId";
import { getItemSize } from "@/utils/getItemSize";

export type ScrollToIndexParams = Parameters<LegendListRef["scrollToIndex"]>[0];

export function scrollToIndex(
    ctx: StateContext,
    { index, viewOffset = 0, animated = true, viewPosition, onSettled }: ScrollToIndexParams,
) {
    const state = ctx.state;
    const { data } = state.props;

    console.log("[SCROLL-1] scrollToIndex called:", {
        animated,
        hasCallback: !!onSettled,
        index,
        isInitializing: state.isInitializing,
        stabilizationAnchorId: state.props.stabilizationAnchorId,
        viewOffset,
        viewPosition,
    });

    if (index >= data.length) {
        index = data.length - 1;
    } else if (index < 0) {
        index = 0;
    }

    const firstIndexOffset = calculateOffsetForIndex(ctx, index);

    const isLast = index === data.length - 1;
    if (isLast && viewPosition === undefined) {
        viewPosition = 1;
    }

    state.scrollForNextCalculateItemsInView = undefined;

    const targetId = getId(state, index);
    const itemSize = getItemSize(ctx, targetId, index, state.props.data[index!]);

    console.log("[SCROLL-2] scrollToIndex params calculated:", {
        adjustedIndex: index,
        isAnchor: targetId === state.props.stabilizationAnchorId,
        itemSize,
        targetId,
        viewPosition,
    });

    // Wrap onSettled in double RAF to ensure layout has settled before callback fires
    const wrappedOnSettled = onSettled
        ? () => {
              console.log("[SCROLL-3] scrollToIndex onSettled wrapper starting double RAF");
              requestAnimationFrame(() => {
                  console.log("[SCROLL-4] scrollToIndex first RAF");
                  requestAnimationFrame(() => {
                      console.log("[SCROLL-5] scrollToIndex second RAF, calling original callback");
                      onSettled();
                  });
              });
          }
        : undefined;

    console.log("[SCROLL-6] scrollToIndex calling scrollTo");
    scrollTo(ctx, {
        animated,
        index,
        isInitialScroll: state.initialScroll !== undefined && state.initialScroll.index === index,
        itemKey: targetId,
        itemSize,
        offset: firstIndexOffset,
        onSettled: wrappedOnSettled,
        viewOffset,
        viewPosition: viewPosition ?? 0,
    });
}

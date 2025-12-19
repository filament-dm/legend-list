import { calculateOffsetForIndex } from "@/core/calculateOffsetForIndex";
import type { StateContext } from "@/state/state";
import { getId } from "@/utils/getId";
import { getItemSize } from "@/utils/getItemSize";

/**
 * Sets an explicit anchor for MVCP without actually scrolling.
 * This anchor will be used by MVCP to maintain scroll position relative to the specified item
 * when sizes change.
 *
 * @param ctx - The state context
 * @param anchorIndex - The index of the item to use as anchor
 * @param viewPosition - Position in viewport (0 = top, 0.5 = middle, 1 = bottom)
 */
export function setExplicitAnchor(ctx: StateContext, anchorIndex: number, viewPosition: number = 1): void {
    const state = ctx.state;
    const { props } = state;
    const { data } = props;

    if (!data || anchorIndex < 0 || anchorIndex >= data.length) {
        console.warn(
            `[legend-list] setExplicitAnchor: invalid anchorIndex ${anchorIndex} (data length: ${data?.length ?? 0}), skipping`,
        );
        return;
    }

    // Don't set explicit anchor during initial layout
    if (state.queuedInitialLayout) {
        console.log(
            `[legend-list] setExplicitAnchor: skipping, initial layout in progress (queuedInitialLayout: ${state.queuedInitialLayout})`,
        );
        return;
    }

    // Don't override real scroll operations
    if (state.scrollingTo && !(state.scrollingTo as any).isExplicitAnchor) {
        console.log(
            `[legend-list] setExplicitAnchor: skipping, real scroll operation in progress (scrollingTo.index: ${state.scrollingTo.index})`,
        );
        return;
    }

    const id = getId(state, anchorIndex);
    if (!id) {
        console.warn(`[legend-list] setExplicitAnchor: no id for index ${anchorIndex}, skipping`);
        return;
    }

    const offset = calculateOffsetForIndex(ctx, anchorIndex);
    const itemData = data[anchorIndex];
    const itemSize = getItemSize(ctx, id, anchorIndex, itemData);

    console.log(
        `[legend-list] setExplicitAnchor: setting anchor at index ${anchorIndex} (id: ${id}) with viewPosition ${viewPosition}`,
    );
    console.log(
        `[legend-list] setExplicitAnchor: calculated offset: ${offset}px, itemSize: ${itemSize}px`,
    );

    // Set scrollingTo without actually scrolling
    // MVCP will use this as the anchor automatically
    state.scrollingTo = {
        animated: false,
        index: anchorIndex,
        isExplicitAnchor: true, // Flag to distinguish from real scroll operations
        itemSize,
        offset,
        viewPosition,
    } as any;
}

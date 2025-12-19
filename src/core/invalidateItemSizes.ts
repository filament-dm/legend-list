import type { StateContext } from "@/state/state";
import { getId } from "@/utils/getId";

/**
 * Invalidates cached sizes for specified item indices, forcing them to be recalculated
 * using getEstimatedItemSize on the next position update.
 *
 * @param ctx - The state context
 * @param indices - Array of item indices whose sizes should be invalidated
 */
export function invalidateItemSizes(ctx: StateContext, indices: number[]): void {
    const state = ctx.state;
    const { sizes, sizesKnown, props } = state;
    const { data } = props;

    if (!data || indices.length === 0) {
        console.log("[legend-list] invalidateItemSizes: no data or empty indices, skipping");
        return;
    }

    console.log(`[legend-list] invalidateItemSizes: invalidating sizes for indices [${indices.join(", ")}]`);

    let minIndex: number | undefined;

    for (const index of indices) {
        if (index < 0 || index >= data.length) {
            console.warn(`[legend-list] invalidateItemSizes: index ${index} out of bounds, skipping`);
            continue;
        }

        const id = getId(state, index);
        if (!id) {
            console.warn(`[legend-list] invalidateItemSizes: no id for index ${index}, skipping`);
            continue;
        }

        const hadSize = sizes.has(id);
        const hadKnownSize = sizesKnown.has(id);

        // Clear from both size caches
        sizes.delete(id);
        sizesKnown.delete(id);

        if (hadSize || hadKnownSize) {
            console.log(
                `[legend-list] invalidateItemSizes: cleared size for index ${index} (id: ${id}, hadSize: ${hadSize}, hadKnownSize: ${hadKnownSize})`,
            );
        }

        // Track minimum index for position recalculation
        minIndex = minIndex !== undefined ? Math.min(minIndex, index) : index;
    }

    // Set minIndexSizeChanged to trigger position recalculation from this point forward
    if (minIndex !== undefined) {
        const existingMin = state.minIndexSizeChanged;
        state.minIndexSizeChanged =
            existingMin !== undefined ? Math.min(existingMin, minIndex) : minIndex;

        console.log(
            `[legend-list] invalidateItemSizes: minIndexSizeChanged set to ${state.minIndexSizeChanged} (was ${existingMin ?? "undefined"})`,
        );
    }
}

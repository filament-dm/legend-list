import { setSize } from "@/core/setSize";
import type { StateContext } from "@/state/state";

export function getItemSize(
    ctx: StateContext,
    key: string,
    index: number,
    data: any,
    _useAverageSize?: boolean,
    _preferCachedSize?: boolean,
) {
    const state = ctx.state;
    const {
        sizesKnown,
        sizes,
        dataRefWhenMeasured,
        props: { estimatedItemSize, getEstimatedItemSize, getItemType },
    } = state;

    /**
     * NOTE (FILAMENT FORK):
     * Use sizesKnown (measured size) when the item's data reference hasn't changed.
     * If the data reference changed (e.g. link preview loaded), re-estimate since
     * the content has changed and the measured size is stale.
     */
    const sizeKnown = sizesKnown.get(key);
    if (sizeKnown !== undefined) {
        const measuredDataRef = dataRefWhenMeasured.get(key);
        if (measuredDataRef === data) {
            // Data reference unchanged - measured size is still valid
            return sizeKnown;
        }
        // Data reference changed - fall through to re-estimate
    }

    let size: number | undefined;

    if (size === undefined) {
        // Get estimated size since we don't have a valid measured size for this data version
        const itemType = getItemType ? (getItemType(data, index) ?? "") : "";
        size = getEstimatedItemSize ? getEstimatedItemSize(data, index, itemType) : estimatedItemSize!;
    }

    setSize(ctx, key, size);

    return size;
}

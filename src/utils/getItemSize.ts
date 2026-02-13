import { setSize } from "@/core/setSize";
import type { StateContext } from "@/state/state";
import { roundSize } from "@/utils/helpers";

export function getItemSize(
    ctx: StateContext,
    key: string,
    index: number,
    data: any,
    useAverageSize?: boolean,
    preferCachedSize?: boolean,
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
        console.log(`[LL-DEBUG getItemSize] key=${key} index=${index} dataRefChanged, sizeKnown=${sizeKnown}, will re-estimate`);
    }

    let size: number | undefined;

    if (size === undefined) {
        // Get estimated size since we don't have a valid measured size for this data version
        const itemType = getItemType ? (getItemType(data, index) ?? "") : "";
        size = getEstimatedItemSize ? getEstimatedItemSize(data, index, itemType) : estimatedItemSize!;
    }

    const prevSizeInMap = sizes.get(key);
    if (prevSizeInMap !== size) {
        console.log(`[LL-DEBUG getItemSize] key=${key} index=${index} estimated=${size} prevInSizes=${prevSizeInMap} sizesKnown=${sizeKnown} (OVERWRITING sizes map)`);
    }

    setSize(ctx, key, size);

    return size;
}

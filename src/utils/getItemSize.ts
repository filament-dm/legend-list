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
    console.log(`[getItemSize] key=${key}, preferCachedSize=${preferCachedSize}`);
    const state = ctx.state;
    const {
        sizesKnown,
        sizes,
        averageSizes,
        props: { estimatedItemSize, getEstimatedItemSize, getFixedItemSize, getItemType },
        scrollingTo,
    } = state;
    // TEMPORARILY DISABLED FOR TESTING - always re-estimate sizes
    // const sizeKnown = sizesKnown.get(key)!;
    // if (sizeKnown !== undefined) {
    //     console.log(`[getItemSize] ${key}: returning sizeKnown=${sizeKnown}`);
    //     return sizeKnown;
    // }

    let size: number | undefined;

    const itemType = getItemType ? (getItemType(data, index) ?? "") : "";

    // if (preferCachedSize) {
    //     const cachedSize = sizes.get(key);
    //     if (cachedSize !== undefined) {
    //         console.log(`[getItemSize] ${key}: returning cached size=${cachedSize}`);
    //         return cachedSize;
    //     }
    // }

    // if (getFixedItemSize) {
    //     size = getFixedItemSize(index, data, itemType);
    //     if (size !== undefined) {
    //         sizesKnown.set(key, size);
    //     }
    // }

    // // useAverageSize will be false if getEstimatedItemSize is defined
    // if (size === undefined && useAverageSize && !scrollingTo) {
    //     // Use item type specific average if available
    //     const averageSizeForType = averageSizes[itemType]?.avg;
    //     if (averageSizeForType !== undefined) {
    //         size = roundSize(averageSizeForType);
    //     }
    // }

    // if (size === undefined && preferCachedSize !== false) {
    //     size = sizes.get(key)!;

    //     if (size !== undefined) {
    //         console.log(`[getItemSize] ${key}: returning fallback cached size=${size}`);
    //         return size;
    //     }
    // }

    if (size === undefined) {
        console.log(`[getItemSize] ${key}: GETTING ESTIMATED SIZE!!!!`);
        // Get estimated size if we don't have an average or already cached size
        size = getEstimatedItemSize ? getEstimatedItemSize(index, data, itemType) : estimatedItemSize!;
        console.log(`[getItemSize] ${key}: called getEstimatedItemSize, got size=${size}`);
    }

    setSize(ctx, key, size);

    return size;
}

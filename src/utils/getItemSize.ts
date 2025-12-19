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
        sizeInvalidationKeys,
        averageSizes,
        props: { estimatedItemSize, getEstimatedItemSize, getItemSizeInvalidationKey, getFixedItemSize, getItemType },
        scrollingTo,
    } = state;

    const itemType = getItemType ? (getItemType(data, index) ?? "") : "";

    // Check invalidation key FIRST before returning cached sizesKnown
    // If the key has changed, force remeasurement
    if (getItemSizeInvalidationKey) {
        const currentInvalidationKey = getItemSizeInvalidationKey(index, data, itemType);
        if (currentInvalidationKey !== undefined) {
            const cachedInvalidationKey = sizeInvalidationKeys.get(key);
            if (cachedInvalidationKey !== undefined && cachedInvalidationKey !== currentInvalidationKey) {
                // Invalidation key changed - clear all caches to force remeasurement
                console.log(
                    `[getItemSize] Invalidation key changed for ${key}: ` +
                    `${cachedInvalidationKey} → ${currentInvalidationKey}, forcing remeasurement`
                );
                sizesKnown.delete(key);
                sizes.delete(key);
                sizeInvalidationKeys.set(key, currentInvalidationKey);
            }
        }
    }

    const sizeKnown = sizesKnown.get(key)!;
    if (sizeKnown !== undefined) {
        return sizeKnown;
    }

    let size: number | undefined;

    if (preferCachedSize) {
        const cachedSize = sizes.get(key);
        if (cachedSize !== undefined) {
            // Check if invalidation key has changed
            if (getItemSizeInvalidationKey) {
                const currentInvalidationKey = getItemSizeInvalidationKey(index, data, itemType);
                if (currentInvalidationKey !== undefined) {
                    const cachedInvalidationKey = sizeInvalidationKeys.get(key);
                    if (cachedInvalidationKey !== currentInvalidationKey) {
                        // Invalidation key changed - clear cache and update key
                        sizes.delete(key);
                        sizeInvalidationKeys.set(key, currentInvalidationKey);
                        // Fall through to recalculate size
                    } else {
                        // Key unchanged - use cached size
                        return cachedSize;
                    }
                } else {
                    // No invalidation key provided - use cached size
                    return cachedSize;
                }
            } else {
                // No invalidation function - use cached size
                return cachedSize;
            }
        }
    }

    if (getFixedItemSize) {
        size = getFixedItemSize(index, data, itemType);
        if (size !== undefined) {
            sizesKnown.set(key, size);
        }
    }

    // useAverageSize will be false if getEstimatedItemSize is defined
    if (size === undefined && useAverageSize && sizeKnown === undefined && !scrollingTo) {
        // Use item type specific average if available
        const averageSizeForType = averageSizes[itemType]?.avg;
        if (averageSizeForType !== undefined) {
            size = roundSize(averageSizeForType);
        }
    }

    if (size === undefined) {
        size = sizes.get(key)!;

        if (size !== undefined) {
            return size;
        }
    }

    if (size === undefined) {
        // Get estimated size if we don't have an average or already cached size
        size = getEstimatedItemSize ? getEstimatedItemSize(index, data, itemType) : estimatedItemSize!;
    }

    setSize(ctx, key, size);

    // Store invalidation key if function is provided (always, not just when preferCachedSize)
    // We need this for future comparisons to detect when it changes
    if (getItemSizeInvalidationKey) {
        const currentInvalidationKey = getItemSizeInvalidationKey(index, data, itemType);
        if (currentInvalidationKey !== undefined) {
            const existingKey = sizeInvalidationKeys.get(key);
            // Only log if we're actually setting it for the first time or it's changing
            if (existingKey === undefined) {
                console.log(`[getItemSize] Storing initial invalidation key for ${key}: ${currentInvalidationKey}`);
            }
            sizeInvalidationKeys.set(key, currentInvalidationKey);
        }
    }

    return size;
}

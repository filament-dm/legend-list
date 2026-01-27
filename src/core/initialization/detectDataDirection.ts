/**
 * Detects the direction from which pagination data arrived by comparing old and new data arrays
 *
 * This function analyzes structural changes in the data array to determine if:
 * - Items were prepended (pagination from "start" / older items)
 * - Items were appended (pagination from "end" / newer items)
 * - Items were both prepended and appended
 * - The entire data was replaced (timeline switch)
 * - No structural changes occurred (content updates only)
 */

import type { DataArrivalInfo, PaginationDirection } from "./types";

/**
 * Detects pagination direction by comparing old and new data arrays
 *
 * @param oldData - Previous data array
 * @param newData - New data array
 * @param keyExtractor - Function to extract unique key from each item
 * @returns Information about the data arrival including direction and counts
 */
export function detectDataDirection(
    oldData: readonly unknown[],
    newData: readonly unknown[],
    keyExtractor: (item: unknown, index: number) => string,
): DataArrivalInfo {
    const oldCount = oldData.length;
    const newCount = newData.length;

    // Edge case: First data load (empty -> populated)
    if (oldCount === 0 && newCount > 0) {
        return {
            direction: "both",
            isEndEmpty: false,
            isStartEmpty: false,
            itemsAddedAtEnd: newCount,
            itemsAddedAtStart: 0,
            itemsRemoved: 0,
            newCount,
            oldCount,
        };
    }

    // Edge case: Data cleared (populated -> empty)
    if (oldCount > 0 && newCount === 0) {
        return {
            direction: "replacement",
            isEndEmpty: true,
            isStartEmpty: true,
            itemsAddedAtEnd: 0,
            itemsAddedAtStart: 0,
            itemsRemoved: oldCount,
            newCount,
            oldCount,
        };
    }

    // Edge case: No change in count
    if (oldCount === newCount) {
        // Check if keys match - might be content updates only
        const oldFirstKey = keyExtractor(oldData[0], 0);
        const newFirstKey = keyExtractor(newData[0], 0);
        const oldLastKey = keyExtractor(oldData[oldCount - 1], oldCount - 1);
        const newLastKey = keyExtractor(newData[newCount - 1], newCount - 1);

        if (oldFirstKey === newFirstKey && oldLastKey === newLastKey) {
            // Same boundaries, likely just content updates
            return {
                direction: "none",
                isEndEmpty: false,
                isStartEmpty: false,
                itemsAddedAtEnd: 0,
                itemsAddedAtStart: 0,
                itemsRemoved: 0,
                newCount,
                oldCount,
            };
        }

        // Boundaries changed with same count - replacement
        return {
            direction: "replacement",
            isEndEmpty: false,
            isStartEmpty: false,
            itemsAddedAtEnd: 0,
            itemsAddedAtStart: 0,
            itemsRemoved: 0,
            newCount,
            oldCount,
        };
    }

    // Build key maps for efficient lookup
    const oldKeys = new Set<string>();
    const newKeys = new Set<string>();

    for (let i = 0; i < oldCount; i++) {
        oldKeys.add(keyExtractor(oldData[i], i));
    }

    for (let i = 0; i < newCount; i++) {
        newKeys.add(keyExtractor(newData[i], i));
    }

    // Find the overlap region - where old and new data share common keys
    // Start from beginning and find first common key
    let commonStartIndex = -1;
    for (let i = 0; i < newCount; i++) {
        const key = keyExtractor(newData[i], i);
        if (oldKeys.has(key)) {
            commonStartIndex = i;
            break;
        }
    }

    // Start from end and find last common key
    let commonEndIndex = -1;
    for (let i = newCount - 1; i >= 0; i--) {
        const key = keyExtractor(newData[i], i);
        if (oldKeys.has(key)) {
            commonEndIndex = i;
            break;
        }
    }

    // No overlap found - complete replacement
    if (commonStartIndex === -1 || commonEndIndex === -1) {
        return {
            direction: "replacement",
            isEndEmpty: false,
            isStartEmpty: false,
            itemsAddedAtEnd: newCount,
            itemsAddedAtStart: 0,
            itemsRemoved: oldCount,
            newCount,
            oldCount,
        };
    }

    // Count items added at start and end
    const itemsAddedAtStart = commonStartIndex;
    const itemsAddedAtEnd = newCount - commonEndIndex - 1;

    // Count items removed
    const itemsRemoved = Math.max(0, oldCount - (newCount - itemsAddedAtStart - itemsAddedAtEnd));

    // Determine direction
    let direction: PaginationDirection;
    if (itemsAddedAtStart > 0 && itemsAddedAtEnd > 0) {
        direction = "both";
    } else if (itemsAddedAtStart > 0) {
        direction = "start";
    } else if (itemsAddedAtEnd > 0) {
        direction = "end";
    } else if (itemsRemoved > 0) {
        direction = "replacement";
    } else {
        direction = "none";
    }

    // Detect empty responses
    // If pending request for a direction but no items added in that direction,
    // it might indicate the server returned empty (no more data available)
    // However, we can't determine this with certainty without request context,
    // so we'll use a heuristic: if data count increased but not in expected direction
    const isStartEmpty = direction !== "start" && direction !== "both" && newCount === oldCount;
    const isEndEmpty = direction !== "end" && direction !== "both" && newCount === oldCount;

    return {
        direction,
        isEndEmpty,
        isStartEmpty,
        itemsAddedAtEnd,
        itemsAddedAtStart,
        itemsRemoved,
        newCount,
        oldCount,
    };
}

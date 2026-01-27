/**
 * Forced pagination logic for initialization mode
 *
 * During initialization, we need to fill the viewport with content by repeatedly
 * triggering pagination callbacks until sufficient buffer is available in both directions.
 * This is different from normal pagination which uses hysteresis to prevent callback spam.
 */

import type { ForcePaginationResult } from "./types";

/**
 * Hysteresis multiplier for buffer sufficiency checks.
 * Content must extend beyond threshold * 1.3 to be considered sufficient.
 * This comes from the normal threshold system to ensure we're clearly outside the threshold zone.
 */
const HYSTERESIS_MULTIPLIER = 1.3;

/**
 * Configuration for checking forced pagination needs
 */
export interface ForcePaginationConfig {
    /** Total size of content */
    contentSize: number;

    /** Current scroll position */
    scroll: number;

    /** Length of viewport */
    scrollLength: number;

    /** Threshold for onEndReached (as fraction of scrollLength) */
    onEndReachedThreshold: number;

    /** Threshold for onStartReached (as fraction of scrollLength) */
    onStartReachedThreshold: number;

    /** Whether more data is available at the end */
    hasMoreEnd: boolean;

    /** Whether more data is available at the start */
    hasMoreStart: boolean;

    /** Whether this is a chat interface (maintainScrollAtEnd mode) */
    maintainScrollAtEnd: boolean;

    /** Position of the stabilization anchor (if available) */
    anchorPosition?: number;
}

/**
 * Check if forced pagination is needed during initialization.
 *
 * This function determines whether the viewport has sufficient buffer content
 * in each direction. If not, it indicates that pagination should be forced.
 *
 * Two distance calculation modes:
 * 1. Anchor-based: When an anchor is provided, measure from anchor to content edges
 *    (ensures distances grow as content is added, even when MVCP adjusts scroll)
 * 2. Viewport-based: When no anchor, measure from viewport edges to content edges
 *    (used for live timelines or when anchor not yet positioned)
 *
 * @param config - Configuration including content size, scroll state, thresholds
 * @returns Result indicating buffer sufficiency and whether to force pagination
 */
export function checkForcePagination(config: ForcePaginationConfig): ForcePaginationResult {
    const {
        contentSize,
        scroll,
        scrollLength,
        onEndReachedThreshold,
        onStartReachedThreshold,
        hasMoreEnd,
        hasMoreStart,
        maintainScrollAtEnd,
        anchorPosition,
    } = config;

    // Calculate threshold distances (in pixels)
    const endThreshold = onEndReachedThreshold * scrollLength;
    const startThreshold = onStartReachedThreshold * scrollLength;

    // Calculate distances using appropriate mode
    let distanceFromEnd: number;
    let distanceFromStart: number;

    if (anchorPosition !== undefined) {
        // Anchor-based mode: measure from anchor to content edges
        distanceFromStart = anchorPosition;
        distanceFromEnd = contentSize - anchorPosition;
    } else {
        // Viewport-based mode: measure from viewport edges to content edges
        distanceFromStart = scroll;
        distanceFromEnd = contentSize - scroll - scrollLength;
    }

    if (maintainScrollAtEnd) {
        // Chat mode: only need backward buffer (older messages at index 0)
        const needsStartBuffer = distanceFromStart < startThreshold * HYSTERESIS_MULTIPLIER;

        return {
            isEndBufferSufficient: true, // Always sufficient in chat mode (at end)
            isStartBufferSufficient: !needsStartBuffer || !hasMoreStart,
            shouldForceStartReached: needsStartBuffer && hasMoreStart,
            // In chat mode, we're always at the end, so we don't force end reached
        };
    }

    // Mid-timeline mode: check both directions independently
    const needsEndBuffer = distanceFromEnd < endThreshold * HYSTERESIS_MULTIPLIER;
    const needsStartBuffer = distanceFromStart < startThreshold * HYSTERESIS_MULTIPLIER;

    return {
        isEndBufferSufficient: !needsEndBuffer || !hasMoreEnd,
        isStartBufferSufficient: !needsStartBuffer || !hasMoreStart,
        shouldForceEndReached: needsEndBuffer && hasMoreEnd,
        shouldForceStartReached: needsStartBuffer && hasMoreStart,
    };
}

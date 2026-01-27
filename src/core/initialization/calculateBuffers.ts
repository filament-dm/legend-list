/**
 * Calculate buffer sizes for viewport rendering
 *
 * Buffers determine how much content to render above and below the visible viewport.
 * This helps maintain smooth scrolling by pre-rendering items before they come into view.
 */

import type { BufferConfig, BufferSizes } from "./types";

/**
 * Multiplier applied to buffer sizes during initialization.
 * During initialization, scroll position is uncertain due to pending MVCP adjustments,
 * so we use a much larger buffer to ensure all actually-visible items are included.
 */
const INITIALIZATION_BUFFER_MULTIPLIER = 4;

/**
 * Calculate buffer sizes based on scroll velocity, position, and initialization state.
 *
 * Normal operation:
 * - When scrolling down or at top: 0.5x buffer above, 1.5x buffer below
 * - When scrolling up: 1.5x buffer above, 0.5x buffer below
 *
 * Initialization mode:
 * - All buffers are multiplied by 4x to account for scroll position uncertainty
 *
 * @param config - Buffer configuration including base size, velocity, and init state
 * @param scroll - Current scroll position (optional, for top detection)
 * @returns Buffer sizes for top and bottom of viewport
 */
export function calculateBufferSizes(config: BufferConfig, scroll?: number): BufferSizes {
    const { scrollBuffer, scrollVelocity, isInitializing } = config;

    let scrollBufferTop = scrollBuffer;
    let scrollBufferBottom = scrollBuffer;

    // Adjust buffers based on scroll direction
    // When scrolling down (or stationary at top), prioritize content below
    // When scrolling up, prioritize content above
    const atOrNearTop = scroll !== undefined && scroll < Math.max(50, scrollBuffer);
    if (scrollVelocity > 0 || (scrollVelocity === 0 && atOrNearTop)) {
        // If we're scrolling down, or we're at the top of the list and not scrolling
        scrollBufferTop = scrollBuffer * 0.5;
        scrollBufferBottom = scrollBuffer * 1.5;
    } else {
        scrollBufferTop = scrollBuffer * 1.5;
        scrollBufferBottom = scrollBuffer * 0.5;
    }

    // During initialization, multiply all buffers to handle scroll position uncertainty
    if (isInitializing) {
        scrollBufferTop *= INITIALIZATION_BUFFER_MULTIPLIER;
        scrollBufferBottom *= INITIALIZATION_BUFFER_MULTIPLIER;
    }

    return {
        scrollBufferBottom,
        scrollBufferTop,
    };
}

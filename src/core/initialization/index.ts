/**
 * Initialization system
 *
 * This module handles the complex process of initializing a list view when jumping
 * to a specific position (e.g., navigating to a message in chat history).
 *
 * The initialization system is a distinct operating mode from normal list operation,
 * with different behaviors for:
 * - MVCP anchor locking (locks to specific item instead of first visible)
 * - Buffer sizes (4x larger to handle scroll position uncertainty)
 * - Pagination (forced until buffers are sufficient, bypasses hysteresis)
 * - Stabilization (tracks 3 stable frames before exiting)
 */

export * from "./InitializationManager";
export * from "./types";

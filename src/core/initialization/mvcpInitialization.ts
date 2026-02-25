/**
 * Initialization MVCP - Maintain Visible Content Position during initialization
 *
 * This is a simplified, purpose-built MVCP system for the initialization phase.
 * Unlike the general-purpose mvcp.ts which handles many scenarios, this focuses
 * solely on keeping the stabilization anchor at a fixed viewport position while
 * data loads around it.
 *
 * Key differences from mvcp.ts:
 * - Single target: Always tracks the stabilization anchor (no switching)
 * - Absolute positioning: Centers anchor at targetViewPosition (not "maintain first visible")
 * - Simpler algorithm: Calculate target scroll from anchor position directly
 * - Initialization-only: Only active during STABILIZING phase after initial scroll
 */

import { getContentSize } from "@/state/getContentSize";
import type { StateContext } from "@/state/state";
import { requestAdjust } from "@/utils/requestAdjust";

/**
 * Prepare initialization MVCP adjustment
 *
 * This captures the anchor's current position before updateItemPositions runs.
 * Returns a function that recalculates the adjustment after positions change.
 *
 * Note: This function is only called when mvcpMode is INITIALIZATION, which is set
 * by InitializationManager during the STABILIZING phase. No need for phase checks here.
 *
 * @param ctx - State context
 * @returns Function to apply MVCP adjustment, or undefined if not applicable
 */
export function prepareInitializationMVCP(ctx: StateContext): (() => void) | undefined {
    const state = ctx.state;
    const manager = ctx.initializationManager;

    // Get anchor configuration
    const anchorId = manager.getMVCPAnchorOverride();
    if (!anchorId) return undefined;

    // Verify anchor exists and has a position
    const anchorIndex = state.indexByKey.get(anchorId);
    if (anchorIndex === undefined) {
        return undefined;
    }

    const prevPosition = state.positions[anchorIndex];
    if (prevPosition === undefined) {
        return undefined;
    }

    const targetViewPosition = manager.getTargetViewPosition() ?? 0.5;

    // Return closure that applies adjustment after positions recalculate
    return () => {
        const currentAnchorIndex = state.indexByKey.get(anchorId);
        const newPosition = currentAnchorIndex !== undefined ? state.positions[currentAnchorIndex] : undefined;
        if (newPosition === undefined) {
            return;
        }

        // Calculate target scroll position to center anchor at targetViewPosition
        // Formula: scroll + (viewPosition * scrollLength) = anchorPosition
        // Therefore: scroll = anchorPosition - (viewPosition * scrollLength)
        const targetScroll = newPosition - targetViewPosition * state.scrollLength;

        // Clamp to valid scroll range
        const contentSize = getContentSize(ctx);
        const maxScroll = Math.max(0, contentSize - state.scrollLength);
        const clampedTargetScroll = Math.max(0, Math.min(targetScroll, maxScroll));

        // Calculate adjustment needed
        const scrollAdjustment = clampedTargetScroll - state.scroll;

        // Apply adjustment if significant (> 0.1px threshold)
        if (Math.abs(scrollAdjustment) > 0.1) {
            requestAdjust(ctx, scrollAdjustment, false);
        }
    };
}

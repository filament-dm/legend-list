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
 * - Initialization-only: Only active during FILLING phase after initial scroll
 */

import { getContentSize } from "@/state/getContentSize";
import type { StateContext } from "@/state/state";
import { requestAdjust } from "@/utils/requestAdjust";
import { InitializationPhase } from "./types";

/**
 * Prepare initialization MVCP adjustment
 *
 * This captures the anchor's current position before updateItemPositions runs.
 * Returns a function that recalculates the adjustment after positions change.
 *
 * @param ctx - State context
 * @returns Function to apply MVCP adjustment, or undefined if not applicable
 */
export function prepareInitializationMVCP(ctx: StateContext): (() => void) | undefined {
    const state = ctx.state;
    const manager = ctx.initializationManager;

    // Only run during FILLING phase after initial scroll completes
    if (!manager.isInitializing()) return undefined;
    if (manager.getCurrentPhase() !== InitializationPhase.FILLING) return undefined;
    if (!manager.didCompleteInitialScroll()) return undefined;

    // Get anchor configuration
    const anchorId = manager.getMVCPAnchorOverride();
    if (!anchorId) return undefined;

    // Verify anchor exists and has a position
    const anchorIndex = state.indexByKey.get(anchorId);
    if (anchorIndex === undefined) {
        console.log("[MVCP-INIT] Anchor not found in data, skipping MVCP");
        return undefined;
    }

    const prevPosition = state.positions.get(anchorId);
    if (prevPosition === undefined) {
        console.log("[MVCP-INIT] Anchor position not yet calculated, skipping MVCP");
        return undefined;
    }

    const targetViewPosition = manager.getTargetViewPosition() ?? 0.5;

    console.log("[MVCP-INIT-1] Prepared initialization MVCP:", {
        anchorId,
        anchorIndex,
        prevPosition,
        targetViewPosition,
    });

    // Return closure that applies adjustment after positions recalculate
    return () => {
        const newPosition = state.positions.get(anchorId);
        if (newPosition === undefined) {
            console.log("[MVCP-INIT] Anchor position lost after recalculation");
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

        console.log("[MVCP-INIT-2] Initialization MVCP adjustment calculated:", {
            anchorId,
            clampedTargetScroll,
            contentSize,
            currentScroll: state.scroll,
            newPosition,
            positionDelta: newPosition - prevPosition,
            prevPosition,
            scrollAdjustment,
            scrollLength: state.scrollLength,
            targetScroll,
            targetViewPosition,
        });

        // Apply adjustment if significant (> 0.1px threshold)
        if (Math.abs(scrollAdjustment) > 0.1) {
            requestAdjust(ctx, scrollAdjustment, false);
        }
    };
}

/**
 * Check if initialization MVCP should be used instead of regular MVCP
 *
 * This is called from calculateItemsInView to determine which MVCP system to use.
 *
 * @param ctx - State context
 * @returns true if initialization MVCP should be used
 */
export function shouldUseInitializationMVCP(ctx: StateContext): boolean {
    console.log("[MVCP-INIT-CHECK] Checking if initialization MVCP should be used");
    const manager = ctx.initializationManager;

    if (!manager.isInitializing()) {
        console.log("[MVCP-INIT-CHECK] Not initializing, skipping initialization MVCP");
        return false;
    }
    if (manager.getCurrentPhase() !== InitializationPhase.FILLING) {
        console.log("[MVCP-INIT-CHECK] Current phase is not FILLING, skipping initialization MVCP");
        return false;
    }
    if (!manager.didCompleteInitialScroll()) {
        console.log("[MVCP-INIT-CHECK] Initial scroll not completed, skipping initialization MVCP");
        return false;
    }

    return manager.shouldLockMVCP();
}

import type { StateContext } from "@/state/state";

/**
 * Clears an explicit anchor set by setExplicitAnchor.
 * Only clears if the current scrollingTo is an explicit anchor to avoid
 * interfering with real scroll operations.
 *
 * @param ctx - The state context
 */
export function clearExplicitAnchor(ctx: StateContext): void {
    const state = ctx.state;

    // Only clear if this is an explicit anchor, not a real scroll operation
    if (state.scrollingTo && (state.scrollingTo as any).isExplicitAnchor) {
        console.log(
            `[legend-list] clearExplicitAnchor: clearing explicit anchor (was at index ${state.scrollingTo.index})`,
        );
        state.scrollingTo = undefined;
    } else {
        console.log(
            `[legend-list] clearExplicitAnchor: no explicit anchor to clear (scrollingTo: ${state.scrollingTo ? "real scroll" : "undefined"})`,
        );
    }
}

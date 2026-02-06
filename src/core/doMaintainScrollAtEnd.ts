import { getContentSize } from "@/state/getContentSize";
import type { StateContext } from "@/state/state";

export function doMaintainScrollAtEnd(ctx: StateContext, animated: boolean) {
    const state = ctx.state;
    const {
        didContainersLayout,
        isAtEnd,
        refScroller,
        props: { maintainScrollAtEnd },
    } = state;
    // Prevent concurrent scroll-to-end operations
    if (state.maintainingScrollAtEnd) {
        return false;
    }

    // Run this only if scroll is at the bottom and after initial layout
    if (isAtEnd && maintainScrollAtEnd && didContainersLayout) {
        // Set flag immediately to prevent concurrent calls
        state.maintainingScrollAtEnd = true;

        // Set scroll to the bottom of the list so that checkAtTop/checkAtBottom is correct
        const contentSize = getContentSize(ctx);
        if (contentSize < state.scrollLength) {
            // If content fits within the viewport, we should be at scroll 0.
            state.scroll = 0;
        }

        requestAnimationFrame(() => {
            // Execute scroll without re-checking isAtEnd to avoid race condition
            // The initial check above already confirmed we should scroll
            refScroller.current?.scrollToEnd({
                animated,
            });
            setTimeout(
                () => {
                    state.maintainingScrollAtEnd = false;
                },
                animated ? 500 : 0,
            );
        });

        return true;
    }

    return false;
}

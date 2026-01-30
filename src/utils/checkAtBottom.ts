import { getContentInsetEnd } from "@/state/getContentInsetEnd";
import { getContentSize } from "@/state/getContentSize";
import type { StateContext } from "@/state/state";
import { checkThreshold } from "@/utils/checkThreshold";

export function checkAtBottom(ctx: StateContext) {
    const state = ctx.state;
    if (!state) {
        return;
    }
    const {
        scrollLength,
        scroll,
        maintainingScrollAtEnd,
        props: { maintainScrollAtEndThreshold, onEndReachedThreshold },
    } = state;
    const contentSize = getContentSize(ctx);

    // Always check threshold, even with zero content or during animations
    // The threshold state machine needs to progress (null → false → true)
    // Skip only if actively animating scroll to end to avoid interference
    if (!maintainingScrollAtEnd) {
        // Check if at end
        const insetEnd = getContentInsetEnd(state);
        const distanceFromEnd = contentSize - scroll - scrollLength - insetEnd;
        const isContentLess = contentSize < scrollLength;
        state.isAtEnd = isContentLess || distanceFromEnd < scrollLength * maintainScrollAtEndThreshold!;

        state.isEndReached = checkThreshold(
            distanceFromEnd,
            isContentLess,
            onEndReachedThreshold! * scrollLength,
            state.isEndReached,
            state.endReachedSnapshot,
            {
                contentSize,
                dataLength: state.props.data?.length,
                scrollPosition: scroll,
            },
            (distance) => {
                // Block pagination during initialization
                // App provides sufficient data upfront
                if (state.isInitializing) {
                    return;
                }
                state.props.onEndReached?.({ distanceFromEnd: distance });
            },
            (snapshot) => {
                state.endReachedSnapshot = snapshot;
            },
            true,
        );
    }
}

import { InitializationPhase } from "@/core/initialization/types";
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
        const distanceFromEnd = contentSize - scroll - scrollLength;
        const isContentLess = contentSize < scrollLength;
        state.isAtEnd = isContentLess || distanceFromEnd < scrollLength * maintainScrollAtEndThreshold!;

        const prevIsEndReached = state.isEndReached;
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
                // Block pagination during early initialization phases
                if (state.isInitializing && ctx?.initializationManager) {
                    const phase = ctx.initializationManager.getCurrentPhase();

                    // Block during SCROLLING phase - wait for initial scroll to complete
                    if (phase === InitializationPhase.SCROLLING) {
                        console.log("[PAGINATE-4] BLOCKED: onEndReached during SCROLLING phase");
                        return;
                    }

                    // Block during FILLING phase if initial scroll hasn't completed
                    if (
                        phase === InitializationPhase.FILLING &&
                        !ctx.initializationManager.didCompleteInitialScroll()
                    ) {
                        console.log("[PAGINATE-4] BLOCKED: onEndReached during FILLING (pre-scroll) phase");
                        return;
                    }

                    const dataCount = state.props.data?.length ?? 0;
                    console.log("[PAGINATE-4] onEndReached callback firing (will set pendingEndRequest):", {
                        dataCount,
                        distance,
                        isInitializing: state.isInitializing,
                        phase,
                    });
                    state.pendingEndRequest = true;

                    // Notify InitializationManager of pagination request
                    ctx.initializationManager.onPaginationRequested("end", dataCount);
                }
                console.log("[PAGINATE-5] Calling app's onEndReached callback:", { distance });
                state.props.onEndReached?.({ distanceFromEnd: distance });
            },
            (snapshot) => {
                state.endReachedSnapshot = snapshot;
            },
            true,
        );

        if (prevIsEndReached !== state.isEndReached) {
            console.log("[PAGINATE-6] isEndReached state changed:", {
                from: prevIsEndReached,
                isInitializing: state.isInitializing,
                to: state.isEndReached,
            });
        }
    }
}

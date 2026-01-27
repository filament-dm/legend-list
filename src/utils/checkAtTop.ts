import { InitializationPhase } from "@/core/initialization/types";
import type { StateContext } from "@/state/state";
import type { InternalState } from "@/types";
import { checkThreshold } from "@/utils/checkThreshold";

export function checkAtTop(state: InternalState, ctx?: StateContext) {
    if (!state) {
        return;
    }
    const {
        scrollLength,
        scroll,
        props: { onStartReachedThreshold },
    } = state;
    const distanceFromTop = scroll;
    state.isAtStart = distanceFromTop <= 0;

    const prevIsStartReached = state.isStartReached;
    state.isStartReached = checkThreshold(
        distanceFromTop,
        false,
        onStartReachedThreshold! * scrollLength,
        state.isStartReached,
        state.startReachedSnapshot,
        {
            contentSize: state.totalSize,
            dataLength: state.props.data?.length,
            scrollPosition: scroll,
        },
        (distance) => {
            // Block pagination during early initialization phases
            if (state.isInitializing && ctx?.initializationManager) {
                const phase = ctx.initializationManager.getCurrentPhase();

                // Block during SCROLLING phase - wait for initial scroll to complete
                if (phase === InitializationPhase.SCROLLING) {
                    console.log("[PAGINATE-1] BLOCKED: onStartReached during SCROLLING phase");
                    return;
                }

                // Block during FILLING phase if initial scroll hasn't completed
                if (phase === InitializationPhase.FILLING && !ctx.initializationManager.didCompleteInitialScroll()) {
                    console.log("[PAGINATE-1] BLOCKED: onStartReached during FILLING (pre-scroll) phase");
                    return;
                }

                const dataCount = state.props.data?.length ?? 0;
                console.log("[PAGINATE-1] onStartReached callback firing (will set pendingStartRequest):", {
                    dataCount,
                    distance,
                    isInitializing: state.isInitializing,
                    phase,
                });
                state.pendingStartRequest = true;

                // Notify InitializationManager of pagination request
                ctx.initializationManager.onPaginationRequested("start", dataCount);
            }
            console.log("[PAGINATE-2] Calling app's onStartReached callback:", { distance });
            state.props.onStartReached?.({ distanceFromStart: distance });
        },
        (snapshot) => {
            state.startReachedSnapshot = snapshot;
        },
        false,
    );

    if (prevIsStartReached !== state.isStartReached) {
        console.log("[PAGINATE-3] isStartReached state changed:", {
            from: prevIsStartReached,
            isInitializing: state.isInitializing,
            to: state.isStartReached,
        });
    }
}

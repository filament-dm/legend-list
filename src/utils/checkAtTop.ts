import type { InternalState } from "@/types";
import { checkThreshold } from "@/utils/checkThreshold";

export function checkAtTop(state: InternalState) {
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
            // Block all pagination during initialization
            // App provides sufficient data upfront
            if (state.isInitializing) {
                console.log("[PAGINATE-1] BLOCKED: onStartReached during initialization");
                return;
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

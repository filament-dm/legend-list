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
            // Set pending flag during initialization to prevent premature stabilization
            if (state.isInitializing) {
                state.pendingStartRequest = true;
            }
            state.props.onStartReached?.({ distanceFromStart: distance });
        },
        (snapshot) => {
            state.startReachedSnapshot = snapshot;
        },
        false,
    );
}

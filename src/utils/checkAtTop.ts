import type { StateContext } from "@/state/state";
import type { InternalState } from "@/types";
import { checkStabilizationComplete } from "@/utils/checkStabilizationComplete";
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
            state.props.onStartReached?.({ distanceFromStart: distance });
        },
        (snapshot) => {
            state.startReachedSnapshot = snapshot;
        },
        false,
    );

    // Always check stabilization after threshold updates
    // This ensures initialization can complete even if not called from context-aware location
    checkStabilizationComplete(state, ctx);
}

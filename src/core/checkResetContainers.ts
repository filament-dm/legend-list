import { calculateItemsInView } from "@/core/calculateItemsInView";
import { doMaintainScrollAtEnd } from "@/core/doMaintainScrollAtEnd";
import { getContentSize } from "@/state/getContentSize";
import type { StateContext } from "@/state/state";
import type { MaintainScrollAtEndOptions } from "@/types";
import { checkAtBottom } from "@/utils/checkAtBottom";
import { checkAtTop } from "@/utils/checkAtTop";
import { checkStabilizationComplete } from "@/utils/checkStabilizationComplete";
import { HYSTERESIS_MULTIPLIER } from "@/utils/checkThreshold";
import { updateAveragesOnDataChange } from "@/utils/updateAveragesOnDataChange";

export function checkResetContainers(ctx: StateContext, dataProp: readonly unknown[]) {
    const state = ctx.state;
    const { previousData } = state;
    // Preserve averages for items that are considered equal before updating data
    if (previousData) {
        updateAveragesOnDataChange(state, previousData, dataProp);
    }
    const { maintainScrollAtEnd } = state.props;

    // Clear pending pagination flags when data arrives
    // This indicates that the async pagination request has completed
    if (state.isInitializing) {
        console.log("[BUFFER-1] Data arrived during initialization, clearing pending flags:", {
            pendingStartRequest: state.pendingStartRequest,
            pendingEndRequest: state.pendingEndRequest,
            dataLength: dataProp.length,
        });
        state.pendingStartRequest = false;
        state.pendingEndRequest = false;
    }

    calculateItemsInView(ctx, { dataChanged: true, doMVCP: true });

    console.log("[BUFFER-2] ⚠️  CRITICAL: After data arrives - NO RE-CENTERING OF ANCHOR!", {
        isInitializing: state.isInitializing,
        stabilizationAnchorId: state.props.stabilizationAnchorId,
        expectedBehavior: "Should call scrollToIndex with viewPosition: 0.5 here",
        actualBehavior: "Only MVCP maintains position, no re-centering happens",
    });

    const shouldMaintainScrollAtEnd =
        maintainScrollAtEnd === true || (maintainScrollAtEnd as MaintainScrollAtEndOptions).onDataChange;

    const didMaintainScrollAtEnd = shouldMaintainScrollAtEnd && doMaintainScrollAtEnd(ctx, false);

    // Always check thresholds after data changes to allow state machine to progress
    checkAtTop(state, ctx);
    checkAtBottom(ctx);

    // During initialization: Clear pending flags after threshold checks
    // The buffer forcing logic below will set them again if pagination is actually needed
    // This prevents false-positive pending flags (from threshold callback re-entry) from blocking stabilization
    if (state.isInitializing) {
        console.log("[BUFFER-FIX] Clearing pending flags after threshold checks during initialization");
        state.pendingStartRequest = false;
        state.pendingEndRequest = false;
    }

    // During initialization: Force pagination until viewport is filled
    // This drives the paginate-until-full loop by forcing flags to false
    // when content is insufficient AND more data is available, ensuring callbacks fire again after each data load
    if (state.isInitializing) {
        const contentSize = getContentSize(ctx);
        const { scrollLength, scroll } = state;
        const { onEndReachedThreshold, onStartReachedThreshold, hasMoreEnd, hasMoreStart } = state.props;

        // Use hysteresis multiplier to guarantee we're outside the threshold zone
        // Content must extend beyond: scroll + viewport + (threshold * 130%)
        const endThreshold = (onEndReachedThreshold ?? 0.5) * scrollLength;
        const startThreshold = (onStartReachedThreshold ?? 0.5) * scrollLength;

        // During initialization with an anchor, measure distances from the anchor position
        // rather than from the viewport edges. This ensures distances grow as content is
        // added, even when MVCP adjusts scroll position to maintain anchor visibility.
        let distanceFromEnd: number;
        let distanceFromStart: number;

        if (state.props.stabilizationAnchorId) {
            const anchorPosition = state.positions.get(state.props.stabilizationAnchorId);

            if (anchorPosition !== undefined) {
                // Distance from anchor to edges of content
                distanceFromStart = anchorPosition;
                distanceFromEnd = contentSize - anchorPosition;
            } else {
                // Fallback: anchor not yet positioned, use viewport-based distances
                distanceFromStart = scroll;
                distanceFromEnd = contentSize - scroll - scrollLength;
            }
        } else {
            // No anchor (live timeline), use viewport-based distances
            distanceFromStart = scroll;
            distanceFromEnd = contentSize - scroll - scrollLength;
        }

        console.log("[BUFFER-3] Checking buffer sufficiency during initialization:", {
            maintainScrollAtEnd,
            contentSize,
            scrollLength,
            scroll,
            distanceFromEnd,
            distanceFromStart,
            endThresholdRequired: endThreshold * HYSTERESIS_MULTIPLIER,
            startThresholdRequired: startThreshold * HYSTERESIS_MULTIPLIER,
            hasMoreEnd,
            hasMoreStart,
            stabilizationAnchorId: state.props.stabilizationAnchorId,
            anchorPosition: state.props.stabilizationAnchorId ? state.positions.get(state.props.stabilizationAnchorId) : undefined,
            usingAnchorBasedDistance: !!state.props.stabilizationAnchorId && state.positions.get(state.props.stabilizationAnchorId) !== undefined,
        });

        if (maintainScrollAtEnd) {
            // Live chat: only need backward buffer (older messages at index 0)
            const needsStartBuffer = distanceFromStart < startThreshold * HYSTERESIS_MULTIPLIER;
            console.log("[BUFFER-4] Chat mode buffer check:", {
                needsStartBuffer,
                hasMoreStart,
                willForceStartReached: needsStartBuffer && hasMoreStart,
            });

            // Set buffer sufficiency flag for stabilization check
            state.isStartBufferSufficient = !needsStartBuffer || !hasMoreStart;
            state.isEndBufferSufficient = true; // Always sufficient in chat mode (at end)

            // Only force to false if we need buffer AND more data is available
            if (needsStartBuffer && hasMoreStart) {
                console.log("[BUFFER-5] FORCING isStartReached = false (needs more start buffer)");
                // Force threshold state to false to bypass hysteresis during initialization
                // This enables repeated pagination even when jittering within the threshold zone
                state.isStartReached = false;
                state.pendingStartRequest = true; // Set pending to prevent premature stabilization
            } else if (needsStartBuffer && !hasMoreStart) {
                console.log("[BUFFER-6] NOT forcing isStartReached (no more start data available)");
            }
            // NOTE: In chat mode, we should set isEndReached = true since we're always at the end
            if (!state.isEndReached) {
                console.log("[BUFFER-7] Chat mode: setting isEndReached = true (always at end)");
                state.isEndReached = true;
            }
        } else {
            // Mid-timeline: check both directions independently
            const needsEndBuffer = distanceFromEnd < endThreshold * HYSTERESIS_MULTIPLIER;
            const needsStartBuffer = distanceFromStart < startThreshold * HYSTERESIS_MULTIPLIER;
            console.log("[BUFFER-8] Mid-timeline mode buffer check:", {
                needsEndBuffer,
                needsStartBuffer,
                hasMoreEnd,
                hasMoreStart,
                willForceEndReached: needsEndBuffer && hasMoreEnd,
                willForceStartReached: needsStartBuffer && hasMoreStart,
            });

            // Set buffer sufficiency flags for stabilization check
            state.isEndBufferSufficient = !needsEndBuffer || !hasMoreEnd;
            state.isStartBufferSufficient = !needsStartBuffer || !hasMoreStart;

            // Only force to false if we need buffer AND more data is available
            if (needsEndBuffer && hasMoreEnd) {
                console.log("[BUFFER-9] FORCING isEndReached = false (needs more end buffer)");
                // Force threshold state to false to bypass hysteresis during initialization
                // This enables repeated pagination even when jittering within the threshold zone
                state.isEndReached = false;
                state.pendingEndRequest = true; // Set pending to prevent premature stabilization
            } else if (needsEndBuffer && !hasMoreEnd) {
                console.log("[BUFFER-10] NOT forcing isEndReached (no more end data available)");
            }

            if (needsStartBuffer && hasMoreStart) {
                console.log("[BUFFER-11] FORCING isStartReached = false (needs more start buffer)");
                // Force threshold state to false to bypass hysteresis during initialization
                // This enables repeated pagination even when jittering within the threshold zone
                state.isStartReached = false;
                state.pendingStartRequest = true; // Set pending to prevent premature stabilization
            } else if (needsStartBuffer && !hasMoreStart) {
                console.log("[BUFFER-12] NOT forcing isStartReached (no more start data available)");
            }
        }
    }

    // Check if stabilization completed and fire callback
    checkStabilizationComplete(state, ctx);

    delete state.previousData;
}

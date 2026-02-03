import { scrollTo } from "@/core/scrollTo";
import { scrollToIndex } from "@/core/scrollToIndex";
import { updateScroll } from "@/core/updateScroll";
import { InitializationCompletionType, InitializationMode } from "@/core/initialization/types";
import { getContentSize } from "@/state/getContentSize";
import {
    type LegendListListenerType,
    type ListenerTypeValueMap,
    listen$,
    listenPosition$,
    peek$,
    type StateContext,
    set$,
} from "@/state/state";
import type { LegendListRef } from "@/types";
import { getId } from "@/utils/getId";
import { getScrollVelocity } from "@/utils/getScrollVelocity";
import { findContainerId, isFunction } from "@/utils/helpers";

export function createImperativeHandle(ctx: StateContext): LegendListRef {
    const state = ctx.state;
    const scrollIndexIntoView = (options: Parameters<LegendListRef["scrollIndexIntoView"]>[0]) => {
        if (state) {
            const { index, onSettled, ...rest } = options;
            const { startNoBuffer, endNoBuffer } = state;
            if (index < startNoBuffer || index > endNoBuffer) {
                // Item is not in view - scroll to it
                const viewPosition = index < startNoBuffer ? 0 : 1;
                scrollToIndex(ctx, {
                    ...rest,
                    index,
                    onSettled,
                    viewPosition,
                });
            } else if (onSettled) {
                // Item is already in view - wrap callback in double RAF and fire directly
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        onSettled();
                    });
                });
            }
        }
    };

    const refScroller = state.refScroller;

    return {
        flashScrollIndicators: () => refScroller.current!.flashScrollIndicators(),
        getNativeScrollRef: () => refScroller.current!,
        getScrollableNode: () => refScroller.current!.getScrollableNode(),
        getScrollResponder: () => refScroller.current!.getScrollResponder(),
        getState: () => ({
            activeStickyIndex: peek$(ctx, "activeStickyIndex"),
            contentLength: getContentSize(ctx),
            data: state.props.data,
            elementAtIndex: (index: number) => ctx.viewRefs.get(findContainerId(ctx, getId(state, index)))?.current,
            end: state.endNoBuffer,
            endBuffered: state.endBuffered,
            isAtEnd: state.isAtEnd,
            isAtStart: state.isAtStart,
            isInitializing: state.isInitializing,
            listen: <T extends LegendListListenerType>(signalName: T, cb: (value: ListenerTypeValueMap[T]) => void) =>
                listen$(ctx, signalName, cb),
            listenToPosition: (key: string, cb: (value: number) => void) => listenPosition$(ctx, key, cb),
            positionAtIndex: (index: number) => state.positions.get(getId(state, index))!,
            positions: state.positions,
            scroll: state.scroll,
            scrollLength: state.scrollLength,
            scrollVelocity: getScrollVelocity(state),
            sizeAtIndex: (index: number) => state.sizesKnown.get(getId(state, index))!,
            sizes: state.sizesKnown,
            start: state.startNoBuffer,
            startBuffered: state.startBuffered,
        }),
        reportContentInset: (inset) => {
            state.contentInsetOverride = inset ?? undefined;
            updateScroll(ctx, state.scroll, true);
        },
        scrollIndexIntoView,
        scrollItemIntoView: ({ item, ...props }) => {
            const data = state.props.data;
            const index = data.indexOf(item);
            if (index !== -1) {
                scrollIndexIntoView({ index, ...props });
            }
        },
        scrollToEnd: (options) => {
            const data = state.props.data;
            const stylePaddingBottom = state.props.stylePaddingBottom;
            const index = data.length - 1;
            if (index !== -1) {
                const paddingBottom = stylePaddingBottom || 0;
                const footerSize = peek$(ctx, "footerSize") || 0;
                scrollToIndex(ctx, {
                    ...options,
                    index,
                    viewOffset: -paddingBottom - footerSize + (options?.viewOffset || 0),
                    viewPosition: 1,
                    isScrollToEnd: true,
                });
            }
        },
        jumpToLatest: (options) => {
            const data = state.props.data;
            const keyExtractor = state.props.keyExtractor;

            // Guard: Check that data exists and has items
            if (!data || data.length === 0) {
                console.warn("[jumpToLatest] No data available, cannot jump to latest");
                return;
            }

            // Exit any current initialization before starting new one
            if (ctx.initializationManager.isInitializing()) {
                ctx.initializationManager.exitInitialization({
                    type: InitializationCompletionType.FAILED,
                    mode: ctx.initializationManager.getMode(),
                    reason: "Interrupted by jumpToLatest call",
                    timelineId: state.props.timelineId,
                    isImperative: ctx.initializationManager.isImperativeInit(),
                });
            }

            // Step 1: Enter initialization in CHAT mode
            // Use actual timelineId from props + isImperative flag to avoid
            // triggering timeline change detection
            ctx.initializationManager.enterInitialization({
                timelineId: state.props.timelineId || "live-timeline",
                isImperative: true, // Mark as imperative to avoid timeline tracking update
                mode: InitializationMode.CHAT, // CHAT mode: anchors to bottom, viewPosition 1.0
                targetViewPosition: 1.0,
            });

            // Step 2 & 3: Identify most recent message and prepare scroll
            const scrollPrepared = ctx.initializationManager.prepareInitialScroll(data, keyExtractor!);

            if (!scrollPrepared) {
                ctx.initializationManager.exitInitialization({
                    type: InitializationCompletionType.FAILED,
                    mode: ctx.initializationManager.getMode(),
                    reason: "Failed to prepare scroll in jumpToLatest",
                    timelineId: state.props.timelineId,
                    isImperative: true,
                });
                return;
            }

            // Step 4: Perform scroll to last item
            const lastIndex = data.length - 1;
            const stylePaddingBottom = state.props.stylePaddingBottom || 0;
            const footerSize = peek$(ctx, "footerSize") || 0;

            scrollToIndex(ctx, {
                index: lastIndex,
                viewPosition: 1.0,
                viewOffset: -stylePaddingBottom - footerSize + (options?.viewOffset || 0),
                animated: options?.animated ?? true,
                isScrollToEnd: true, // Enable retry logic if data changes during scroll
                onSettled: () => {
                    // Step 5: Transition to STABILIZING phase after scroll completes
                    // This enables initialization MVCP to lock the item at the bottom
                    // Note: transitionToStabilizingPhase has a guard to prevent re-entry
                    ctx.initializationManager.transitionToStabilizingPhase();
                },
            });

            // Step 6: Exit happens automatically via checkStabilization after 3 stable frames
            // The initialization manager will call onInitializationComplete when done
        },
        scrollToIndex: (params) => scrollToIndex(ctx, params),
        scrollToItem: ({ item, ...props }) => {
            const data = state.props.data;
            const index = data.indexOf(item);
            if (index !== -1) {
                scrollToIndex(ctx, { index, ...props });
            }
        },
        scrollToOffset: (params) => {
            // Wrap onSettled in double RAF to ensure layout has settled before callback fires
            const wrappedParams = params.onSettled
                ? {
                      ...params,
                      onSettled: () => {
                          requestAnimationFrame(() => {
                              requestAnimationFrame(() => {
                                  params.onSettled!();
                              });
                          });
                      },
                  }
                : params;
            scrollTo(ctx, wrappedParams);
        },
        setScrollProcessingEnabled: (enabled: boolean) => {
            state.scrollProcessingEnabled = enabled;
        },
        setVisibleContentAnchorOffset: (value: number | ((val: number) => number)) => {
            const val = isFunction(value) ? value(peek$(ctx, "scrollAdjustUserOffset") || 0) : value;
            set$(ctx, "scrollAdjustUserOffset", val);
        },
    };
}

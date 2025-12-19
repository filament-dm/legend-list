import { calculateItemsInView } from "@/core/calculateItemsInView";
import { clearExplicitAnchor } from "@/core/clearExplicitAnchor";
import { invalidateItemSizes as invalidateSizes } from "@/core/invalidateItemSizes";
import { scrollTo } from "@/core/scrollTo";
import { scrollToIndex } from "@/core/scrollToIndex";
import { setExplicitAnchor } from "@/core/setExplicitAnchor";
import {
    type LegendListListenerType,
    type ListenerType,
    type ListenerTypeValueMap,
    listen$,
    listenPosition$,
    peek$,
    type StateContext,
    set$,
} from "@/state/state";
import type { LegendListRef } from "@/types";
import { getId } from "@/utils/getId";
import { findContainerId, isFunction } from "@/utils/helpers";

export function createImperativeHandle(ctx: StateContext): LegendListRef {
    const state = ctx.state;
    const scrollIndexIntoView = (options: Parameters<LegendListRef["scrollIndexIntoView"]>[0]) => {
        if (state) {
            const { index, ...rest } = options;
            const { startNoBuffer, endNoBuffer } = state;
            if (index < startNoBuffer || index > endNoBuffer) {
                const viewPosition = index < startNoBuffer ? 0 : 1;
                scrollToIndex(ctx, {
                    ...rest,
                    index,
                    viewPosition,
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
            contentLength: state.totalSize,
            data: state.props.data,
            elementAtIndex: (index: number) => ctx.viewRefs.get(findContainerId(ctx, getId(state, index)))?.current,
            end: state.endNoBuffer,
            endBuffered: state.endBuffered,
            isAtEnd: state.isAtEnd,
            isAtStart: state.isAtStart,
            listen: <T extends LegendListListenerType>(signalName: T, cb: (value: ListenerTypeValueMap[T]) => void) =>
                listen$(ctx, signalName, cb),
            listenToPosition: (key: string, cb: (value: number) => void) => listenPosition$(ctx, key, cb),
            positionAtIndex: (index: number) => state.positions.get(getId(state, index))!,
            positions: state.positions,
            scroll: state.scroll,
            scrollLength: state.scrollLength,
            sizeAtIndex: (index: number) => state.sizesKnown.get(getId(state, index))!,
            sizes: state.sizesKnown,
            start: state.startNoBuffer,
            startBuffered: state.startBuffered,
        }),
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
                });
            }
        },
        scrollToIndex: (params) => scrollToIndex(ctx, params),
        scrollToItem: ({ item, ...props }) => {
            const data = state.props.data;
            const index = data.indexOf(item);
            if (index !== -1) {
                scrollToIndex(ctx, { index, ...props });
            }
        },
        scrollToOffset: (params) => scrollTo(ctx, params),
        setScrollProcessingEnabled: (enabled: boolean) => {
            state.scrollProcessingEnabled = enabled;
        },
        setVisibleContentAnchorOffset: (value: number | ((val: number) => number)) => {
            const val = isFunction(value) ? value(peek$(ctx, "scrollAdjustUserOffset") || 0) : value;
            set$(ctx, "scrollAdjustUserOffset", val);
        },
        invalidateItemSizes: (options) => {
            console.log(
                `[legend-list] invalidateItemSizes called: indices=[${options.indices.join(", ")}], anchor=${options.anchor ? `index ${options.anchor.index}, viewPosition ${options.anchor.viewPosition ?? 1}` : "none"}`,
            );

            // Set explicit anchor if provided
            if (options.anchor) {
                const viewPosition = options.anchor.viewPosition ?? 1;
                setExplicitAnchor(ctx, options.anchor.index, viewPosition);
            }

            // Invalidate the size caches for specified indices
            invalidateSizes(ctx, options.indices);

            // Trigger position recalculation with MVCP
            console.log("[legend-list] invalidateItemSizes: triggering calculateItemsInView with MVCP");
            calculateItemsInView(ctx, { doMVCP: true });

            // Clear the explicit anchor after a microtask to allow MVCP to use it
            if (options.anchor) {
                // Use queueMicrotask if available (modern browsers/Node), otherwise setTimeout
                if (typeof queueMicrotask !== "undefined") {
                    queueMicrotask(() => {
                        clearExplicitAnchor(ctx);
                        console.log("[legend-list] invalidateItemSizes: complete");
                    });
                } else {
                    setTimeout(() => {
                        clearExplicitAnchor(ctx);
                        console.log("[legend-list] invalidateItemSizes: complete");
                    }, 0);
                }
            } else {
                console.log("[legend-list] invalidateItemSizes: complete (no anchor)");
            }
        },
    };
}

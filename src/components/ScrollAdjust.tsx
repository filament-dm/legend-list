import * as React from "react";

import type { ScrollViewMethods } from "@/components/ListComponentScrollView";
import { useValueListener$ } from "@/hooks/useValueListener$";
import { peek$, useStateContext } from "@/state/state";

export function ScrollAdjust() {
    const ctx = useStateContext();
    const lastScrollOffsetRef = React.useRef(0);

    const callback = React.useCallback(() => {
        const scrollAdjust = peek$(ctx, "scrollAdjust");
        const scrollAdjustUserOffset = peek$(ctx, "scrollAdjustUserOffset");

        const scrollOffset = (scrollAdjust || 0) + (scrollAdjustUserOffset || 0);
        const scrollView = ctx.state?.refScroller.current as unknown as ScrollViewMethods;

        if (scrollView && scrollOffset !== lastScrollOffsetRef.current) {
            const scrollDelta = scrollOffset - lastScrollOffsetRef.current;

            if (scrollDelta !== 0) {
                const el = scrollView.getScrollableNode();
                const prevScroll = el.scrollTop;
                console.log(`[LL-DEBUG ScrollAdjust] scrollDelta=${scrollDelta} domScrollTopBefore=${prevScroll} scrollOffset=${scrollOffset} lastOffset=${lastScrollOffsetRef.current} scrollHeight=${el.scrollHeight} clientHeight=${el.clientHeight}`);
                const nextScroll = prevScroll + scrollDelta;
                const totalSize = el.scrollHeight;
                if (
                    scrollDelta > 0 &&
                    totalSize < nextScroll + el.clientHeight
                ) {
                    // If trying to scroll out of bounds of the scroll element's current size
                    // it would clamp the scroll and not do the full adjustment. So we need to
                    // add padding to the scroll element to allow the scroll to complete.
                    const child = el.firstElementChild as HTMLElement;
                    const pad = (nextScroll + el.clientHeight - totalSize) * 2;
                    child.style.paddingBottom = `${pad}px`;
                    // Force a layout update by reading from DOM
                    void el.offsetHeight;

                    scrollView.scrollBy(0, scrollDelta);

                    // After the scrollBy, revert the padding bottom to the padding from the style prop
                    requestAnimationFrame(() => {
                        const paddingBottom = ctx.state.props.stylePaddingBottom;
                        child.style.paddingBottom = paddingBottom ? `${paddingBottom}px` : "0";
                    });
                } else {
                    scrollView.scrollBy(0, scrollDelta);
                }

                // Detect scroll clamping: if the browser couldn't scroll as far as requested,
                // correct state.scroll to match the actual DOM position to prevent divergence.
                const actualScroll = el.scrollTop;
                const expectedScroll = prevScroll + scrollDelta;
                const drift = actualScroll - expectedScroll;
                if (Math.abs(drift) > 1) {
                    console.log(`[LL-DEBUG ScrollAdjust] DRIFT CORRECTION: drift=${drift} correcting state.scroll from ${ctx.state.scroll} to ${ctx.state.scroll + drift}`);
                    ctx.state.scroll += drift;
                }
                console.log(`[LL-DEBUG ScrollAdjust] domScrollTopAfter=${actualScroll} expectedScrollTop=${expectedScroll} drift=${drift}`);
            }

            lastScrollOffsetRef.current = scrollOffset;
        }
    }, [ctx]);

    useValueListener$("scrollAdjust", callback);
    useValueListener$("scrollAdjustUserOffset", callback);

    // Don't render, this manually operates on the DOM
    return null;
}

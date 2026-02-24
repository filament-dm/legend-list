import { calculateItemsInView } from "@/core/calculateItemsInView";
import { calculateOffsetForIndex } from "@/core/calculateOffsetForIndex";
import { calculateOffsetWithOffsetPosition } from "@/core/calculateOffsetWithOffsetPosition";
import { checkFinishedScroll } from "@/core/checkFinishedScroll";
import { clampScrollOffset } from "@/core/clampScrollOffset";
import { PlatformAdjustBreaksScroll } from "@/platform/Platform";
import { type StateContext, set$ } from "@/state/state";
import type { ScrollTarget } from "@/types.base";

export class ScrollAdjustHandler {
    private appliedAdjust = 0;
    private pendingAdjust = 0;
    private ctx: StateContext;

    constructor(ctx: StateContext) {
        this.ctx = ctx;
    }
    requestAdjust(add: number) {
        const scrollingTo = this.ctx.state.scrollingTo;

        if (PlatformAdjustBreaksScroll && scrollingTo?.animated && !scrollingTo.isInitialScroll) {
            this.pendingAdjust += add;
            set$(this.ctx, "scrollAdjustPending", this.pendingAdjust);
        } else {
            this.appliedAdjust += add;
            set$(this.ctx, "scrollAdjust", this.appliedAdjust);
        }

        if (this.ctx.state.scrollingTo) {
            checkFinishedScroll(this.ctx);
        }
    }
    getAdjust() {
        return this.appliedAdjust;
    }
    commitPendingAdjust(scrollTarget: ScrollTarget) {
        if (PlatformAdjustBreaksScroll) {
            // On web and Android, adjust during a scrollTo breaks the scrollTo,
            // so we need to set scrollAdjustPending while doing the scrollTo
            // and then do the normal scrollBy when it's finished.
            const state = this.ctx.state;
            const pending = this.pendingAdjust;

            // Clear pending state
            this.pendingAdjust = 0;

            if (pending !== 0) {
                let targetScroll: number;

                // If we have a scroll target with an index, recalculate the correct
                // position based on where the target item is NOW, not just add pendingAdjust
                if (scrollTarget?.index !== undefined) {
                    let targetIndex = scrollTarget.index;

                    // Special handling for scrollToEnd: always resolve to current last index
                    if (scrollTarget.isScrollToEnd) {
                        const currentLastIndex = state.props.data.length - 1;
                        if (currentLastIndex >= 0 && currentLastIndex !== targetIndex) {
                            targetIndex = currentLastIndex;
                        }
                    }
                    // If we have itemKey, look up the current index (handles data changes like prepending)
                    // This prevents the stale index bug where the index points to a different item after data changes
                    else if (scrollTarget.itemKey !== undefined) {
                        const currentIndex = state.indexByKey.get(scrollTarget.itemKey);
                        if (currentIndex !== undefined) {
                            targetIndex = currentIndex;
                        }
                    }

                    // Get the target item's current position
                    const currentOffset = calculateOffsetForIndex(this.ctx, targetIndex);
                    // Apply viewOffset and viewPosition to get the final scroll position
                    targetScroll = calculateOffsetWithOffsetPosition(this.ctx, currentOffset, scrollTarget);
                    targetScroll = clampScrollOffset(this.ctx, targetScroll, scrollTarget);
                } else {
                    // Fallback: just add pending to current scroll
                    targetScroll = clampScrollOffset(this.ctx, state.scroll + pending);
                }

                const adjustment = targetScroll - state.scroll;

                if (Math.abs(adjustment) > 0.1 || Math.abs(pending) > 0.1) {
                    this.appliedAdjust += adjustment;
                    state.scroll = targetScroll;

                    state.scrollForNextCalculateItemsInView = undefined;

                    set$(this.ctx, "scrollAdjust", this.appliedAdjust);
                }

                set$(this.ctx, "scrollAdjustPending", 0);
                calculateItemsInView(this.ctx);
            }
        }
    }
}

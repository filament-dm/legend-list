import { finishScrollTo } from "@/core/finishScrollTo";
import { Platform } from "@/platform/Platform";
import type { StateContext } from "@/state/state";
import { checkFinishedScrollFallback } from "./checkFinishedScroll";

export interface DoScrollToParams {
    animated?: boolean;
    horizontal?: boolean;
    isInitialScroll?: boolean;
    offset: number;
}

const SCROLL_END_IDLE_MS = 80;
const SCROLL_END_MAX_MS = 1500;
const SMOOTH_SCROLL_DURATION_MS = 320;

export function doScrollTo(ctx: StateContext, params: DoScrollToParams) {
    const state = ctx.state;
    const { animated, horizontal, offset } = params;
    const scroller = state.refScroller.current as any;
    const node: HTMLElement | null =
        typeof scroller?.getScrollableNode === "function" ? scroller.getScrollableNode() : scroller;

    if (node) {
        const left = horizontal ? offset : 0;
        const top = horizontal ? 0 : offset;

        node.scrollTo({ behavior: animated ? "smooth" : "auto", left, top });

        if (animated) {
            listenForScrollEnd(ctx, node);
            // Only use fallback timeout on native platforms where scrollend events aren't reliable.
            // On web, listenForScrollEnd provides proper event-based handling (scrollend event + idle timeout + max timeout).
            // checkFinishedScrollFallback would race with listenForScrollEnd and call finishScrollTo prematurely.
            if (Platform.OS !== "web") {
                checkFinishedScrollFallback(ctx);
            }
        } else {
            state.scroll = offset;
            setTimeout(() => {
                finishScrollTo(ctx);
            }, 100);
        }
    }
}

function listenForScrollEnd(ctx: StateContext, node: HTMLElement): () => void {
    const supportsScrollEnd = "onscrollend" in node;
    let idleTimeout: ReturnType<typeof setTimeout> | undefined;
    let maxTimeout: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    const targetToken = ctx.state.scrollingTo;

    const finish = () => {
        if (settled) return;
        settled = true;

        cleanup();

        // If another scrollTo wasn't triggered since this started, finish the scrollTo
        if (targetToken === ctx.state.scrollingTo) {
            finishScrollTo(ctx);
        }
    };

    const onScroll = () => {
        if (idleTimeout) {
            clearTimeout(idleTimeout);
        }
        idleTimeout = setTimeout(finish, SCROLL_END_IDLE_MS);
    };

    const cleanup = () => {
        if (supportsScrollEnd) {
            node.removeEventListener("scrollend", finish);
        } else {
            (node as HTMLElement).removeEventListener("scroll", onScroll);
        }

        if (idleTimeout) {
            clearTimeout(idleTimeout);
        }
        if (maxTimeout) {
            clearTimeout(maxTimeout);
        }
    };

    if (supportsScrollEnd) {
        node.addEventListener("scrollend", finish, { once: true });
    } else {
        (node as HTMLElement).addEventListener("scroll", onScroll);
        idleTimeout = setTimeout(finish, SMOOTH_SCROLL_DURATION_MS);
        maxTimeout = setTimeout(finish, SCROLL_END_MAX_MS);
    }

    return cleanup;
}

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

    console.log("[doScrollTo] Called with:", {
        animated,
        currentScroll: state.scroll,
        hasNode: !!node,
        hasOnSettled: !!state.scrollingTo?.onSettled,
        hasScroller: !!scroller,
        horizontal,
        nodeCurrentScrollTop: node?.scrollTop,
        offset,
    });

    if (node) {
        const left = horizontal ? offset : 0;
        const top = horizontal ? 0 : offset;

        console.log("[doScrollTo] Calling node.scrollTo with:", { behavior: animated ? "smooth" : "auto", left, top });
        node.scrollTo({ behavior: animated ? "smooth" : "auto", left, top });
        console.log("[doScrollTo] After scrollTo, node.scrollTop:", node.scrollTop);

        if (animated) {
            // console.log("[doScrollTo] Setting up listenForScrollEnd");
            listenForScrollEnd(ctx, node);
            // Only use fallback timeout on native platforms where scrollend events aren't reliable.
            // On web, listenForScrollEnd provides proper event-based handling (scrollend event + idle timeout + max timeout).
            // checkFinishedScrollFallback would race with listenForScrollEnd and call finishScrollTo prematurely.
            if (Platform.OS !== "web") {
                checkFinishedScrollFallback(ctx);
            }
        } else {
            // console.log("[doScrollTo] Non-animated, setting 100ms timeout");
            state.scroll = offset;
            setTimeout(() => {
                // console.log("[doScrollTo] Timeout fired, calling finishScrollTo");
                finishScrollTo(ctx);
            }, 100);
        }
    } else {
        // console.error("[doScrollTo] No node found!", { hasScroller: !!scroller });
    }
}

function listenForScrollEnd(ctx: StateContext, node: HTMLElement): () => void {
    const supportsScrollEnd = "onscrollend" in node;
    let idleTimeout: ReturnType<typeof setTimeout> | undefined;
    let maxTimeout: ReturnType<typeof setTimeout> | undefined;
    let settled = false;
    const targetToken = ctx.state.scrollingTo;

    // console.log("[listenForScrollEnd] Setup:", {
    //     supportsScrollEnd,
    //     hasToken: !!targetToken,
    //     hasCallback: !!targetToken?.onSettled,
    // });

    const finish = (reason: string) => {
        if (settled) {
            // console.log("[listenForScrollEnd] finish() already settled, ignoring:", reason);
            return;
        }
        settled = true;

        // console.log("[listenForScrollEnd] finish() called:", {
        //     reason,
        //     tokenMatch: targetToken === ctx.state.scrollingTo,
        //     hasCallback: !!ctx.state.scrollingTo?.onSettled,
        // });

        cleanup();

        // If another scrollTo wasn't triggered since this started, finish the scrollTo
        if (targetToken === ctx.state.scrollingTo) {
            // console.log("[listenForScrollEnd] Token matches, calling finishScrollTo");
            finishScrollTo(ctx);
        } else {
            // console.warn("[listenForScrollEnd] Token mismatch! Invoking orphaned callback anyway");
            // CRITICAL FIX: Don't lose callbacks on token mismatch
            if (targetToken?.onSettled) {
                targetToken.onSettled();
            }
        }
    };

    const onScroll = () => {
        // console.log("[listenForScrollEnd] scroll event, resetting idle timeout");
        if (idleTimeout) {
            clearTimeout(idleTimeout);
        }
        idleTimeout = setTimeout(() => finish("idle-timeout"), SCROLL_END_IDLE_MS);
    };

    const cleanup = () => {
        // console.log("[listenForScrollEnd] Cleaning up");
        if (supportsScrollEnd) {
            node.removeEventListener("scrollend", finish as any);
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
        // console.log("[listenForScrollEnd] Using scrollend event + max timeout fallback");
        node.addEventListener("scrollend", () => finish("scrollend-event"), { once: true });
        // CRITICAL FIX: Add max timeout even for scrollend to prevent callback loss
        maxTimeout = setTimeout(() => finish("max-timeout-scrollend"), SCROLL_END_MAX_MS);
    } else {
        // console.log("[listenForScrollEnd] Using scroll events + timeouts");
        (node as HTMLElement).addEventListener("scroll", onScroll);
        idleTimeout = setTimeout(() => finish("initial-timeout"), SMOOTH_SCROLL_DURATION_MS);
        maxTimeout = setTimeout(() => finish("max-timeout"), SCROLL_END_MAX_MS);
    }

    return cleanup;
}

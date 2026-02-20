import * as React$1 from 'react';
import { ScrollViewComponent, ScrollResponderMixin, Insets as Insets$1 } from 'react-native';
import { ScrollHandlerProcessed, ScrollEvent } from 'react-native-reanimated';
import { AnimatedLegendListProps } from '@legendapp/list/reanimated';

declare enum MvcpMode {
    NONE = "none",
    REGULAR = "regular",
    INITIALIZATION = "initialization"
}
type ListenerType = "activeStickyIndex" | "debugComputedScroll" | "debugRawScroll" | "extraData" | "footerSize" | "headerSize" | "lastItemKeys" | "lastPositionUpdate" | "maintainVisibleContentPosition" | "mvcpMode" | "numColumns" | "numContainers" | "numContainersPooled" | "otherAxisSize" | "readyToRender" | "scrollAdjust" | "scrollAdjustPending" | "scrollAdjustUserOffset" | "scrollSize" | "snapToOffsets" | "stylePaddingTop" | "totalSize" | `containerColumn${number}` | `containerSpan${number}` | `containerItemData${number}` | `containerItemKey${number}` | `containerPosition${number}` | `containerSticky${number}`;
type LegendListListenerType = Extract<ListenerType, "activeStickyIndex" | "footerSize" | "headerSize" | "lastItemKeys" | "lastPositionUpdate" | "numContainers" | "numContainersPooled" | "otherAxisSize" | "readyToRender" | "snapToOffsets" | "totalSize">;
type ListenerTypeValueMap = {
    activeStickyIndex: number;
    animatedScrollY: any;
    debugComputedScroll: number;
    debugRawScroll: number;
    extraData: any;
    footerSize: number;
    headerSize: number;
    lastItemKeys: string[];
    lastPositionUpdate: number;
    maintainVisibleContentPosition: MaintainVisibleContentPositionNormalized;
    mvcpMode: MvcpMode;
    numColumns: number;
    numContainers: number;
    numContainersPooled: number;
    otherAxisSize: number;
    readyToRender: boolean;
    scrollAdjust: number;
    scrollAdjustPending: number;
    scrollAdjustUserOffset: number;
    scrollSize: {
        width: number;
        height: number;
    };
    snapToOffsets: number[];
    stylePaddingTop: number;
    totalSize: number;
} & {
    [K in ListenerType as K extends `containerItemKey${number}` ? K : never]: string;
} & {
    [K in ListenerType as K extends `containerItemData${number}` ? K : never]: any;
} & {
    [K in ListenerType as K extends `containerPosition${number}` ? K : never]: number;
} & {
    [K in ListenerType as K extends `containerColumn${number}` ? K : never]: number;
} & {
    [K in ListenerType as K extends `containerSpan${number}` ? K : never]: number;
} & {
    [K in ListenerType as K extends `containerSticky${number}` ? K : never]: boolean;
};

interface Insets {
    top: number;
    left: number;
    bottom: number;
    right: number;
}
interface MaintainVisibleContentPositionNormalized<ItemT = any> {
    data: boolean;
    size: boolean;
    shouldRestorePosition?: (item: ItemT, index: number, data: readonly ItemT[]) => boolean;
}
type LegendListState = {
    activeStickyIndex: number;
    contentLength: number;
    data: readonly any[];
    elementAtIndex: (index: number) => any;
    end: number;
    endBuffered: number;
    isAtEnd: boolean;
    isAtStart: boolean;
    isInitializing: boolean;
    listen: <T extends LegendListListenerType>(listenerType: T, callback: (value: ListenerTypeValueMap[T]) => void) => () => void;
    listenToPosition: (key: string, callback: (value: number) => void) => () => void;
    positionAtIndex: (index: number) => number;
    positions: Map<string, number>;
    scroll: number;
    scrollLength: number;
    scrollVelocity: number;
    sizeAtIndex: (index: number) => number;
    sizes: Map<string, number>;
    start: number;
    startBuffered: number;
};
type LegendListRef$1 = {
    /**
     * Displays the scroll indicators momentarily.
     */
    flashScrollIndicators(): void;
    /**
     * Returns the native ScrollView component reference.
     */
    getNativeScrollRef(): any;
    /**
     * Returns the scroll responder instance for handling scroll events.
     */
    getScrollableNode(): any;
    /**
     * Returns the ScrollResponderMixin for advanced scroll handling.
     */
    getScrollResponder(): any;
    /**
     * Returns the internal state of the scroll virtualization.
     */
    getState(): LegendListState;
    /**
     * Scrolls a specific index into view.
     * @param params - Parameters for scrolling.
     * @param params.animated - If true, animates the scroll. Default: true.
     * @param params.index - The index to scroll to.
     * @param params.onSettled - Optional callback invoked when the scroll operation completes.
     */
    scrollIndexIntoView(params: {
        animated?: boolean | undefined;
        index: number;
        onSettled?: () => void;
    }): void;
    /**
     * Scrolls a specific item into view.
     * @param params - Parameters for scrolling.
     * @param params.animated - If true, animates the scroll. Default: true.
     * @param params.item - The item to scroll to.
     * @param params.onSettled - Optional callback invoked when the scroll operation completes.
     */
    scrollItemIntoView(params: {
        animated?: boolean | undefined;
        item: any;
        onSettled?: () => void;
    }): void;
    /**
     * Scrolls to the end of the list.
     * @param options - Options for scrolling.
     * @param options.animated - If true, animates the scroll. Default: true.
     * @param options.viewOffset - Offset from the target position.
     * @param options.onSettled - Optional callback invoked when the scroll operation completes.
     */
    scrollToEnd(options?: {
        animated?: boolean | undefined;
        viewOffset?: number | undefined;
        onSettled?: () => void;
    }): void;
    /**
     * Jumps to the most recent item (bottom of list) with stabilization.
     * Unlike scrollToEnd, this method enters initialization mode to keep the
     * most recent item locked at the bottom of the viewport while items may resize
     * (e.g., links unfurling, images loading, estimated sizes adjusting).
     *
     * Use case: "Jump to latest" button in chat interfaces when switching to live timeline.
     * The method will:
     * 1. Enter initialization mode (disables pagination)
     * 2. Scroll to the last item
     * 3. Lock it at the bottom while items stabilize
     * 4. Exit automatically after 3 stable frames
     *
     * This is unlike other scrollTo methods in that it explicitly enters initialization.
     * Intended for user-initiated jumps to the live timeline.
     * Instead of an onSettled callback, use the onInitializationComplete prop and set it
     * to respond to "stabilized-chat" completions.
     * @param options - Options for jumping.
     * @param options.animated - If true, animates the scroll. Default: true.
     * @param options.viewOffset - Offset from the target position.
     */
    jumpToLatest(options?: {
        animated?: boolean | undefined;
        viewOffset?: number | undefined;
    }): void;
    /**
     * Scrolls to a specific index in the list.
     * @param params - Parameters for scrolling.
     * @param params.animated - If true, animates the scroll. Default: true.
     * @param params.index - The index to scroll to.
     * @param params.viewOffset - Offset from the target position.
     * @param params.viewPosition - Position of the item in the viewport (0 to 1).
     * @param params.onSettled - Optional callback invoked when the scroll operation completes.
     */
    scrollToIndex(params: {
        animated?: boolean | undefined;
        index: number;
        viewOffset?: number | undefined;
        viewPosition?: number | undefined;
        onSettled?: () => void;
    }): void;
    /**
     * Scrolls to a specific item in the list.
     * @param params - Parameters for scrolling.
     * @param params.animated - If true, animates the scroll. Default: true.
     * @param params.item - The item to scroll to.
     * @param params.viewOffset - Offset from the target position.
     * @param params.viewPosition - Position of the item in the viewport (0 to 1).
     * @param params.onSettled - Optional callback invoked when the scroll operation completes.
     */
    scrollToItem(params: {
        animated?: boolean | undefined;
        item: any;
        viewOffset?: number | undefined;
        viewPosition?: number | undefined;
        onSettled?: () => void;
    }): void;
    /**
     * Scrolls to a specific offset in pixels.
     * @param params - Parameters for scrolling.
     * @param params.offset - The pixel offset to scroll to.
     * @param params.animated - If true, animates the scroll. Default: true.
     * @param params.onSettled - Optional callback invoked when the scroll operation completes.
     */
    scrollToOffset(params: {
        offset: number;
        animated?: boolean | undefined;
        onSettled?: () => void;
    }): void;
    /**
     * Sets or adds to the offset of the visible content anchor.
     * @param value - The offset to set or add.
     * @param animated - If true, uses Animated to animate the change.
     */
    setVisibleContentAnchorOffset(value: number | ((val: number) => number)): void;
    /**
     * Sets whether scroll processing is enabled.
     * @param enabled - If true, scroll processing is enabled.
     */
    setScrollProcessingEnabled(enabled: boolean): void;
    /**
     * Clears internal virtualization caches.
     * @param options - Cache clearing options.
     * @param options.mode - `sizes` clears measurement caches. `full` also clears key/position caches.
     */
    clearCaches(options?: {
        mode?: "sizes" | "full";
    }): void;
    /**
     * Reports an externally measured content inset. Pass null/undefined to clear.
     * Values are merged on top of props/animated/native insets.
     */
    reportContentInset(inset?: Partial<Insets> | null): void;
};

type LegendListRef = Omit<LegendListRef$1, "getNativeScrollRef" | "getScrollResponder" | "reportContentInset"> & {
    getNativeScrollRef(): React.ElementRef<typeof ScrollViewComponent>;
    getScrollResponder(): ScrollResponderMixin;
    reportContentInset(inset?: Partial<Insets$1> | null): void;
};

type KeyboardOnScrollCallback = (event: ScrollEvent) => void;
type KeyboardOnScrollHandler = KeyboardOnScrollCallback | ScrollHandlerProcessed<Record<string, unknown>>;
declare const KeyboardAvoidingLegendList: <ItemT>(props: Omit<AnimatedLegendListProps<ItemT>, "onScroll" | "automaticallyAdjustContentInsets" | "contentInset"> & {
    onScroll?: KeyboardOnScrollHandler;
    contentInset?: Insets$1 | undefined;
    safeAreaInsetBottom?: number;
} & React$1.RefAttributes<LegendListRef>) => React$1.ReactNode;

export { KeyboardAvoidingLegendList };

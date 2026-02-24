import * as react_native from 'react-native';
import { SectionListData, ScrollViewComponent, ScrollResponderMixin, Insets as Insets$1, ScrollViewProps, NativeSyntheticEvent as NativeSyntheticEvent$1, NativeScrollEvent as NativeScrollEvent$1, ScrollView, StyleProp as StyleProp$1, ViewStyle as ViewStyle$1, SectionBase, SectionListRenderItemInfo, SectionListScrollParams } from 'react-native';
import * as React$1 from 'react';
import { ReactNode, Key, ReactElement } from 'react';

type SectionListSeparatorProps<ItemT, SectionT> = {
    leadingItem?: ItemT;
    leadingSection?: SectionListData<ItemT, SectionT>;
    section: SectionListData<ItemT, SectionT>;
    trailingItem?: ItemT;
    trailingSection?: SectionListData<ItemT, SectionT>;
};
type SectionHeaderItem<SectionT> = {
    kind: "header";
    key: string;
    section: SectionT;
    sectionIndex: number;
};
type SectionFooterItem<SectionT> = {
    kind: "footer";
    key: string;
    section: SectionT;
    sectionIndex: number;
};
type SectionBodyItem<ItemT, SectionT> = {
    kind: "item";
    key: string;
    section: SectionT;
    sectionIndex: number;
    item: ItemT;
    itemIndex: number;
    absoluteItemIndex: number;
};
type SectionItemSeparator<ItemT, SectionT> = {
    kind: "item-separator";
    key: string;
    section: SectionT;
    sectionIndex: number;
    leadingItem: ItemT;
    leadingItemIndex: number;
    trailingItem?: ItemT;
};
type SectionSeparator<SectionT> = {
    kind: "section-separator";
    key: string;
    leadingSection: SectionT;
    leadingSectionIndex: number;
    trailingSection?: SectionT;
};
type FlatSectionListItem<ItemT, SectionT> = SectionHeaderItem<SectionT> | SectionFooterItem<SectionT> | SectionBodyItem<ItemT, SectionT> | SectionItemSeparator<ItemT, SectionT> | SectionSeparator<SectionT>;
type SectionMeta = {
    header?: number;
    footer?: number;
    items: number[];
};
type BuildSectionListDataResult<ItemT, SectionT> = {
    data: Array<FlatSectionListItem<ItemT, SectionT>>;
    sectionMeta: SectionMeta[];
    stickyHeaderIndices: number[];
};

/**
 * Initialization mode - determines positioning behavior
 *
 * - "mid-timeline": Focused timeline with target message. Center target at viewPosition 0.5,
 *   paginate bidirectionally until both thresholds met.
 * - "chat": Live timeline without target. Position most recent message at bottom (viewPosition 1.0),
 *   paginate backward only (onStartReached) until threshold met.
 * - "chat-with-target": Live timeline with target message. Attempt to position target
 *   (constrained by available content), paginate backward only until threshold met.
 * - "idle": Not initializing.
 */
declare enum InitializationMode {
    CHAT = "chat",
    MID_TIMELINE = "mid-timeline",
    CHAT_WITH_TARGET = "chat-with-target",
    IDLE = "idle"
}
/**
 * Type of initialization completion event
 */
declare enum InitializationCompletionType {
    /**
     * Early exit, currently triggered during a "natural" timeline switch,
     * i.e. focused → live without anchor, as happens when the user navigates
     * to an older message and then scrolls back to the most recent.
     */
    EARLY_EXIT = "early-exit",
    /** Successfully stabilized in mid-timeline mode */
    STABILIZED_MID_TIMELINE = "stabilized-mid-timeline",
    /** Successfully stabilized in chat mode */
    STABILIZED_CHAT = "stabilized-chat",
    /** Successfully stabilized in chat-with-target mode */
    STABILIZED_CHAT_WITH_TARGET = "stabilized-chat-with-target",
    /** Initialization failed or was aborted */
    FAILED = "failed"
}
/**
 * Information passed to onInitializationComplete callback
 */
interface InitializationCompletionInfo {
    /** Type of completion event */
    type: InitializationCompletionType;
    /** The mode that was active during initialization */
    mode: InitializationMode;
    /** Optional reason for failure (only present when type is FAILED) */
    reason?: string;
    /** Timeline ID that was being initialized */
    timelineId?: string;
    /** Whether this was an imperative initialization (jumpToLatest, etc.) */
    isImperative?: boolean;
}

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
interface NativeScrollEvent {
    contentOffset: {
        x: number;
        y: number;
    };
    contentSize: {
        width: number;
        height: number;
    };
    layoutMeasurement: {
        width: number;
        height: number;
    };
    contentInset: Insets;
    zoomScale: number;
}
interface NativeSyntheticEvent<T> {
    nativeEvent: T;
}
type ViewStyle = Record<string, unknown>;
type StyleProp<T> = T | T[] | null | undefined | false;
type BaseScrollViewProps<TScrollView> = Omit<TScrollView, "contentOffset" | "maintainVisibleContentPosition" | "stickyHeaderIndices" | "removeClippedSubviews" | "children" | "onScroll">;
interface DataModeProps<ItemT, TItemType extends string | undefined> {
    /**
     * Array of items to render in the list.
     * @required when using data mode
     */
    data: ReadonlyArray<ItemT>;
    /**
     * Function or React component to render each item in the list.
     * Can be either:
     * - A function: (props: LegendListRenderItemProps<ItemT>) => ReactNode
     * - A React component: React.ComponentType<LegendListRenderItemProps<ItemT>>
     * @required when using data mode
     */
    renderItem: ((props: LegendListRenderItemProps<ItemT, TItemType>) => ReactNode) | React.ComponentType<LegendListRenderItemProps<ItemT, TItemType>>;
    children?: never;
}
interface ChildrenModeProps {
    /**
     * React children elements to render as list items.
     * Each child will be treated as an individual list item.
     * @required when using children mode
     */
    children: ReactNode;
    data?: never;
    renderItem?: never;
}
interface LegendListSpecificProps<ItemT, TItemType extends string | undefined> {
    /**
     * If true, aligns items at the end of the list.
     * @default false
     */
    alignItemsAtEnd?: boolean;
    /**
     * Keeps selected items mounted even when they scroll out of view.
     * @default undefined
     */
    alwaysRender?: AlwaysRenderConfig;
    /**
     * Style applied to each column's wrapper view.
     */
    columnWrapperStyle?: ColumnWrapperStyle;
    /**
     * Distance in pixels to pre-render items ahead of the visible area.
     * @default 250
     */
    drawDistance?: number;
    /**
     * Estimated size of each item in pixels, a hint for the first render. After some
     * items are rendered, the average size of rendered items will be used instead.
     * @default undefined
     */
    estimatedItemSize?: number;
    /**
     * Estimated size of the ScrollView in pixels, a hint for the first render to improve performance
     * @default undefined
     */
    estimatedListSize?: {
        height: number;
        width: number;
    };
    /**
     * Extra data to trigger re-rendering when changed.
     */
    extraData?: any;
    /**
     * Version token that forces the list to treat data as updated even when the array reference is stable.
     * Increment or change this when mutating the data array in place.
     */
    dataVersion?: Key;
    /**
     * In case you have distinct item sizes, you can provide a function to get the size of an item.
     * Use instead of FlatList's getItemLayout or FlashList overrideItemLayout if you want to have accurate initialScrollOffset, you should provide this function
     */
    getEstimatedItemSize?: (item: ItemT, index: number, type: TItemType) => number;
    /**
     * Customize layout for multi-column lists, such as allowing items to span multiple columns.
     * Similar to FlashList's overrideItemLayout.
     */
    overrideItemLayout?: (layout: {
        span?: number;
    }, item: ItemT, index: number, maxColumns: number, extraData?: any) => void;
    /**
     * Ratio of initial container pool size to data length (e.g., 0.5 for half).
     * @default 2
     */
    initialContainerPoolRatio?: number | undefined;
    /**
     * Initial scroll position in pixels.
     * @default 0
     */
    initialScrollOffset?: number;
    /**
     * Index to scroll to initially.
     * @default 0
     */
    initialScrollIndex?: number | {
        index: number;
        viewOffset?: number | undefined;
        viewPosition?: number | undefined;
    };
    /**
     * When true, the list initializes scrolled to the last item.
     * Overrides `initialScrollIndex` and `initialScrollOffset` when data is available.
     * @default false
     */
    initialScrollAtEnd?: boolean;
    /**
     * Component to render between items, receiving the leading item as prop.
     */
    ItemSeparatorComponent?: React.ComponentType<{
        leadingItem: ItemT;
    }>;
    /**
     * Function to extract a unique key for each item.
     */
    keyExtractor?: (item: ItemT, index: number) => string;
    /**
     * Component or element to render when the list is empty.
     */
    ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
    /**
     * Component or element to render below the list.
     */
    ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
    /**
     * Style for the footer component.
     */
    ListFooterComponentStyle?: StyleProp<ViewStyle> | undefined;
    /**
     * Component or element to render above the list.
     */
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
    /**
     * Style for the header component.
     */
    ListHeaderComponentStyle?: StyleProp<ViewStyle> | undefined;
    /**
     * If true, auto-scrolls to end when new items are added.
     * @default false
     */
    maintainScrollAtEnd?: boolean | MaintainScrollAtEndOptions;
    /**
     * Distance threshold in percentage of screen size to trigger maintainScrollAtEnd.
     * @default 0.1
     */
    maintainScrollAtEndThreshold?: number;
    /**
     * Maintains visibility of content.
     * - scroll (default: true) stabilizes during size/layout changes while scrolling.
     * - data (default: false) stabilizes when the data array changes; passing true also sets the RN maintainVisibleContentPosition prop.
     * - shouldRestorePosition can opt out specific items from data-change anchoring.
     * - undefined (default) enables scroll stabilization but skips data-change anchoring.
     * - true enables both behaviors; false disables both.
     */
    maintainVisibleContentPosition?: boolean | MaintainVisibleContentPositionConfig<ItemT>;
    /**
     * Web only: when true, listens to window/body scrolling instead of rendering a scrollable list container.
     * @default false
     */
    useWindowScroll?: boolean;
    /**
     * Timeline identifier that signals when the list is in initialization mode.
     * When this value changes, the list enters initialization mode and will
     * absolutely lock MVCP to the stabilizationAnchorId (if provided) until
     * stabilization completes.
     *
     * Use case: Set to a unique identifier when navigating to a new timeline
     * or jumping to a specific message. The changing value triggers initialization
     * mode, preventing scroll jumps during pagination.
     *
     * Example: "conversation-123:message-456"
     */
    timelineId?: string;
    /**
     * Optional anchor ID to maintain on screen during initialization.
     * When timelineId changes (entering initialization mode), MVCP will
     * absolutely prioritize keeping this item stable while items load around it.
     *
     * Use case: When loading a focused timeline or navigating to a specific message,
     * set this to the target message ID along with a new timelineId.
     */
    stabilizationAnchorId?: string;
    /**
     * Callback fired when initialization completes.
     *
     * @param info - Information about how/why initialization completed, including:
     *   - type: The type of completion (stabilized, early exit, failed)
     *   - mode: The initialization mode that was active
     *   - reason: Optional failure reason (only for failed completions)
     *   - timelineId: The timeline that was being initialized
     *   - isImperative: Whether this was an imperative initialization (jumpToLatest, etc.)
     *
     * You can use the completion info to distinguish between different types of completions:
     * - timeline-switch-early-exit: Timeline switch without anchor (no action needed)
     * - stabilized-chat: jumpToLatest completed (run pendingScrollAction)
     * - stabilized-mid-timeline: Focused timeline completed (run pendingScrollAction)
     * - failed: Initialization failed (handle error)
     */
    onInitializationComplete?: (info: InitializationCompletionInfo) => void;
    /**
     * Enable debug console logging for initialization manager.
     * @default false
     */
    debugInitialization?: boolean;
    /**
     * Number of columns to render items in.
     * @default 1
     */
    numColumns?: number;
    /**
     * Called when scrolling reaches the end within onEndReachedThreshold.
     */
    onEndReached?: ((info: {
        distanceFromEnd: number;
    }) => void) | null | undefined;
    /**
     * How close to the end (in fractional units of visible length) to trigger onEndReached.
     * @default 0.5
     */
    onEndReachedThreshold?: number | null | undefined;
    /**
     * Called when an item's size changes.
     */
    onItemSizeChanged?: (info: {
        size: number;
        previous: number;
        index: number;
        itemKey: string;
        itemData: ItemT;
    }) => void;
    /**
     * Called when list layout metrics change.
     */
    onMetricsChange?: (metrics: LegendListMetrics) => void;
    /**
     * Function to call when the user pulls to refresh.
     */
    onRefresh?: () => void;
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    /**
     * Called when scrolling reaches the start within onStartReachedThreshold.
     */
    onStartReached?: ((info: {
        distanceFromStart: number;
    }) => void) | null | undefined;
    /**
     * How close to the start (in fractional units of visible length) to trigger onStartReached.
     * @default 0.5
     */
    onStartReachedThreshold?: number | null | undefined;
    /**
     * Called when the sticky header changes.
     */
    onStickyHeaderChange?: (info: {
        index: number;
        item: any;
    }) => void;
    /**
     * Called when the viewability of items changes.
     */
    onViewableItemsChanged?: OnViewableItemsChanged<ItemT> | undefined;
    /**
     * Offset in pixels for the refresh indicator.
     * @default 0
     */
    progressViewOffset?: number;
    /**
     * If true, recycles item views for better performance.
     * @default false
     */
    recycleItems?: boolean;
    /**
     * Ref to the underlying ScrollView component.
     */
    refScrollView?: React.Ref<any>;
    /**
     * If true, shows a refresh indicator.
     * @default false
     */
    refreshing?: boolean;
    /**
     * Render custom ScrollView component.
     * Note: When using `stickyHeaderIndices`, you must provide an Animated ScrollView component.
     * @default (props) => <ScrollView {...props} />
     */
    renderScrollComponent?: (props: any) => React.ReactElement | null;
    /**
     * This will log a suggested estimatedItemSize.
     * @required
     * @default false
     */
    suggestEstimatedItemSize?: boolean;
    /**
     * Configuration for determining item viewability.
     */
    viewabilityConfig?: ViewabilityConfig;
    /**
     * Pairs of viewability configs and their callbacks for tracking visibility.
     */
    viewabilityConfigCallbackPairs?: ViewabilityConfigCallbackPairs<ItemT> | undefined;
    /**
     * If true, delays rendering until initial layout is complete.
     * @default false
     */
    waitForInitialLayout?: boolean;
    onLoad?: (info: {
        elapsedTimeInMs: number;
    }) => void;
    snapToIndices?: number[];
    /**
     * Array of child indices determining which children get docked to the top of the screen when scrolling.
     * For example, passing stickyHeaderIndices={[0]} will cause the first child to be fixed to the top of the scroll view.
     * Not supported in conjunction with horizontal={true}.
     * @default undefined
     */
    stickyHeaderIndices?: number[];
    /**
     * @deprecated Use stickyHeaderIndices instead for parity with React Native.
     */
    stickyIndices?: number[];
    /**
     * Configuration for sticky headers.
     * @default undefined
     */
    stickyHeaderConfig?: StickyHeaderConfig;
    getItemType?: (item: ItemT, index: number) => TItemType;
    getFixedItemSize?: (item: ItemT, index: number, type: TItemType) => number | undefined;
    itemsAreEqual?: (itemPrevious: ItemT, item: ItemT, index: number, data: readonly ItemT[]) => boolean;
}
type LegendListPropsBase<ItemT, TScrollViewProps = Record<string, any>, TItemType extends string | undefined = string | undefined> = BaseScrollViewProps<TScrollViewProps> & LegendListSpecificProps<ItemT, TItemType> & (DataModeProps<ItemT, TItemType> | ChildrenModeProps);
interface MaintainVisibleContentPositionConfig<ItemT = any> {
    data?: boolean;
    size?: boolean;
    shouldRestorePosition?: (item: ItemT, index: number, data: readonly ItemT[]) => boolean;
}
interface MaintainVisibleContentPositionNormalized<ItemT = any> {
    data: boolean;
    size: boolean;
    shouldRestorePosition?: (item: ItemT, index: number, data: readonly ItemT[]) => boolean;
}
interface StickyHeaderConfig {
    /**
     * Specifies how far from the top edge sticky headers should start sticking.
     * Useful for scenarios with a fixed navbar or header, where sticky elements pin below it..
     * @default 0
     */
    offset?: number;
    /**
     * Component to render as a backdrop behind the sticky header.
     * @default undefined
     */
    backdropComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
}
interface AlwaysRenderConfig {
    top?: number;
    bottom?: number;
    indices?: number[];
    keys?: string[];
}
interface MaintainScrollAtEndOptions {
    onLayout?: boolean;
    onItemLayout?: boolean;
    onDataChange?: boolean;
}
interface ColumnWrapperStyle {
    rowGap?: number;
    gap?: number;
    columnGap?: number;
}
interface LegendListMetrics {
    headerSize: number;
    footerSize: number;
}
interface LegendListRenderItemProps<ItemT, TItemType extends string | number | undefined = string | number | undefined> {
    data: readonly ItemT[];
    extraData: any;
    index: number;
    item: ItemT;
    type: TItemType;
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
    positionByKey: (key: string) => number | undefined;
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
        isScrollToEnd?: boolean;
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
interface ViewToken<ItemT = any> {
    containerId: number;
    index: number;
    isViewable: boolean;
    item: ItemT;
    key: string;
}
interface ViewabilityConfigCallbackPair<ItemT = any> {
    onViewableItemsChanged?: OnViewableItemsChanged<ItemT>;
    viewabilityConfig: ViewabilityConfig;
}
type ViewabilityConfigCallbackPairs<ItemT> = ViewabilityConfigCallbackPair<ItemT>[];
type OnViewableItemsChanged<ItemT> = ((info: {
    viewableItems: Array<ViewToken<ItemT>>;
    changed: Array<ViewToken<ItemT>>;
}) => void) | null;
interface ViewabilityConfig {
    /**
     * A unique ID to identify this viewability config
     */
    id?: string;
    /**
     * Minimum amount of time (in milliseconds) that an item must be physically viewable before the
     * viewability callback will be fired. A high number means that scrolling through content without
     * stopping will not mark the content as viewable.
     */
    minimumViewTime?: number | undefined;
    /**
     * Percent of viewport that must be covered for a partially occluded item to count as
     * "viewable", 0-100. Fully visible items are always considered viewable. A value of 0 means
     * that a single pixel in the viewport makes the item viewable, and a value of 100 means that
     * an item must be either entirely visible or cover the entire viewport to count as viewable.
     */
    viewAreaCoveragePercentThreshold?: number | undefined;
    /**
     * Similar to `viewAreaCoveragePercentThreshold`, but considers the percent of the item that is visible,
     * rather than the fraction of the viewable area it covers.
     */
    itemVisiblePercentThreshold?: number | undefined;
    /**
     * Nothing is considered viewable until the user scrolls or `recordInteraction` is called after
     * render.
     */
    waitForInteraction?: boolean | undefined;
}

type LegendListPropsOverrides<ItemT, TItemType extends string | undefined> = Omit<LegendListPropsBase<ItemT, ScrollViewProps, TItemType>, "onScroll" | "refScrollView" | "renderScrollComponent" | "ListHeaderComponentStyle" | "ListFooterComponentStyle"> & {
    onScroll?: (event: NativeSyntheticEvent$1<NativeScrollEvent$1>) => void;
    refScrollView?: React.Ref<ScrollView>;
    renderScrollComponent?: (props: ScrollViewProps) => ReactElement<ScrollViewProps>;
    ListHeaderComponentStyle?: StyleProp$1<ViewStyle$1> | undefined;
    ListFooterComponentStyle?: StyleProp$1<ViewStyle$1> | undefined;
};
type LegendListProps<ItemT = any, TItemType extends string | undefined = string | undefined> = LegendListPropsOverrides<ItemT, TItemType>;
type LegendListRef = Omit<LegendListRef$1, "getNativeScrollRef" | "getScrollResponder" | "reportContentInset"> & {
    getNativeScrollRef(): React.ElementRef<typeof ScrollViewComponent>;
    getScrollResponder(): ScrollResponderMixin;
    reportContentInset(inset?: Partial<Insets$1> | null): void;
};

type SectionListViewToken<ItemT, SectionT> = {
    item: ItemT;
    key: string;
    index: number;
    isViewable: boolean;
    section: SectionListData<ItemT, SectionT>;
};
type SectionListOnViewableItemsChanged<ItemT, SectionT> = ((info: {
    viewableItems: Array<SectionListViewToken<ItemT, SectionT>>;
    changed: Array<SectionListViewToken<ItemT, SectionT>>;
}) => void) | null;
type SectionListLegendProps<ItemT, SectionT> = Omit<LegendListProps<FlatSectionListItem<ItemT, SectionT>>, "data" | "children" | "renderItem" | "keyExtractor" | "ItemSeparatorComponent" | "getItemType" | "getFixedItemSize" | "stickyHeaderIndices" | "numColumns" | "columnWrapperStyle" | "onViewableItemsChanged">;
type SectionListProps<ItemT, SectionT extends SectionBase<ItemT> = SectionBase<ItemT>> = SectionListLegendProps<ItemT, SectionT> & {
    sections: ReadonlyArray<SectionListData<ItemT, SectionT>>;
    extraData?: any;
    renderItem?: (info: SectionListRenderItemInfo<ItemT, SectionT>) => React$1.ReactElement | null;
    renderSectionHeader?: (info: {
        section: SectionListData<ItemT, SectionT>;
    }) => React$1.ReactElement | null;
    renderSectionFooter?: (info: {
        section: SectionListData<ItemT, SectionT>;
    }) => React$1.ReactElement | null;
    ItemSeparatorComponent?: React$1.ComponentType<SectionListSeparatorProps<ItemT, SectionT>> | null;
    SectionSeparatorComponent?: React$1.ComponentType<SectionListSeparatorProps<ItemT, SectionT>> | React$1.ReactElement | null;
    keyExtractor?: (item: ItemT, index: number) => string;
    stickySectionHeadersEnabled?: boolean;
    onViewableItemsChanged?: SectionListOnViewableItemsChanged<ItemT, SectionT>;
};
type SectionListRef = LegendListRef & {
    scrollToLocation(params: SectionListScrollParams): void;
};
declare const SectionList: (<ItemT, SectionT extends SectionBase<ItemT, react_native.DefaultSectionT>>(props: SectionListLegendProps<ItemT, SectionT> & {
    sections: readonly SectionListData<ItemT, SectionT>[];
    extraData?: any;
    renderItem?: ((info: SectionListRenderItemInfo<ItemT, SectionT>) => React$1.ReactElement | null) | undefined;
    renderSectionHeader?: ((info: {
        section: SectionListData<ItemT, SectionT>;
    }) => React$1.ReactElement | null) | undefined;
    renderSectionFooter?: ((info: {
        section: SectionListData<ItemT, SectionT>;
    }) => React$1.ReactElement | null) | undefined;
    ItemSeparatorComponent?: React$1.ComponentType<SectionListSeparatorProps<ItemT, SectionT>> | null | undefined;
    SectionSeparatorComponent?: React$1.ReactElement<any, string | React$1.JSXElementConstructor<any>> | React$1.ComponentType<SectionListSeparatorProps<ItemT, SectionT>> | null | undefined;
    keyExtractor?: ((item: ItemT, index: number) => string) | undefined;
    stickySectionHeadersEnabled?: boolean;
    onViewableItemsChanged?: SectionListOnViewableItemsChanged<ItemT, SectionT> | undefined;
} & React$1.RefAttributes<SectionListRef>) => React$1.ReactNode) & {
    displayName?: string;
};

export { type BuildSectionListDataResult, type FlatSectionListItem, SectionList, type SectionListOnViewableItemsChanged, type SectionListProps, type SectionListRef, type SectionListSeparatorProps, type SectionListViewToken, type SectionMeta };

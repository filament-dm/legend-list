import * as React$1 from 'react';
import { ComponentProps, Key, ReactNode } from 'react';
import { View, ScrollView, Animated, LayoutRectangle, ScrollViewProps, Insets, ScrollViewComponent, ScrollResponderMixin, StyleProp, ViewStyle, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import Reanimated from 'react-native-reanimated';

type AnimatedValue = number;

type ListenerType = "activeStickyIndex" | "alignItemsPaddingTop" | "debugComputedScroll" | "debugRawScroll" | "extraData" | "footerSize" | "headerSize" | "lastItemKeys" | "lastPositionUpdate" | "maintainVisibleContentPosition" | "numColumns" | "numContainers" | "numContainersPooled" | "otherAxisSize" | "readyToRender" | "scrollAdjust" | "scrollAdjustPending" | "scrollAdjustUserOffset" | "scrollSize" | "snapToOffsets" | "stylePaddingTop" | "totalSize" | `containerColumn${number}` | `containerItemData${number}` | `containerItemKey${number}` | `containerPosition${number}` | `containerSticky${number}` | `containerStickyOffset${number}`;
type LegendListListenerType = Extract<ListenerType, "activeStickyIndex" | "footerSize" | "headerSize" | "lastItemKeys" | "lastPositionUpdate" | "numContainers" | "numContainersPooled" | "otherAxisSize" | "readyToRender" | "snapToOffsets" | "totalSize">;
type ListenerTypeValueMap = {
    activeStickyIndex: number;
    alignItemsPaddingTop: number;
    animatedScrollY: any;
    debugComputedScroll: number;
    debugRawScroll: number;
    extraData: any;
    footerSize: number;
    headerSize: number;
    lastItemKeys: string[];
    lastPositionUpdate: number;
    maintainVisibleContentPosition: MaintainVisibleContentPositionNormalized;
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
    [K in ListenerType as K extends `containerSticky${number}` ? K : never]: boolean;
} & {
    [K in ListenerType as K extends `containerStickyOffset${number}` ? K : never]: number;
};
interface StateContext {
    animatedScrollY: AnimatedValue;
    columnWrapperStyle: ColumnWrapperStyle | undefined;
    contextNum: number;
    listeners: Map<ListenerType, Set<(value: any) => void>>;
    mapViewabilityCallbacks: Map<string, ViewabilityCallback>;
    mapViewabilityValues: Map<string, ViewToken>;
    mapViewabilityAmountCallbacks: Map<number, ViewabilityAmountCallback>;
    mapViewabilityAmountValues: Map<number, ViewAmountToken>;
    mapViewabilityConfigStates: Map<string, {
        viewableItems: ViewToken[];
        start: number;
        end: number;
        previousStart: number;
        previousEnd: number;
    }>;
    positionListeners: Map<string, Set<(value: any) => void>>;
    state: InternalState;
    values: Map<ListenerType, any>;
    viewRefs: Map<number, React$1.RefObject<View>>;
}

declare class ScrollAdjustHandler {
    private appliedAdjust;
    private pendingAdjust;
    private ctx;
    constructor(ctx: StateContext);
    requestAdjust(add: number): void;
    getAdjust(): number;
    commitPendingAdjust(): void;
}

type BaseSharedValue<T = number> = {
    get: () => T;
};
type StylesAsSharedValue<Style> = {
    [key in keyof Style]: Style[key] | BaseSharedValue<Style[key]>;
};

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
    getEstimatedItemSize?: (index: number, item: ItemT, type: TItemType) => number;
    /**
     * Function to generate a cache invalidation key for item sizes.
     * When the key changes for an item, its cached size is invalidated and
     * getEstimatedItemSize will be called with the new item data.
     * This is useful when item content changes affect size (e.g., images loading, content expanding).
     *
     * @param index - The index of the item in the data array
     * @param item - The item data
     * @param type - The item type (if getItemType is provided)
     * @returns A key representing the item's current size state, or undefined to use cache normally
     *
     * @example
     * ```tsx
     * <LegendList
     *   data={messages}
     *   getItemSizeInvalidationKey={(index, item) =>
     *     item.imageLoaded ? 'loaded' : 'pending'
     *   }
     *   getEstimatedItemSize={(index, item) =>
     *     item.imageLoaded ? 200 : 100
     *   }
     * />
     * ```
     */
    getItemSizeInvalidationKey?: (index: number, item: ItemT, type: TItemType) => string | number | undefined;
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
     * - undefined (default) enables scroll stabilization but skips data-change anchoring.
     * - true enables both behaviors; false disables both.
     */
    maintainVisibleContentPosition?: boolean | MaintainVisibleContentPositionConfig;
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
    refScrollView?: React.Ref<ScrollView>;
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
    renderScrollComponent?: (props: ScrollViewProps) => React.ReactElement<ScrollViewProps>;
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
    getItemType?: (item: ItemT, index: number) => TItemType;
    getFixedItemSize?: (index: number, item: ItemT, type: TItemType) => number | undefined;
    itemsAreEqual?: (itemPrevious: ItemT, item: ItemT, index: number, data: readonly ItemT[]) => boolean;
}
type LegendListPropsBase<ItemT, TScrollView extends ComponentProps<typeof ScrollView> | ComponentProps<typeof Animated.ScrollView> | ComponentProps<typeof Reanimated.ScrollView>, TItemType extends string | undefined = string | undefined> = BaseScrollViewProps<TScrollView> & LegendListSpecificProps<ItemT, TItemType> & (DataModeProps<ItemT, TItemType> | ChildrenModeProps);
interface MaintainVisibleContentPositionConfig {
    data?: boolean;
    size?: boolean;
}
interface MaintainVisibleContentPositionNormalized {
    data: boolean;
    size: boolean;
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
type LegendListProps<ItemT = any> = LegendListPropsBase<ItemT, ComponentProps<typeof ScrollView>>;
interface ThresholdSnapshot {
    scrollPosition: number;
    contentSize?: number;
    dataLength?: number;
    atThreshold: boolean;
}
interface ScrollTarget {
    animated?: boolean;
    index?: number;
    isInitialScroll?: boolean;
    itemSize?: number;
    offset: number;
    precomputedWithViewOffset?: boolean;
    viewOffset?: number;
    viewPosition?: number;
}
interface InternalState {
    activeStickyIndex: number | undefined;
    adjustingFromInitialMount?: number;
    animFrameCheckFinishedScroll?: any;
    averageSizes: Record<string, {
        num: number;
        avg: number;
    }>;
    columns: Map<string, number>;
    containerItemKeys: Set<string>;
    containerItemTypes: Map<number, string>;
    dataChangeNeedsScrollUpdate: boolean;
    didColumnsChange?: boolean;
    didDataChange?: boolean;
    didFinishInitialScroll?: boolean;
    didContainersLayout?: boolean;
    enableScrollForNextCalculateItemsInView: boolean;
    endBuffered: number;
    endNoBuffer: number;
    endReachedSnapshot: ThresholdSnapshot | undefined;
    firstFullyOnScreenIndex: number;
    hasScrolled?: boolean;
    idCache: string[];
    idsInView: string[];
    ignoreScrollFromMVCP?: {
        lt?: number;
        gt?: number;
    };
    ignoreScrollFromMVCPIgnored?: boolean;
    ignoreScrollFromMVCPTimeout?: any;
    indexByKey: Map<string, number>;
    initialAnchor?: InitialScrollAnchor;
    initialScroll: ScrollIndexWithOffsetAndContentOffset | undefined;
    isAtEnd: boolean;
    isAtStart: boolean;
    isEndReached: boolean | null;
    isFirst?: boolean;
    isStartReached: boolean | null;
    lastBatchingAction: number;
    lastLayout: LayoutRectangle | undefined;
    lastScrollAdjustForHistory?: number;
    loadStartTime: number;
    maintainingScrollAtEnd?: boolean;
    minIndexSizeChanged: number | undefined;
    nativeMarginTop: number;
    needsOtherAxisSize?: boolean;
    otherAxisSize?: number;
    pendingTotalSize?: number;
    positions: Map<string, number>;
    previousData?: readonly unknown[];
    queuedCalculateItemsInView: number | undefined;
    queuedInitialLayout?: boolean | undefined;
    refScroller: React.RefObject<ScrollView>;
    scroll: number;
    scrollAdjustHandler: ScrollAdjustHandler;
    scrollForNextCalculateItemsInView: {
        top: number | null;
        bottom: number | null;
    } | undefined;
    scrollHistory: Array<{
        scroll: number;
        time: number;
    }>;
    scrollingTo?: ScrollTarget | undefined;
    scrollLastCalculate?: number;
    scrollLength: number;
    scrollPending: number;
    scrollPrev: number;
    scrollPrevTime: number;
    scrollProcessingEnabled: boolean;
    scrollTime: number;
    sizes: Map<string, number>;
    sizesKnown: Map<string, number>;
    sizeInvalidationKeys: Map<string, string | number>;
    startBuffered: number;
    startBufferedId?: string;
    startNoBuffer: number;
    startReachedSnapshot: ThresholdSnapshot | undefined;
    stickyContainerPool: Set<number>;
    stickyContainers: Map<number, number>;
    timeouts: Set<number>;
    timeoutSetPaddingTop?: any;
    timeoutSizeMessage: any;
    timeoutCheckFinishedScrollFallback?: any;
    totalSize: number;
    triggerCalculateItemsInView?: (params?: {
        doMVCP?: boolean;
        dataChanged?: boolean;
        forceFullItemPositions?: boolean;
    }) => void;
    viewabilityConfigCallbackPairs: ViewabilityConfigCallbackPairs<any> | undefined;
    props: {
        alignItemsAtEnd: boolean;
        animatedProps: StylesAsSharedValue<ScrollViewProps>;
        contentInset: Insets | undefined;
        data: readonly any[];
        dataVersion: Key | undefined;
        estimatedItemSize: number | undefined;
        getEstimatedItemSize: LegendListProps["getEstimatedItemSize"];
        getItemSizeInvalidationKey: LegendListProps["getItemSizeInvalidationKey"];
        getFixedItemSize: LegendListProps["getFixedItemSize"];
        getItemType: LegendListProps["getItemType"];
        horizontal: boolean;
        initialContainerPoolRatio: number;
        itemsAreEqual: LegendListProps["itemsAreEqual"];
        keyExtractor: LegendListProps["keyExtractor"];
        maintainScrollAtEnd: boolean | MaintainScrollAtEndOptions;
        maintainScrollAtEndThreshold: number | undefined;
        maintainVisibleContentPosition: MaintainVisibleContentPositionNormalized;
        numColumns: number;
        onEndReached: LegendListProps["onEndReached"];
        onEndReachedThreshold: number | null | undefined;
        onItemSizeChanged: LegendListProps["onItemSizeChanged"];
        onLoad: LegendListProps["onLoad"];
        onScroll: LegendListProps["onScroll"];
        onStartReached: LegendListProps["onStartReached"];
        onStartReachedThreshold: number | null | undefined;
        onStickyHeaderChange: LegendListProps["onStickyHeaderChange"];
        recycleItems: boolean;
        renderItem: LegendListProps["renderItem"];
        scrollBuffer: number;
        snapToIndices: number[] | undefined;
        stickyIndicesArr: number[];
        stickyIndicesSet: Set<number>;
        stylePaddingBottom: number | undefined;
        stylePaddingTop: number | undefined;
        suggestEstimatedItemSize: boolean;
    };
}
interface ViewableRange<T> {
    end: number;
    endBuffered: number;
    items: T[];
    start: number;
    startBuffered: number;
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
    elementAtIndex: (index: number) => View | null | undefined;
    end: number;
    endBuffered: number;
    isAtEnd: boolean;
    isAtStart: boolean;
    listen: <T extends LegendListListenerType>(listenerType: T, callback: (value: ListenerTypeValueMap[T]) => void) => () => void;
    listenToPosition: (key: string, callback: (value: number) => void) => () => void;
    positionAtIndex: (index: number) => number;
    positions: Map<string, number>;
    scroll: number;
    scrollLength: number;
    sizeAtIndex: (index: number) => number;
    sizes: Map<string, number>;
    start: number;
    startBuffered: number;
};
type LegendListRef = {
    /**
     * Displays the scroll indicators momentarily.
     */
    flashScrollIndicators(): void;
    /**
     * Returns the native ScrollView component reference.
     */
    getNativeScrollRef(): React.ElementRef<typeof ScrollViewComponent>;
    /**
     * Returns the scroll responder instance for handling scroll events.
     */
    getScrollableNode(): any;
    /**
     * Returns the ScrollResponderMixin for advanced scroll handling.
     */
    getScrollResponder(): ScrollResponderMixin;
    /**
     * Returns the internal state of the scroll virtualization.
     */
    getState(): LegendListState;
    /**
     * Scrolls a specific index into view.
     * @param params - Parameters for scrolling.
     * @param params.animated - If true, animates the scroll. Default: true.
     * @param params.index - The index to scroll to.
     */
    scrollIndexIntoView(params: {
        animated?: boolean | undefined;
        index: number;
    }): void;
    /**
     * Scrolls a specific index into view.
     * @param params - Parameters for scrolling.
     * @param params.animated - If true, animates the scroll. Default: true.
     * @param params.item - The item to scroll to.
     */
    scrollItemIntoView(params: {
        animated?: boolean | undefined;
        item: any;
    }): void;
    /**
     * Scrolls to the end of the list.
     * @param options - Options for scrolling.
     * @param options.animated - If true, animates the scroll. Default: true.
     * @param options.viewOffset - Offset from the target position.
     */
    scrollToEnd(options?: {
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
     */
    scrollToIndex(params: {
        animated?: boolean | undefined;
        index: number;
        viewOffset?: number | undefined;
        viewPosition?: number | undefined;
    }): void;
    /**
     * Scrolls to a specific item in the list.
     * @param params - Parameters for scrolling.
     * @param params.animated - If true, animates the scroll. Default: true.
     * @param params.item - The item to scroll to.
     * @param params.viewOffset - Offset from the target position.
     * @param params.viewPosition - Position of the item in the viewport (0 to 1).
     */
    scrollToItem(params: {
        animated?: boolean | undefined;
        item: any;
        viewOffset?: number | undefined;
        viewPosition?: number | undefined;
    }): void;
    /**
     * Scrolls to a specific offset in pixels.
     * @param params - Parameters for scrolling.
     * @param params.offset - The pixel offset to scroll to.
     * @param params.animated - If true, animates the scroll. Default: true.
     */
    scrollToOffset(params: {
        offset: number;
        animated?: boolean | undefined;
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
};
interface ViewToken<ItemT = any> {
    containerId: number;
    index: number;
    isViewable: boolean;
    item: ItemT;
    key: string;
}
interface ViewAmountToken<ItemT = any> extends ViewToken<ItemT> {
    percentOfScroller: number;
    percentVisible: number;
    scrollSize: number;
    size: number;
    sizeVisible: number;
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
type ViewabilityCallback<ItemT = any> = (viewToken: ViewToken<ItemT>) => void;
type ViewabilityAmountCallback<ItemT = any> = (viewToken: ViewAmountToken<ItemT>) => void;
interface LegendListRecyclingState<T> {
    index: number;
    item: T;
    prevIndex: number | undefined;
    prevItem: T | undefined;
}
type TypedForwardRef = <T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactNode) => (props: P & React.RefAttributes<T>) => React.ReactNode;
declare const typedForwardRef: TypedForwardRef;
type TypedMemo = <T extends React.ComponentType<any>>(Component: T, propsAreEqual?: (prevProps: Readonly<React.JSXElementConstructor<T>>, nextProps: Readonly<React.JSXElementConstructor<T>>) => boolean) => T & {
    displayName?: string;
};
declare const typedMemo: TypedMemo;
interface ScrollIndexWithOffset {
    index: number;
    viewOffset?: number;
    viewPosition?: number;
}
interface ScrollIndexWithOffsetPosition extends ScrollIndexWithOffset {
    viewPosition?: number;
}
interface ScrollIndexWithOffsetAndContentOffset extends ScrollIndexWithOffsetPosition {
    contentOffset?: number;
}
interface InitialScrollAnchor extends ScrollIndexWithOffsetPosition {
    attempts?: number;
    lastDelta?: number;
    settledTicks?: number;
}
type GetRenderedItemResult<ItemT> = {
    index: number;
    item: ItemT;
    renderedItem: React.ReactNode;
};
type GetRenderedItem = (key: string) => GetRenderedItemResult<any> | null;

export { type ColumnWrapperStyle as C, type GetRenderedItemResult as G, type InternalState as I, type LegendListProps as L, type MaintainVisibleContentPositionConfig as M, type OnViewableItemsChanged as O, type ScrollTarget as S, type ThresholdSnapshot as T, type ViewabilityCallback as V, type LegendListRef as a, type ViewabilityAmountCallback as b, type LegendListRecyclingState as c, type LegendListPropsBase as d, type MaintainVisibleContentPositionNormalized as e, type MaintainScrollAtEndOptions as f, type ViewableRange as g, type LegendListRenderItemProps as h, type LegendListState as i, type ViewToken as j, type ViewAmountToken as k, type ViewabilityConfigCallbackPair as l, type ViewabilityConfigCallbackPairs as m, type ViewabilityConfig as n, type TypedForwardRef as o, type TypedMemo as p, typedMemo as q, type ScrollIndexWithOffset as r, type ScrollIndexWithOffsetPosition as s, typedForwardRef as t, type ScrollIndexWithOffsetAndContentOffset as u, type InitialScrollAnchor as v, type GetRenderedItem as w };

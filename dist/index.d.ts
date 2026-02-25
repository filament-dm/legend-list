import * as React$1 from 'react';
import { Key, ReactNode, ComponentType, CSSProperties, Ref, ReactElement, JSXElementConstructor, RefAttributes, Dispatch, SetStateAction } from 'react';

/**
 * Initialization system type definitions
 *
 * The initialization system handles scrolling to a specific timeline position
 * (e.g., jumping to a message in chat history) and stabilizing the viewport
 * while items resize.
 */
/**
 * Phases of the initialization process
 * - IDLE: Not initializing, normal list operation
 * - SCROLLING: Positioning to the anchor item
 * - STABILIZING: Waiting for scroll position to stabilize (3 consecutive stable frames)
 */
declare enum InitializationPhase {
    IDLE = "IDLE",
    SCROLLING = "SCROLLING",
    STABILIZING = "STABILIZING"
}
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
 * Configuration for entering initialization mode
 */
interface InitializationConfig {
    /** Unique ID for the timeline being initialized */
    timelineId: string;
    /** Optional anchor item ID to lock to during initialization */
    anchorId?: string;
    /** Initialization mode (inferred from props if not specified) */
    mode?: InitializationMode;
    /** Target viewport position for anchor (0.5 = center, 1.0 = bottom) */
    targetViewPosition?: number;
    /**
     * Whether this is an imperative initialization (e.g., from jumpToLatest())
     * rather than a prop-driven initialization (e.g., from timeline change).
     * Imperative initializations don't update timeline tracking to avoid
     * triggering cascading timeline change detection.
     * @default false
     */
    isImperative?: boolean;
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

/**
 * Initialization Manager
 *
 * Centralizes all initialization state and logic. The initialization system handles
 * scrolling to a specific timeline position (e.g., jumping to a message in chat history)
 * and stabilizing the viewport while items resize.
 *
 * This manager provides a single source of truth for initialization state and
 * clear interfaces for the rest of the system to interact with initialization behavior.
 */

/**
 * Manages initialization state and behavior
 */
declare class InitializationManager {
    private state;
    private ctx;
    private stabilizationCheckId;
    constructor(ctx: StateContext);
    /**
     * Check if debug logging is enabled for initialization
     */
    private shouldLog;
    /**
     * Set MVCP mode declaratively based on initialization phase
     */
    private setMvcpMode;
    /**
     * Enter initialization mode for a new timeline
     */
    enterInitialization(config: InitializationConfig): void;
    /**
     * Prepare initial scroll configuration when data arrives
     * This replaces the logic previously in LegendList.tsx lines 407-430
     *
     * @param data - Current data array
     * @param keyExtractor - Function to extract keys from items
     * @returns true if initial scroll was prepared, false if anchor not found or data empty
     */
    prepareInitialScroll(data: readonly unknown[], keyExtractor: (item: unknown, index: number) => string): boolean;
    /**
     * Enter SCROLLING phase - called after initial scroll is prepared
     * During this phase, the target item is being positioned and pagination/MVCP are blocked
     */
    enterScrollingPhase(): void;
    /**
     * Transition from SCROLLING to STABILIZING phase - called after initial scroll completes
     * Skips FILLING phase since app provides sufficient data upfront (no pagination needed)
     */
    transitionToStabilizingPhase(): void;
    /**
     * Exit initialization mode
     * @param completionInfo - Information about how/why initialization completed
     */
    exitInitialization(completionInfo?: InitializationCompletionInfo): void;
    /**
     * Start the stabilization checking loop
     * Continuously checks for stable frames using requestAnimationFrame
     */
    private startStabilizationLoop;
    /**
     * Stop the stabilization checking loop
     */
    private stopStabilizationLoop;
    /**
     * Check if initialization is active
     */
    isInitializing(): boolean;
    /**
     * Get the current initialization mode
     */
    getMode(): InitializationMode;
    /**
     * Check if current initialization is imperative (e.g., from jumpToLatest())
     * Returns false if not initializing
     */
    isImperativeInit(): boolean;
    /**
     * Get current initialization phase
     */
    getCurrentPhase(): InitializationPhase;
    /**
     * Check if initial scroll has completed
     */
    didCompleteInitialScroll(): boolean;
    /**
     * Check if MVCP should be locked to anchor
     */
    shouldLockMVCP(): boolean;
    /**
     * Get MVCP anchor override (if should lock)
     * Returns undefined if MVCP should use normal behavior
     */
    getMVCPAnchorOverride(): string | undefined;
    /**
     * Get the initialization mode (chat, mid-timeline, chat-with-target, or idle)
     */
    getInitializationMode(): InitializationMode;
    /**
     * Get the target viewport position for the anchor
     * Returns undefined if not initializing or no target position set
     */
    getTargetViewPosition(): number | undefined;
    /**
     * Check if re-centering should be performed
     * Returns true only once after initial scroll completes and before first recenter
     */
    shouldRecenterAnchor(): boolean;
    /**
     * Mark that initial scroll to anchor has completed
     */
    markInitialScrollComplete(): void;
    /**
     * Mark that initial re-centering has been performed
     */
    markRecenterComplete(): void;
    /**
     * Increment stabilization frame counter
     */
    incrementStabilizationFrames(): void;
    /**
     * Reset stabilization frame counter
     */
    resetStabilizationFrames(): void;
    /**
     * Get current stabilization frame count
     */
    getStabilizationFrames(): number;
    /**
     * Handle MVCP adjustment during initialization
     * Resets stabilization frame counter when scroll position is adjusted significantly.
     *
     * Note: Called from requestAdjust() only for adjustments > 1px to avoid infinite
     * loops caused by sub-pixel position changes during data updates.
     */
    onMVCPAdjusted(): void;
    /**
     * After initial layout, items may resize or shift due to images loading, fonts rendering,
     * url previews expanding, etc. This can cause the target message to move away from the
     * intended viewport position. During STABILIZING phase, initializationMVCP is active to
     * keep the target item at the correct viewport position.
     *
     * This method counts 3 consecutive stable frames (no MVCP adjustments needed) before
     * declaring initialization complete. The counter is reset by onMVCPAdjusted() whenever
     * scroll position needs adjustment due to item resizing.
     *
     * @returns true if stabilization is complete and initialization exited
     */
    checkStabilization(): boolean;
}

type AnimatedValue = number;

type LooseMeasureCallback = (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void;
interface LooseView {
    measure?: (callback: LooseMeasureCallback) => void;
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
    maintainVisibleContentPosition: MaintainVisibleContentPositionNormalized$1;
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
interface StateContext {
    animatedScrollY: AnimatedValue;
    columnWrapperStyle: ColumnWrapperStyle$1 | undefined;
    contextNum: number;
    initializationManager: InitializationManager;
    listeners: Map<ListenerType, Set<(value: any) => void>>;
    mapViewabilityCallbacks: Map<string, ViewabilityCallback$1>;
    mapViewabilityValues: Map<string, ViewToken$1>;
    mapViewabilityAmountCallbacks: Map<number, ViewabilityAmountCallback$1>;
    mapViewabilityAmountValues: Map<number, ViewAmountToken$1>;
    mapViewabilityConfigStates: Map<string, {
        viewableItems: ViewToken$1[];
        start: number;
        end: number;
        previousStart: number;
        previousEnd: number;
    }>;
    positionListeners: Map<string, Set<(value: any) => void>>;
    state: InternalState$1;
    values: Map<ListenerType, any>;
    viewRefs: Map<number, React$1.RefObject<LooseView>>;
}

declare class ScrollAdjustHandler {
    private appliedAdjust;
    private pendingAdjust;
    private ctx;
    constructor(ctx: StateContext);
    requestAdjust(add: number): void;
    getAdjust(): number;
    commitPendingAdjust(scrollTarget: ScrollTarget$1): void;
}

type BaseSharedValue<T = number> = {
    get: () => T;
};
type StylesAsSharedValue<Style> = {
    [key in keyof Style]: Style[key] | BaseSharedValue<Style[key]>;
};

interface Insets$1 {
    top: number;
    left: number;
    bottom: number;
    right: number;
}
interface LayoutRectangle$1 {
    x: number;
    y: number;
    width: number;
    height: number;
}
interface NativeScrollEvent$1 {
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
    contentInset: Insets$1;
    zoomScale: number;
}
interface NativeSyntheticEvent$1<T> {
    nativeEvent: T;
}
type ViewStyle$1 = Record<string, unknown>;
type StyleProp$1<T> = T | T[] | null | undefined | false;
interface ScrollEventTargetLike$1 {
    addEventListener(type: string, listener: (...args: any[]) => void): void;
    removeEventListener(type: string, listener: (...args: any[]) => void): void;
}
interface ScrollableNodeLike$1 {
    scrollLeft?: number;
    scrollTop?: number;
}
interface LegendListScrollerRef$1 {
    flashScrollIndicators(): void;
    getCurrentScrollOffset?(): number;
    getScrollEventTarget(): ScrollEventTargetLike$1 | null;
    getScrollableNode(): ScrollableNodeLike$1 | null;
    getScrollResponder(): unknown;
    scrollTo(options: {
        animated?: boolean;
        x?: number;
        y?: number;
    }): void;
    scrollToEnd(options?: {
        animated?: boolean;
    }): void;
}
type BaseScrollViewProps$1<TScrollView> = Omit<TScrollView, "contentOffset" | "maintainVisibleContentPosition" | "stickyHeaderIndices" | "removeClippedSubviews" | "children" | "onScroll">;
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
    renderItem: ((props: LegendListRenderItemProps$1<ItemT, TItemType>) => ReactNode) | React.ComponentType<LegendListRenderItemProps$1<ItemT, TItemType>>;
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
    alwaysRender?: AlwaysRenderConfig$1;
    /**
     * Style applied to each column's wrapper view.
     */
    columnWrapperStyle?: ColumnWrapperStyle$1;
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
    ListFooterComponentStyle?: StyleProp$1<ViewStyle$1> | undefined;
    /**
     * Component or element to render above the list.
     */
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null | undefined;
    /**
     * Style for the header component.
     */
    ListHeaderComponentStyle?: StyleProp$1<ViewStyle$1> | undefined;
    /**
     * If true, auto-scrolls to end when new items are added.
     * @default false
     */
    maintainScrollAtEnd?: boolean | MaintainScrollAtEndOptions$1;
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
    maintainVisibleContentPosition?: boolean | MaintainVisibleContentPositionConfig$1<ItemT>;
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
     * Enable debug console logging for size measurements and MVCP calculations.
     * Useful for debugging list position drift and collapse issues.
     * @default false
     */
    debugSizing?: boolean;
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
    onMetricsChange?: (metrics: LegendListMetrics$1) => void;
    /**
     * Function to call when the user pulls to refresh.
     */
    onRefresh?: () => void;
    onScroll?: (event: NativeSyntheticEvent$1<NativeScrollEvent$1>) => void;
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
    onViewableItemsChanged?: OnViewableItemsChanged$1<ItemT> | undefined;
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
    viewabilityConfig?: ViewabilityConfig$1;
    /**
     * Pairs of viewability configs and their callbacks for tracking visibility.
     */
    viewabilityConfigCallbackPairs?: ViewabilityConfigCallbackPairs$1<ItemT> | undefined;
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
    stickyHeaderConfig?: StickyHeaderConfig$1;
    getItemType?: (item: ItemT, index: number) => TItemType;
    getFixedItemSize?: (item: ItemT, index: number, type: TItemType) => number | undefined;
    itemsAreEqual?: (itemPrevious: ItemT, item: ItemT, index: number, data: readonly ItemT[]) => boolean;
}
type LegendListPropsBase$1<ItemT, TScrollViewProps = Record<string, any>, TItemType extends string | undefined = string | undefined> = BaseScrollViewProps$1<TScrollViewProps> & LegendListSpecificProps<ItemT, TItemType> & (DataModeProps<ItemT, TItemType> | ChildrenModeProps);
type LegendListPropsInternal = LegendListSpecificProps<any, string | undefined> & DataModeProps<any, string | undefined>;
interface MaintainVisibleContentPositionConfig$1<ItemT = any> {
    data?: boolean;
    size?: boolean;
    shouldRestorePosition?: (item: ItemT, index: number, data: readonly ItemT[]) => boolean;
}
interface MaintainVisibleContentPositionNormalized$1<ItemT = any> {
    data: boolean;
    size: boolean;
    shouldRestorePosition?: (item: ItemT, index: number, data: readonly ItemT[]) => boolean;
}
interface StickyHeaderConfig$1 {
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
interface AlwaysRenderConfig$1 {
    top?: number;
    bottom?: number;
    indices?: number[];
    keys?: string[];
}
interface MaintainScrollAtEndOptions$1 {
    onLayout?: boolean;
    onItemLayout?: boolean;
    onDataChange?: boolean;
}
interface ColumnWrapperStyle$1 {
    rowGap?: number;
    gap?: number;
    columnGap?: number;
}
interface LegendListMetrics$1 {
    headerSize: number;
    footerSize: number;
}
interface ThresholdSnapshot$1 {
    scrollPosition: number;
    contentSize?: number;
    dataLength?: number;
    atThreshold: boolean;
}
interface ScrollTarget$1 {
    animated?: boolean;
    index?: number;
    isInitialScroll?: boolean;
    /**
     * The item key (ID) for the target item. This allows looking up the current index
     * after data changes (insertions, deletions, reordering), preventing stale index bugs.
     */
    itemKey?: string;
    /**
     * If true, this scroll operation is a "scroll to end" operation.
     * During scroll, the target will always resolve to the current last index (data.length - 1),
     * not a specific item. MVCP adjustments are also disabled to prevent interference.
     */
    isScrollToEnd?: boolean;
    itemSize?: number;
    offset: number;
    /**
     * Optional callback invoked when the scroll operation completes.
     * This fires after scroll animations complete, or after layout settles (via double RAF) when no scroll is needed.
     */
    onSettled?: () => void;
    precomputedWithViewOffset?: boolean;
    viewOffset?: number;
    viewPosition?: number;
    /**
     * Number of retry attempts for scroll-to-end operations.
     * Used to prevent infinite retry loops when data keeps changing.
     */
    retryCount?: number;
}
interface InternalState$1 {
    activeStickyIndex: number | undefined;
    adjustingFromInitialMount?: number;
    animFrameCheckFinishedScroll?: any;
    averageSizes: Record<string, {
        num: number;
        avg: number;
    }>;
    columns: Array<number | undefined>;
    columnSpans: Array<number | undefined>;
    containerItemKeys: Map<string, number>;
    containerItemTypes: Map<number, string>;
    dataChangeEpoch: number;
    dataChangeNeedsScrollUpdate: boolean;
    didColumnsChange?: boolean;
    didDataChange?: boolean;
    didFinishInitialScroll?: boolean;
    didContainersLayout?: boolean;
    enableScrollForNextCalculateItemsInView: boolean;
    endBuffered: number;
    endNoBuffer: number;
    endReachedSnapshot: ThresholdSnapshot$1 | undefined;
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
    initialAnchor?: InitialScrollAnchor$1;
    initialScroll: ScrollIndexWithOffsetAndContentOffset$1 | undefined;
    isAtEnd: boolean;
    isAtStart: boolean;
    isEndReached: boolean | null;
    isFirst?: boolean;
    isStartReached: boolean | null;
    isInitializing: boolean;
    isEndBufferSufficient: boolean;
    isStartBufferSufficient: boolean;
    lastTimelineId: string | undefined;
    lastStabilizationAnchorId: string | undefined;
    pendingEndRequest: boolean;
    pendingStartRequest: boolean;
    stabilizationStableFrames: number;
    lastBatchingAction: number;
    lastLayout: LayoutRectangle$1 | undefined;
    lastScrollAdjustForHistory?: number;
    lastScrollDelta: number;
    loadStartTime: number;
    maintainingScrollAtEnd?: boolean;
    minIndexSizeChanged: number | undefined;
    mvcpAnchorLock?: {
        id: string;
        position: number;
        quietPasses: number;
        expiresAt: number;
    };
    contentInsetOverride?: Partial<Insets$1> | null;
    nativeContentInset?: Insets$1;
    nativeMarginTop: number;
    needsOtherAxisSize?: boolean;
    otherAxisSize?: number;
    pendingTotalSize?: number;
    pendingScrollResolve?: (() => void) | undefined;
    positions: Array<number | undefined>;
    previousData?: readonly unknown[];
    queuedCalculateItemsInView: number | undefined;
    queuedMVCPRecalculate?: number;
    queuedInitialLayout?: boolean | undefined;
    refScroller: React.RefObject<LegendListScrollerRef$1 | null>;
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
    scrollingTo?: ScrollTarget$1 | undefined;
    scrollLastCalculate?: number;
    scrollLength: number;
    scrollPending: number;
    scrollPrev: number;
    scrollPrevTime: number;
    scrollProcessingEnabled: boolean;
    scrollTime: number;
    sizes: Map<string, number>;
    sizesKnown: Map<string, number>;
    dataRefWhenMeasured: Map<string, any>;
    startBuffered: number;
    startBufferedId?: string;
    startNoBuffer: number;
    startReachedSnapshotDataChangeEpoch: number | undefined;
    startReachedSnapshot: ThresholdSnapshot$1 | undefined;
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
    viewabilityConfigCallbackPairs: ViewabilityConfigCallbackPairs$1<any> | undefined;
    props: {
        alignItemsAtEnd: boolean;
        animatedProps: StylesAsSharedValue<Record<string, any>>;
        alwaysRender: AlwaysRenderConfig$1 | undefined;
        alwaysRenderIndicesArr: number[];
        alwaysRenderIndicesSet: Set<number>;
        contentInset: Insets$1 | undefined;
        data: readonly any[];
        dataVersion: Key | undefined;
        drawDistance: number;
        estimatedItemSize: number | undefined;
        getEstimatedItemSize: LegendListPropsInternal["getEstimatedItemSize"];
        getFixedItemSize: LegendListPropsInternal["getFixedItemSize"];
        getItemType: LegendListPropsInternal["getItemType"];
        horizontal: boolean;
        initialContainerPoolRatio: number;
        itemsAreEqual: LegendListPropsInternal["itemsAreEqual"];
        keyExtractor: LegendListPropsInternal["keyExtractor"];
        maintainScrollAtEnd: boolean | MaintainScrollAtEndOptions$1;
        maintainScrollAtEndThreshold: number | undefined;
        maintainVisibleContentPosition: MaintainVisibleContentPositionNormalized$1;
        numColumns: number;
        onEndReached: LegendListPropsInternal["onEndReached"];
        onEndReachedThreshold: number | null | undefined;
        onItemSizeChanged: LegendListPropsInternal["onItemSizeChanged"];
        onLoad: LegendListPropsInternal["onLoad"];
        onInitializationComplete: LegendListPropsInternal["onInitializationComplete"];
        onScroll: LegendListPropsInternal["onScroll"];
        onStartReached: LegendListPropsInternal["onStartReached"];
        onStartReachedThreshold: number | null | undefined;
        onStickyHeaderChange: LegendListPropsInternal["onStickyHeaderChange"];
        overrideItemLayout: LegendListPropsInternal["overrideItemLayout"];
        recycleItems: boolean;
        renderItem: LegendListPropsInternal["renderItem"];
        scrollBuffer?: number;
        snapToIndices: number[] | undefined;
        positionComponentInternal: React.ComponentType<any> | undefined;
        stabilizationAnchorId: LegendListPropsInternal["stabilizationAnchorId"];
        stickyPositionComponentInternal: React.ComponentType<any> | undefined;
        stickyIndicesArr: number[];
        stickyIndicesSet: Set<number>;
        stylePaddingBottom: number | undefined;
        stylePaddingTop: number | undefined;
        suggestEstimatedItemSize: boolean;
        useWindowScroll: boolean;
        debugInitialization: boolean;
        debugSizing: boolean;
        timelineId: LegendListPropsInternal["timelineId"];
    };
}
interface ViewableRange$1<T> {
    end: number;
    endBuffered: number;
    items: T[];
    start: number;
    startBuffered: number;
}
interface LegendListRenderItemProps$1<ItemT, TItemType extends string | number | undefined = string | number | undefined> {
    data: readonly ItemT[];
    extraData: any;
    index: number;
    item: ItemT;
    type: TItemType;
}
type LegendListState$1 = {
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
    getState(): LegendListState$1;
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
    reportContentInset(inset?: Partial<Insets$1> | null): void;
};
interface ViewToken$1<ItemT = any> {
    containerId: number;
    index: number;
    isViewable: boolean;
    item: ItemT;
    key: string;
}
interface ViewAmountToken$1<ItemT = any> extends ViewToken$1<ItemT> {
    percentOfScroller: number;
    percentVisible: number;
    scrollSize: number;
    size: number;
    sizeVisible: number;
}
interface ViewabilityConfigCallbackPair$1<ItemT = any> {
    onViewableItemsChanged?: OnViewableItemsChanged$1<ItemT>;
    viewabilityConfig: ViewabilityConfig$1;
}
type ViewabilityConfigCallbackPairs$1<ItemT> = ViewabilityConfigCallbackPair$1<ItemT>[];
type OnViewableItemsChanged$1<ItemT> = ((info: {
    viewableItems: Array<ViewToken$1<ItemT>>;
    changed: Array<ViewToken$1<ItemT>>;
}) => void) | null;
interface ViewabilityConfig$1 {
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
type ViewabilityCallback$1<ItemT = any> = (viewToken: ViewToken$1<ItemT>) => void;
type ViewabilityAmountCallback$1<ItemT = any> = (viewToken: ViewAmountToken$1<ItemT>) => void;
interface LegendListRecyclingState$1<T> {
    index: number;
    item: T;
    prevIndex: number | undefined;
    prevItem: T | undefined;
}
type TypedForwardRef$1 = <T, P = {}>(render: (props: P, ref: React.Ref<T>) => React.ReactNode) => (props: P & React.RefAttributes<T>) => React.ReactNode;
declare const typedForwardRef: TypedForwardRef$1;
type TypedMemo$1 = <T extends React.ComponentType<any>>(Component: T, propsAreEqual?: (prevProps: Readonly<React.JSXElementConstructor<T>>, nextProps: Readonly<React.JSXElementConstructor<T>>) => boolean) => T & {
    displayName?: string;
};
declare const typedMemo: TypedMemo$1;
interface ScrollIndexWithOffset$1 {
    index: number;
    viewOffset?: number;
    viewPosition?: number;
}
interface ScrollIndexWithOffsetPosition$1 extends ScrollIndexWithOffset$1 {
    viewPosition?: number;
}
interface ScrollIndexWithOffsetAndContentOffset$1 extends ScrollIndexWithOffsetPosition$1 {
    contentOffset?: number;
}
interface InitialScrollAnchor$1 extends ScrollIndexWithOffsetPosition$1 {
    attempts?: number;
    lastDelta?: number;
    settledTicks?: number;
}
type GetRenderedItemResult$1<ItemT> = {
    index: number;
    item: ItemT;
    renderedItem: React.ReactNode;
};
type GetRenderedItem$1 = (key: string) => GetRenderedItemResult$1<any> | null;

/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type Insets = Insets$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LayoutRectangle = LayoutRectangle$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type NativeScrollEvent = NativeScrollEvent$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type NativeSyntheticEvent<T> = NativeSyntheticEvent$1<T>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ViewStyle = ViewStyle$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type StyleProp<T> = StyleProp$1<T>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ScrollEventTargetLike = ScrollEventTargetLike$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ScrollableNodeLike = ScrollableNodeLike$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LegendListScrollerRef = LegendListScrollerRef$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type BaseScrollViewProps<TScrollView> = BaseScrollViewProps$1<TScrollView>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LegendListPropsBase<ItemT, TScrollViewProps = Record<string, any>, TItemType extends string | undefined = string | undefined> = LegendListPropsBase$1<ItemT, TScrollViewProps, TItemType>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type MaintainVisibleContentPositionConfig<ItemT = any> = MaintainVisibleContentPositionConfig$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type MaintainVisibleContentPositionNormalized<ItemT = any> = MaintainVisibleContentPositionNormalized$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type StickyHeaderConfig = StickyHeaderConfig$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type AlwaysRenderConfig = AlwaysRenderConfig$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type MaintainScrollAtEndOptions = MaintainScrollAtEndOptions$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ColumnWrapperStyle = ColumnWrapperStyle$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LegendListMetrics = LegendListMetrics$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ThresholdSnapshot = ThresholdSnapshot$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ScrollTarget = ScrollTarget$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type InternalState = InternalState$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ViewableRange<T> = ViewableRange$1<T>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LegendListRenderItemProps<ItemT, TItemType extends string | number | undefined = string | number | undefined> = LegendListRenderItemProps$1<ItemT, TItemType>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LegendListState = LegendListState$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LegendListRef = LegendListRef$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ViewToken<ItemT = any> = ViewToken$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ViewAmountToken<ItemT = any> = ViewAmountToken$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ViewabilityConfigCallbackPair<ItemT = any> = ViewabilityConfigCallbackPair$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ViewabilityConfigCallbackPairs<ItemT> = ViewabilityConfigCallbackPairs$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type OnViewableItemsChanged<ItemT> = OnViewableItemsChanged$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ViewabilityConfig = ViewabilityConfig$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ViewabilityCallback<ItemT = any> = ViewabilityCallback$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ViewabilityAmountCallback<ItemT = any> = ViewabilityAmountCallback$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LegendListRecyclingState<T> = LegendListRecyclingState$1<T>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type TypedForwardRef = TypedForwardRef$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type TypedMemo = TypedMemo$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ScrollIndexWithOffset = ScrollIndexWithOffset$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ScrollIndexWithOffsetPosition = ScrollIndexWithOffsetPosition$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ScrollIndexWithOffsetAndContentOffset = ScrollIndexWithOffsetAndContentOffset$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type InitialScrollAnchor = InitialScrollAnchor$1;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type GetRenderedItemResult<ItemT> = GetRenderedItemResult$1<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type GetRenderedItem = GetRenderedItem$1;
interface LooseAccessibilityActionEvent {
    nativeEvent?: {
        actionName?: string;
    };
}
type AccessibilityActionEvent = LooseAccessibilityActionEvent;
type LooseAccessibilityRole = string;
type AccessibilityRole = LooseAccessibilityRole;
interface LooseAccessibilityState {
    busy?: boolean;
    checked?: boolean | "mixed";
    disabled?: boolean;
    expanded?: boolean;
    selected?: boolean;
}
type AccessibilityState = LooseAccessibilityState;
interface LooseAccessibilityValue {
    max?: number;
    min?: number;
    now?: number;
    text?: string;
}
type AccessibilityValue = LooseAccessibilityValue;
type LooseColorValue = string | number;
type ColorValue = LooseColorValue;
interface LooseGestureResponderEvent {
    nativeEvent?: unknown;
}
type GestureResponderEvent = LooseGestureResponderEvent;
interface LoosePointerEvent {
    nativeEvent?: unknown;
}
type PointerEvent = LoosePointerEvent;
interface LooseRefreshControlProps {
    onRefresh?: () => void;
    progressViewOffset?: number;
    refreshing?: boolean;
}
type RefreshControlProps = LooseRefreshControlProps;
type LooseRole = string;
type Role = LooseRole;
interface PointProp {
    x: number;
    y: number;
}
interface LayoutChangeEvent {
    nativeEvent: {
        layout: LayoutRectangle;
    };
}
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
interface LooseScrollViewProps {
    StickyHeaderComponent?: ComponentType<unknown>;
    accessibilityActions?: Array<{
        label?: string;
        name: string;
    }>;
    accessibilityElementsHidden?: boolean;
    accessibilityHint?: string;
    accessibilityIgnoresInvertColors?: boolean;
    accessibilityLabel?: string;
    accessibilityLabelledBy?: string | string[];
    accessibilityLanguage?: string;
    accessibilityLargeContentTitle?: string;
    accessibilityLiveRegion?: "none" | "polite" | "assertive";
    accessibilityRespondsToUserInteraction?: boolean;
    accessibilityRole?: AccessibilityRole;
    accessibilityShowsLargeContentViewer?: boolean;
    accessibilityState?: AccessibilityState;
    accessibilityValue?: AccessibilityValue;
    accessibilityViewIsModal?: boolean;
    accessible?: boolean;
    alwaysBounceHorizontal?: boolean;
    alwaysBounceVertical?: boolean;
    "aria-busy"?: boolean;
    "aria-checked"?: boolean | "mixed";
    "aria-disabled"?: boolean;
    "aria-expanded"?: boolean;
    "aria-hidden"?: boolean;
    "aria-label"?: string;
    "aria-labelledby"?: string;
    "aria-live"?: "polite" | "assertive" | "off";
    "aria-modal"?: boolean;
    "aria-selected"?: boolean;
    "aria-valuemax"?: number;
    "aria-valuemin"?: number;
    "aria-valuenow"?: number;
    "aria-valuetext"?: string;
    automaticallyAdjustContentInsets?: boolean;
    automaticallyAdjustKeyboardInsets?: boolean;
    automaticallyAdjustsScrollIndicatorInsets?: boolean;
    bounces?: boolean;
    bouncesZoom?: boolean;
    canCancelContentTouches?: boolean;
    centerContent?: boolean;
    children?: ReactNode;
    collapsable?: boolean;
    collapsableChildren?: boolean;
    contentContainerStyle?: StyleProp<ViewStyle> | CSSProperties;
    contentInset?: Insets;
    contentInsetAdjustmentBehavior?: "always" | "never" | "automatic" | "scrollableAxes";
    contentOffset?: PointProp;
    decelerationRate?: number | "fast" | "normal";
    directionalLockEnabled?: boolean;
    disableIntervalMomentum?: boolean;
    disableScrollViewPanResponder?: boolean;
    endFillColor?: ColorValue;
    fadingEdgeLength?: number | {
        end?: number;
        start?: number;
    };
    focusable?: boolean;
    hasTVPreferredFocus?: boolean;
    hitSlop?: number | Insets;
    horizontal?: boolean;
    id?: string;
    importantForAccessibility?: "auto" | "yes" | "no" | "no-hide-descendants";
    indicatorStyle?: "default" | "black" | "white";
    innerViewRef?: Ref<unknown>;
    invertStickyHeaders?: boolean;
    isTVSelectable?: boolean;
    keyboardDismissMode?: "none" | "interactive" | "on-drag";
    keyboardShouldPersistTaps?: boolean | "always" | "never" | "handled";
    maintainVisibleContentPosition?: {
        autoscrollToTopThreshold?: number;
        minIndexForVisible: number;
    };
    maximumZoomScale?: number;
    minimumZoomScale?: number;
    nativeID?: string;
    needsOffscreenAlphaCompositing?: boolean;
    nestedScrollEnabled?: boolean;
    onAccessibilityAction?: (event: AccessibilityActionEvent) => void;
    onAccessibilityEscape?: () => void;
    onAccessibilityTap?: () => void;
    onBlur?: (event: unknown) => void;
    onContentSizeChange?: (width: number, height: number) => void;
    onFocus?: (event: unknown) => void;
    onLayout?: (event: LayoutChangeEvent) => void;
    onMagicTap?: () => void;
    onMomentumScrollBegin?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onMomentumScrollEnd?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onMoveShouldSetResponder?: (event: GestureResponderEvent) => boolean;
    onMoveShouldSetResponderCapture?: (event: GestureResponderEvent) => boolean;
    onPointerCancel?: (event: PointerEvent) => void;
    onPointerCancelCapture?: (event: PointerEvent) => void;
    onPointerDown?: (event: PointerEvent) => void;
    onPointerDownCapture?: (event: PointerEvent) => void;
    onPointerEnter?: (event: PointerEvent) => void;
    onPointerEnterCapture?: (event: PointerEvent) => void;
    onPointerLeave?: (event: PointerEvent) => void;
    onPointerLeaveCapture?: (event: PointerEvent) => void;
    onPointerMove?: (event: PointerEvent) => void;
    onPointerMoveCapture?: (event: PointerEvent) => void;
    onPointerUp?: (event: PointerEvent) => void;
    onPointerUpCapture?: (event: PointerEvent) => void;
    onResponderEnd?: (event: GestureResponderEvent) => void;
    onResponderGrant?: (event: GestureResponderEvent) => void;
    onResponderMove?: (event: GestureResponderEvent) => void;
    onResponderReject?: (event: GestureResponderEvent) => void;
    onResponderRelease?: (event: GestureResponderEvent) => void;
    onResponderStart?: (event: GestureResponderEvent) => void;
    onResponderTerminate?: (event: GestureResponderEvent) => void;
    onResponderTerminationRequest?: (event: GestureResponderEvent) => boolean;
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onScrollAnimationEnd?: () => void;
    onScrollBeginDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onScrollEndDrag?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onScrollToTop?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
    onStartShouldSetResponder?: (event: GestureResponderEvent) => boolean;
    onStartShouldSetResponderCapture?: (event: GestureResponderEvent) => boolean;
    onTouchCancel?: (event: GestureResponderEvent) => void;
    onTouchEnd?: (event: GestureResponderEvent) => void;
    onTouchEndCapture?: (event: GestureResponderEvent) => void;
    onTouchMove?: (event: GestureResponderEvent) => void;
    onTouchStart?: (event: GestureResponderEvent) => void;
    overScrollMode?: "always" | "never" | "auto";
    pagingEnabled?: boolean;
    persistentScrollbar?: boolean;
    pinchGestureEnabled?: boolean;
    pointerEvents?: "none" | "box-none" | "box-only" | "auto";
    refreshControl?: ReactElement<RefreshControlProps, string | JSXElementConstructor<unknown>>;
    removeClippedSubviews?: boolean;
    renderToHardwareTextureAndroid?: boolean;
    role?: Role;
    screenReaderFocusable?: boolean;
    scrollEnabled?: boolean;
    scrollEventThrottle?: number;
    scrollIndicatorInsets?: Insets;
    scrollPerfTag?: string;
    scrollToOverflowEnabled?: boolean;
    scrollViewRef?: Ref<unknown>;
    scrollsToTop?: boolean;
    shouldRasterizeIOS?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    showsVerticalScrollIndicator?: boolean;
    snapToAlignment?: "start" | "center" | "end";
    snapToEnd?: boolean;
    snapToInterval?: number;
    snapToOffsets?: number[];
    snapToStart?: boolean;
    stickyHeaderHiddenOnScroll?: boolean;
    stickyHeaderIndices?: number[];
    style?: StyleProp<ViewStyle> | CSSProperties;
    tabIndex?: 0 | -1;
    testID?: string;
    tvParallaxMagnification?: number;
    tvParallaxShiftDistanceX?: number;
    tvParallaxShiftDistanceY?: number;
    tvParallaxTiltAngle?: number;
    zoomScale?: number;
}
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type ScrollViewPropsLoose = LooseScrollViewProps;
type LegendListPropsLoose<ItemT = any> = Omit<LegendListPropsBase<ItemT, LooseScrollViewProps>, "ListHeaderComponentStyle" | "ListFooterComponentStyle"> & {
    ListHeaderComponentStyle?: StyleProp<ViewStyle> | CSSProperties | undefined;
    ListFooterComponentStyle?: StyleProp<ViewStyle> | CSSProperties | undefined;
};
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LegendListProps<ItemT = any> = LegendListPropsLoose<ItemT>;
/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
type LegendListComponent = <ItemT = any>(props: LegendListProps<ItemT> & RefAttributes<LegendListRef>) => ReactElement | null;

declare function useViewability<ItemT = any>(callback: ViewabilityCallback$1<ItemT>, configId?: string): void;
declare function useViewabilityAmount<ItemT = any>(callback: ViewabilityAmountCallback$1<ItemT>): void;
declare function useRecyclingEffect(effect: (info: LegendListRecyclingState$1<unknown>) => void | (() => void)): void;
declare function useRecyclingState<ItemT>(valueOrFun: ((info: LegendListRecyclingState$1<ItemT>) => ItemT) | ItemT): readonly [ItemT, Dispatch<SetStateAction<ItemT>>];
declare function useIsLastItem(): boolean;
declare function useListScrollSize(): {
    width: number;
    height: number;
};
declare function useSyncLayout(): () => void;

/** @deprecated Use `@legendapp/list/react-native` or `@legendapp/list/react` for strict typing */
declare const LegendList: LegendListComponent;

export { type AccessibilityActionEvent, type AccessibilityRole, type AccessibilityState, type AccessibilityValue, type AlwaysRenderConfig, type BaseScrollViewProps, type ColorValue, type ColumnWrapperStyle, type GestureResponderEvent, type GetRenderedItem, type GetRenderedItemResult, type InitialScrollAnchor, type InitializationCompletionInfo, InitializationCompletionType, InitializationMode, InitializationPhase, type Insets, type InternalState, type LayoutChangeEvent, type LayoutRectangle, LegendList, type LegendListComponent, type LegendListMetrics, type LegendListProps, type LegendListPropsBase, type LegendListRecyclingState, type LegendListRef, type LegendListRenderItemProps, type LegendListScrollerRef, type LegendListState, type LooseAccessibilityActionEvent, type LooseAccessibilityRole, type LooseAccessibilityState, type LooseAccessibilityValue, type LooseColorValue, type LooseGestureResponderEvent, type LoosePointerEvent, type LooseRefreshControlProps, type LooseRole, type LooseScrollViewProps, type MaintainScrollAtEndOptions, type MaintainVisibleContentPositionConfig, type MaintainVisibleContentPositionNormalized, type NativeScrollEvent, type NativeSyntheticEvent, type OnViewableItemsChanged, type PointProp, type PointerEvent, type RefreshControlProps, type Role, type ScrollEventTargetLike, type ScrollIndexWithOffset, type ScrollIndexWithOffsetAndContentOffset, type ScrollIndexWithOffsetPosition, type ScrollTarget, type ScrollViewPropsLoose, type ScrollableNodeLike, type StickyHeaderConfig, type StyleProp, type ThresholdSnapshot, type TypedForwardRef, type TypedMemo, type ViewAmountToken, type ViewStyle, type ViewToken, type ViewabilityAmountCallback, type ViewabilityCallback, type ViewabilityConfig, type ViewabilityConfigCallbackPair, type ViewabilityConfigCallbackPairs, type ViewableRange, typedForwardRef, typedMemo, useIsLastItem, useListScrollSize, useRecyclingEffect, useRecyclingState, useSyncLayout, useViewability, useViewabilityAmount };

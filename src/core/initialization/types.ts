/**
 * Initialization system type definitions
 *
 * The initialization system handles the complex process of filling the viewport
 * when navigating to a specific timeline position (e.g., jumping to a message in chat history).
 */

/**
 * Phases of the initialization process
 * - IDLE: Not initializing, normal list operation
 * - SCROLLING: Positioning to the anchor item
 * - FILLING: Paginating until viewport buffers are sufficient
 * - STABILIZING: Waiting for scroll position to stabilize (3 frame debounce)
 */
export enum InitializationPhase {
    IDLE = "IDLE",
    SCROLLING = "SCROLLING",
    FILLING = "FILLING",
    STABILIZING = "STABILIZING",
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
export enum InitializationMode {
    CHAT = "chat",
    MID_TIMELINE = "mid-timeline",
    CHAT_WITH_TARGET = "chat-with-target",
    IDLE = "idle",
}

/**
 * Configuration for entering initialization mode
 */
export interface InitializationConfig {
    /** Unique ID for the timeline being initialized */
    timelineId: string;

    /** Optional anchor item ID to lock to during initialization */
    anchorId?: string;

    /** Initialization mode (inferred from props if not specified) */
    mode?: InitializationMode;

    /** Target viewport position for anchor (0.5 = center, 1.0 = bottom) */
    targetViewPosition?: number;
}

/**
 * Complete state for the initialization system
 */
export interface InitializationState {
    /** Current phase of initialization */
    phase: InitializationPhase;

    /** Operating mode - determines positioning and buffer checking behavior */
    mode: InitializationMode;

    /** Timeline ID that triggered initialization */
    timelineId: string | undefined;

    /** Anchor item ID to lock MVCP to during initialization */
    anchorId: string | undefined;

    /** Index of anchor item in data array */
    anchorIndex: number | undefined;

    /** Target scroll position (if scrolling to specific offset) */
    targetScroll: number | undefined;

    /** Target viewport position for the anchor (0.5 = center, 1.0 = bottom) */
    targetViewPosition: number | undefined;

    /** Whether initial scroll to anchor has completed */
    didCompleteInitialScroll: boolean;

    /** Whether initial re-centering has been performed (to prevent multiple recenters) */
    didInitialRecenter: boolean;

    /** Number of consecutive stable frames observed */
    stabilizationFrames: number;

    /** Whether a start pagination request is pending */
    pendingStartRequest: boolean;

    /** Whether an end pagination request is pending */
    pendingEndRequest: boolean;

    /** Whether the start buffer meets the required threshold */
    isStartBufferSufficient: boolean;

    /** Whether the end buffer meets the required threshold */
    isEndBufferSufficient: boolean;

    /** Timestamp when start pagination was last requested */
    startRequestTimestamp: number | undefined;

    /** Timestamp when end pagination was last requested */
    endRequestTimestamp: number | undefined;

    /** Number of items in the data array when start pagination was requested */
    startRequestDataCount: number | undefined;

    /** Number of items in the data array when end pagination was requested */
    endRequestDataCount: number | undefined;
}

/**
 * Result from checking if forced pagination is needed
 */
export interface ForcePaginationResult {
    /** Whether the start buffer is sufficient */
    isStartBufferSufficient: boolean;

    /** Whether the end buffer is sufficient */
    isEndBufferSufficient: boolean;

    /** Whether to force onStartReached callback */
    shouldForceStartReached?: boolean;

    /** Whether to force onEndReached callback */
    shouldForceEndReached?: boolean;
}

/**
 * Configuration for buffer size calculation
 */
export interface BufferConfig {
    /** Base scroll buffer size */
    scrollBuffer: number;

    /** Current scroll velocity (positive = scrolling down, negative = scrolling up) */
    scrollVelocity: number;

    /** Whether initialization mode is active */
    isInitializing: boolean;
}

/**
 * Result from buffer size calculation
 */
export interface BufferSizes {
    /** Buffer size above the viewport */
    scrollBufferTop: number;

    /** Buffer size below the viewport */
    scrollBufferBottom: number;
}

/**
 * Direction from which pagination data arrived
 */
export enum PaginationDirection {
    START = "start",
    END = "end",
    BOTH = "both",
    REPLACEMENT = "replacement",
    NONE = "none",
}

/**
 * Information about data arrival during pagination
 */
export interface DataArrivalInfo {
    /** Direction from which data arrived */
    direction: PaginationDirection;

    /** Number of items added at the start of the list */
    itemsAddedAtStart: number;

    /** Number of items added at the end of the list */
    itemsAddedAtEnd: number;

    /** Number of items removed from the list */
    itemsRemoved: number;

    /** Whether the start direction returned empty (no more data available) */
    isStartEmpty: boolean;

    /** Whether the end direction returned empty (no more data available) */
    isEndEmpty: boolean;

    /** Total number of items in old data */
    oldCount: number;

    /** Total number of items in new data */
    newCount: number;
}

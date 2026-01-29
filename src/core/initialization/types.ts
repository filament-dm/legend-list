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
export enum InitializationPhase {
    IDLE = "IDLE",
    SCROLLING = "SCROLLING",
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

    /**
     * Whether this is an imperative initialization (from jumpToLatest(), etc.)
     * rather than prop-driven (from timeline change). Imperative initializations
     * don't interfere with timeline tracking.
     */
    isImperative: boolean;
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

/**
 * Type of initialization completion event
 */
export enum InitializationCompletionType {
    /** Timeline switch early exit (focused → live without anchor) */
    TIMELINE_SWITCH_EARLY_EXIT = "timeline-switch-early-exit",

    /** Successfully stabilized in mid-timeline mode */
    STABILIZED_MID_TIMELINE = "stabilized-mid-timeline",

    /** Successfully stabilized in chat mode */
    STABILIZED_CHAT = "stabilized-chat",

    /** Successfully stabilized in chat-with-target mode */
    STABILIZED_CHAT_WITH_TARGET = "stabilized-chat-with-target",

    /** Initialization failed or was aborted */
    FAILED = "failed",
}

/**
 * Information passed to onInitializationComplete callback
 */
export interface InitializationCompletionInfo {
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

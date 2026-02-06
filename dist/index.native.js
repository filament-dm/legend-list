'use strict';

var React2 = require('react');
var reactNative = require('react-native');
var shim = require('use-sync-external-store/shim');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
}

var React2__namespace = /*#__PURE__*/_interopNamespace(React2);

// src/components/LegendList.tsx
reactNative.Animated.View;
var View = reactNative.View;
var Text = reactNative.Text;

// src/state/getContentInsetEnd.ts
function getContentInsetEnd(state) {
  var _a3;
  const { props } = state;
  const horizontal = props.horizontal;
  const contentInset = props.contentInset;
  const baseInset = contentInset != null ? contentInset : state.nativeContentInset;
  const overrideInset = (_a3 = state.contentInsetOverride) != null ? _a3 : void 0;
  if (overrideInset) {
    const mergedInset = { bottom: 0, left: 0, right: 0, top: 0, ...baseInset, ...overrideInset };
    return (horizontal ? mergedInset.right : mergedInset.bottom) || 0;
  }
  if (baseInset) {
    return (horizontal ? baseInset.right : baseInset.bottom) || 0;
  }
  return 0;
}

// src/state/getContentSize.ts
function getContentSize(ctx) {
  var _a3, _b;
  const { values, state } = ctx;
  const stylePaddingTop = values.get("stylePaddingTop") || 0;
  const stylePaddingBottom = state.props.stylePaddingBottom || 0;
  const headerSize = values.get("headerSize") || 0;
  const footerSize = values.get("footerSize") || 0;
  const contentInsetBottom = getContentInsetEnd(state);
  const totalSize = (_b = (_a3 = state.pendingTotalSize) != null ? _a3 : values.get("totalSize")) != null ? _b : 0;
  return headerSize + footerSize + totalSize + stylePaddingTop + stylePaddingBottom + (contentInsetBottom || 0);
}

// src/core/initialization/types.ts
var InitializationPhase = /* @__PURE__ */ ((InitializationPhase2) => {
  InitializationPhase2["IDLE"] = "IDLE";
  InitializationPhase2["SCROLLING"] = "SCROLLING";
  InitializationPhase2["STABILIZING"] = "STABILIZING";
  return InitializationPhase2;
})(InitializationPhase || {});
var InitializationMode = /* @__PURE__ */ ((InitializationMode2) => {
  InitializationMode2["CHAT"] = "chat";
  InitializationMode2["MID_TIMELINE"] = "mid-timeline";
  InitializationMode2["CHAT_WITH_TARGET"] = "chat-with-target";
  InitializationMode2["IDLE"] = "idle";
  return InitializationMode2;
})(InitializationMode || {});
var InitializationCompletionType = /* @__PURE__ */ ((InitializationCompletionType2) => {
  InitializationCompletionType2["EARLY_EXIT"] = "early-exit";
  InitializationCompletionType2["STABILIZED_MID_TIMELINE"] = "stabilized-mid-timeline";
  InitializationCompletionType2["STABILIZED_CHAT"] = "stabilized-chat";
  InitializationCompletionType2["STABILIZED_CHAT_WITH_TARGET"] = "stabilized-chat-with-target";
  InitializationCompletionType2["FAILED"] = "failed";
  return InitializationCompletionType2;
})(InitializationCompletionType || {});

// src/core/initialization/InitializationManager.ts
var InitializationManager = class {
  constructor(ctx) {
    this.ctx = ctx;
    this.state = {
      anchorId: void 0,
      anchorIndex: void 0,
      didCompleteInitialScroll: false,
      didInitialRecenter: false,
      isImperative: false,
      mode: "idle" /* IDLE */,
      phase: "IDLE" /* IDLE */,
      stabilizationFrames: 0,
      targetScroll: void 0,
      targetViewPosition: void 0,
      timelineId: void 0
    };
  }
  // ===== Debug Helper =====
  /**
   * Check if debug logging is enabled for initialization
   */
  shouldLog() {
    return this.ctx.state.props.debugInitialization;
  }
  // ===== Phase Management =====
  /**
   * Set MVCP mode declaratively based on initialization phase
   */
  setMvcpMode(mode) {
    set$(this.ctx, "mvcpMode", mode);
  }
  /**
   * Enter initialization mode for a new timeline
   */
  enterInitialization(config) {
    var _a3, _b, _c;
    if (this.shouldLog()) {
      console.log("[InitializationManager] enterInitialization called", {
        config,
        currentPhase: this.state.phase,
        currentMode: this.state.mode,
        isAlreadyInitializing: this.isInitializing()
      });
    }
    if (this.isInitializing()) {
      if (this.shouldLog()) {
        console.log("[InitializationManager] Already initializing, ignoring re-entry");
      }
      return;
    }
    let mode;
    if (config.mode && config.mode !== "idle" /* IDLE */) {
      mode = config.mode;
    } else {
      const isLiveTimeline = this.ctx.state.props.maintainScrollAtEnd || ((_a3 = config.timelineId) == null ? void 0 : _a3.includes("live-timeline"));
      if (!isLiveTimeline && config.anchorId) {
        mode = "mid-timeline" /* MID_TIMELINE */;
      } else if (isLiveTimeline && !config.anchorId) {
        mode = "chat" /* CHAT */;
      } else if (isLiveTimeline && config.anchorId) {
        mode = "chat-with-target" /* CHAT_WITH_TARGET */;
      } else {
        mode = "mid-timeline" /* MID_TIMELINE */;
      }
    }
    const targetViewPosition = (_b = config.targetViewPosition) != null ? _b : mode === "chat" /* CHAT */ || mode === "chat-with-target" /* CHAT_WITH_TARGET */ ? 1 : 0.5;
    this.state.phase = "SCROLLING" /* SCROLLING */;
    this.state.mode = mode;
    this.state.timelineId = config.timelineId;
    this.state.anchorId = config.anchorId;
    this.state.targetViewPosition = targetViewPosition;
    this.state.isImperative = (_c = config.isImperative) != null ? _c : false;
    this.state.didCompleteInitialScroll = false;
    this.state.didInitialRecenter = false;
    this.state.stabilizationFrames = 0;
    if (this.shouldLog()) {
      console.log("[InitializationManager] Initialization state set", {
        phase: this.state.phase,
        mode: this.state.mode,
        timelineId: this.state.timelineId,
        anchorId: this.state.anchorId,
        targetViewPosition: this.state.targetViewPosition,
        isImperative: this.state.isImperative
      });
    }
    this.ctx.state.isInitializing = true;
    if (!config.isImperative) {
      this.ctx.state.lastTimelineId = config.timelineId;
    }
    this.ctx.state.stabilizationStableFrames = 0;
    this.setMvcpMode("none" /* NONE */);
    if (this.shouldLog()) {
      console.log("[InitializationManager] MVCP mode set to NONE for SCROLLING phase");
    }
  }
  /**
   * Prepare initial scroll configuration when data arrives
   * This replaces the logic previously in LegendList.tsx lines 407-430
   *
   * @param data - Current data array
   * @param keyExtractor - Function to extract keys from items
   * @returns true if initial scroll was prepared, false if anchor not found or data empty
   */
  prepareInitialScroll(data, keyExtractor) {
    var _a3, _b, _c, _d, _e;
    if (this.shouldLog()) {
      console.log("[InitializationManager] prepareInitialScroll called", {
        isInitializing: this.isInitializing(),
        dataLength: (_a3 = data == null ? void 0 : data.length) != null ? _a3 : 0,
        anchorId: this.state.anchorId,
        phase: this.state.phase
      });
    }
    if (!this.isInitializing()) {
      if (this.shouldLog()) {
        console.log("[InitializationManager] Not initializing, skipping prepareInitialScroll");
      }
      return false;
    }
    if (!data || data.length === 0) {
      if (this.shouldLog()) {
        console.log("[InitializationManager] No data available, skipping prepareInitialScroll");
      }
      return false;
    }
    if (!this.state.anchorId) {
      const lastIndex = Math.max(0, data.length - 1);
      this.ctx.state.initialScroll = {
        index: lastIndex,
        viewPosition: (_b = this.state.targetViewPosition) != null ? _b : 1
      };
      if (this.shouldLog()) {
        console.log("[InitializationManager] Chat mode - scrolling to bottom", {
          lastIndex,
          viewPosition: (_c = this.state.targetViewPosition) != null ? _c : 1
        });
      }
      return true;
    }
    const anchorIndex = data.findIndex((item, index) => keyExtractor(item, index) === this.state.anchorId);
    if (anchorIndex >= 0) {
      this.ctx.state.initialScroll = {
        index: anchorIndex,
        viewPosition: (_d = this.state.targetViewPosition) != null ? _d : 0.5
      };
      if (this.shouldLog()) {
        console.log("[InitializationManager] Anchor found - setting initial scroll", {
          anchorIndex,
          viewPosition: (_e = this.state.targetViewPosition) != null ? _e : 0.5
        });
      }
      return true;
    }
    if (this.shouldLog()) {
      console.log("[InitializationManager] Anchor not found, applying fallback", {
        mode: this.state.mode,
        anchorId: this.state.anchorId
      });
    }
    if (this.state.mode === "chat-with-target") {
      this.state.mode = "chat" /* CHAT */;
      this.state.targetViewPosition = 1;
      this.state.anchorId = void 0;
      const lastIndex = Math.max(0, data.length - 1);
      this.ctx.state.initialScroll = {
        index: lastIndex,
        viewPosition: 1
      };
      if (this.shouldLog()) {
        console.log("[InitializationManager] Fallback to CHAT mode - scrolling to bottom", { lastIndex });
      }
      return true;
    }
    if (this.state.mode === "mid-timeline" /* MID_TIMELINE */) {
      const middleIndex = Math.floor(data.length / 2);
      this.state.anchorId = keyExtractor(data[middleIndex], middleIndex);
      this.ctx.state.initialScroll = {
        index: middleIndex,
        viewPosition: 0.5
      };
      if (this.shouldLog()) {
        console.log("[InitializationManager] Fallback to middle item", { middleIndex, anchorId: this.state.anchorId });
      }
      return true;
    }
    if (this.shouldLog()) {
      console.log("[InitializationManager] WARNING: No fallback matched, returning false");
    }
    this.ctx.state.initialScroll = {
      index: 0,
      viewPosition: 0
    };
    return false;
  }
  /**
   * Enter SCROLLING phase - called after initial scroll is prepared
   * During this phase, the target item is being positioned and pagination/MVCP are blocked
   */
  enterScrollingPhase() {
    if (!this.isInitializing()) {
      return;
    }
    this.state.phase = "SCROLLING" /* SCROLLING */;
  }
  /**
   * Transition from SCROLLING to STABILIZING phase - called after initial scroll completes
   * Skips FILLING phase since app provides sufficient data upfront (no pagination needed)
   */
  transitionToStabilizingPhase() {
    var _a3, _b;
    if (this.shouldLog()) {
      console.log("[InitializationManager] transitionToStabilizingPhase called", {
        isInitializing: this.isInitializing(),
        currentPhase: this.state.phase,
        mode: this.state.mode
      });
    }
    if (!this.isInitializing()) {
      if (this.shouldLog()) {
        console.log("[InitializationManager] Not initializing, ignoring transition");
      }
      return;
    }
    if (this.state.phase === "STABILIZING" /* STABILIZING */) {
      if (this.shouldLog()) {
        console.log("[InitializationManager] Already in STABILIZING phase, ignoring transition");
      }
      return;
    }
    this.state.phase = "STABILIZING" /* STABILIZING */;
    if (this.shouldLog()) {
      console.log("[InitializationManager] Transitioned to STABILIZING phase");
    }
    this.setMvcpMode("initialization" /* INITIALIZATION */);
    if (this.shouldLog()) {
      console.log("[InitializationManager] MVCP mode set to INITIALIZATION");
    }
    (_b = (_a3 = this.ctx.state).triggerCalculateItemsInView) == null ? void 0 : _b.call(_a3, { doMVCP: true, forceFullItemPositions: true });
    if (this.shouldLog()) {
      console.log("[InitializationManager] Triggered calculateItemsInView with MVCP");
    }
    this.startStabilizationLoop();
    if (this.shouldLog()) {
      console.log("[InitializationManager] Started stabilization loop");
    }
  }
  /**
   * Exit initialization mode
   * @param completionInfo - Information about how/why initialization completed
   */
  exitInitialization(completionInfo) {
    var _a3, _b;
    if (this.shouldLog()) {
      console.log("[InitializationManager] exitInitialization called", {
        currentPhase: this.state.phase,
        currentMode: this.state.mode,
        completionType: completionInfo == null ? void 0 : completionInfo.type,
        stabilizationFrames: this.state.stabilizationFrames
      });
    }
    const timelineId = this.state.timelineId;
    const isImperative = this.state.isImperative;
    this.stopStabilizationLoop();
    if (this.shouldLog()) {
      console.log("[InitializationManager] Stopped stabilization loop");
    }
    this.state.phase = "IDLE" /* IDLE */;
    this.state.mode = "idle" /* IDLE */;
    this.state.timelineId = void 0;
    this.state.anchorId = void 0;
    this.state.anchorIndex = void 0;
    this.state.targetScroll = void 0;
    this.state.targetViewPosition = void 0;
    this.state.isImperative = false;
    this.state.didCompleteInitialScroll = false;
    this.state.didInitialRecenter = false;
    this.state.stabilizationFrames = 0;
    this.ctx.state.isInitializing = false;
    this.ctx.state.stabilizationStableFrames = 0;
    this.ctx.state.initialAnchor = void 0;
    this.setMvcpMode("regular" /* REGULAR */);
    if (this.shouldLog()) {
      console.log("[InitializationManager] MVCP mode restored to REGULAR");
    }
    const info = completionInfo || {
      type: "failed" /* FAILED */,
      mode: this.state.mode,
      reason: "exitInitialization called without completion info",
      timelineId,
      isImperative
    };
    if (this.shouldLog()) {
      console.log("[InitializationManager] Calling onInitializationComplete", { info });
    }
    (_b = (_a3 = this.ctx.state.props).onInitializationComplete) == null ? void 0 : _b.call(_a3, info);
    if (this.shouldLog()) {
      console.log("[InitializationManager] Initialization complete");
    }
  }
  /**
   * Start the stabilization checking loop
   * Continuously checks for stable frames using requestAnimationFrame
   */
  startStabilizationLoop() {
    this.stopStabilizationLoop();
    const checkFrame = () => {
      var _a3, _b;
      if (this.state.phase !== "STABILIZING" /* STABILIZING */) {
        this.stopStabilizationLoop();
        return;
      }
      (_b = (_a3 = this.ctx.state).triggerCalculateItemsInView) == null ? void 0 : _b.call(_a3, { doMVCP: true });
      this.stabilizationCheckId = requestAnimationFrame(checkFrame);
    };
    this.stabilizationCheckId = requestAnimationFrame(checkFrame);
  }
  /**
   * Stop the stabilization checking loop
   */
  stopStabilizationLoop() {
    if (this.stabilizationCheckId !== void 0) {
      cancelAnimationFrame(this.stabilizationCheckId);
      this.stabilizationCheckId = void 0;
    }
  }
  // ===== State Queries =====
  /**
   * Check if initialization is active
   */
  isInitializing() {
    return this.state.phase !== "IDLE" /* IDLE */;
  }
  /**
   * Get the current initialization mode
   */
  getMode() {
    return this.state.mode;
  }
  /**
   * Check if current initialization is imperative (e.g., from jumpToLatest())
   * Returns false if not initializing
   */
  isImperativeInit() {
    return this.isInitializing() && this.state.isImperative;
  }
  /**
   * Get current initialization phase
   */
  getCurrentPhase() {
    return this.state.phase;
  }
  /**
   * Check if initial scroll has completed
   */
  didCompleteInitialScroll() {
    return this.state.didCompleteInitialScroll;
  }
  /**
   * Check if MVCP should be locked to anchor
   */
  shouldLockMVCP() {
    if (!this.isInitializing() || !this.state.anchorId) {
      return false;
    }
    if (this.state.phase === "SCROLLING" /* SCROLLING */ || !this.state.didCompleteInitialScroll) {
      return false;
    }
    const anchorIndex = this.ctx.state.indexByKey.get(this.state.anchorId);
    const hasPosition = this.ctx.state.positions.has(this.state.anchorId);
    if (anchorIndex === void 0) {
      this.exitInitialization({
        type: "failed" /* FAILED */,
        mode: this.state.mode,
        reason: "Anchor lost during initialization",
        timelineId: this.state.timelineId,
        isImperative: this.state.isImperative
      });
      return false;
    }
    return anchorIndex !== void 0 && hasPosition;
  }
  /**
   * Get MVCP anchor override (if should lock)
   * Returns undefined if MVCP should use normal behavior
   */
  getMVCPAnchorOverride() {
    if (!this.shouldLockMVCP()) return void 0;
    return this.state.anchorId;
  }
  // ===== Position Management =====
  /**
   * Get the initialization mode (chat, mid-timeline, chat-with-target, or idle)
   */
  getInitializationMode() {
    return this.state.mode;
  }
  /**
   * Get the target viewport position for the anchor
   * Returns undefined if not initializing or no target position set
   */
  getTargetViewPosition() {
    return this.state.targetViewPosition;
  }
  /**
   * Check if re-centering should be performed
   * Returns true only once after initial scroll completes and before first recenter
   */
  shouldRecenterAnchor() {
    if (!this.isInitializing()) return false;
    if (!this.state.anchorId) return false;
    if (!this.state.didCompleteInitialScroll) return false;
    if (this.state.didInitialRecenter) return false;
    const anchorIndex = this.ctx.state.indexByKey.get(this.state.anchorId);
    const hasPosition = this.ctx.state.positions.has(this.state.anchorId);
    return anchorIndex !== void 0 && hasPosition;
  }
  /**
   * Mark that initial scroll to anchor has completed
   */
  markInitialScrollComplete() {
    if (!this.isInitializing()) return;
    this.state.didCompleteInitialScroll = true;
  }
  /**
   * Mark that initial re-centering has been performed
   */
  markRecenterComplete() {
    if (!this.isInitializing()) return;
    this.state.didInitialRecenter = true;
  }
  // ===== Stabilization =====
  /**
   * Increment stabilization frame counter
   */
  incrementStabilizationFrames() {
    this.state.stabilizationFrames++;
    this.ctx.state.stabilizationStableFrames = this.state.stabilizationFrames;
  }
  /**
   * Reset stabilization frame counter
   */
  resetStabilizationFrames() {
    this.state.stabilizationFrames = 0;
    this.ctx.state.stabilizationStableFrames = 0;
  }
  /**
   * Get current stabilization frame count
   */
  getStabilizationFrames() {
    return this.state.stabilizationFrames;
  }
  /**
   * Handle MVCP adjustment during initialization
   * Resets stabilization frame counter when scroll position is adjusted significantly.
   *
   * Note: Called from requestAdjust() only for adjustments > 1px to avoid infinite
   * loops caused by sub-pixel position changes during data updates.
   */
  onMVCPAdjusted() {
    if (!this.isInitializing()) return;
    if (this.shouldLog()) {
      console.log("[InitializationManager] MVCP adjusted - resetting stabilization counter", {
        previousFrames: this.state.stabilizationFrames,
        phase: this.state.phase
      });
    }
    this.state.stabilizationFrames = 0;
    this.ctx.state.stabilizationStableFrames = 0;
  }
  // ===== Stabilization Check =====
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
  checkStabilization() {
    if (this.shouldLog()) {
      console.log("[InitializationManager] checkStabilization called", {
        isInitializing: this.isInitializing(),
        phase: this.state.phase,
        stabilizationFrames: this.state.stabilizationFrames
      });
    }
    if (!this.isInitializing()) {
      if (this.shouldLog()) {
        console.log("[InitializationManager] Not initializing, skipping stabilization check");
      }
      return false;
    }
    if (this.state.phase !== "STABILIZING" /* STABILIZING */) {
      if (this.shouldLog()) {
        console.log("[InitializationManager] Not in STABILIZING phase, skipping check");
      }
      return false;
    }
    this.state.stabilizationFrames++;
    this.ctx.state.stabilizationStableFrames = this.state.stabilizationFrames;
    if (this.shouldLog()) {
      console.log("[InitializationManager] Incremented stable frames", {
        stabilizationFrames: this.state.stabilizationFrames,
        needsMore: this.state.stabilizationFrames < 3
      });
    }
    if (this.state.stabilizationFrames >= 3) {
      if (this.shouldLog()) {
        console.log("[InitializationManager] 3 stable frames reached, completing initialization");
      }
      let completionType;
      switch (this.state.mode) {
        case "mid-timeline" /* MID_TIMELINE */:
          completionType = "stabilized-mid-timeline" /* STABILIZED_MID_TIMELINE */;
          break;
        case "chat" /* CHAT */:
          completionType = "stabilized-chat" /* STABILIZED_CHAT */;
          break;
        case "chat-with-target" /* CHAT_WITH_TARGET */:
          completionType = "stabilized-chat-with-target" /* STABILIZED_CHAT_WITH_TARGET */;
          break;
        default:
          completionType = "failed" /* FAILED */;
          break;
      }
      this.exitInitialization({
        type: completionType,
        mode: this.state.mode,
        timelineId: this.state.timelineId,
        isImperative: this.state.isImperative
      });
      return true;
    }
    return false;
  }
};
var createAnimatedValue = (value) => new reactNative.Animated.Value(value);

// src/state/state.tsx
var ContextState = React2__namespace.createContext(null);
var contextNum = 0;
function StateProvider({ children }) {
  const [value] = React2__namespace.useState(() => {
    const ctx = {
      animatedScrollY: createAnimatedValue(0),
      columnWrapperStyle: void 0,
      contextNum: contextNum++,
      listeners: /* @__PURE__ */ new Map(),
      mapViewabilityAmountCallbacks: /* @__PURE__ */ new Map(),
      mapViewabilityAmountValues: /* @__PURE__ */ new Map(),
      mapViewabilityCallbacks: /* @__PURE__ */ new Map(),
      mapViewabilityConfigStates: /* @__PURE__ */ new Map(),
      mapViewabilityValues: /* @__PURE__ */ new Map(),
      positionListeners: /* @__PURE__ */ new Map(),
      state: void 0,
      values: /* @__PURE__ */ new Map([
        ["stylePaddingTop", 0],
        ["headerSize", 0],
        ["numContainers", 0],
        ["activeStickyIndex", -1],
        ["totalSize", 0],
        ["scrollAdjustPending", 0],
        ["mvcpMode", "regular" /* REGULAR */]
      ]),
      viewRefs: /* @__PURE__ */ new Map()
    };
    ctx.initializationManager = new InitializationManager(ctx);
    return ctx;
  });
  return /* @__PURE__ */ React2__namespace.createElement(ContextState.Provider, { value }, children);
}
function useStateContext() {
  return React2__namespace.useContext(ContextState);
}
function createSelectorFunctionsArr(ctx, signalNames) {
  let lastValues = [];
  let lastSignalValues = [];
  return {
    get: () => {
      const currentValues = [];
      let hasChanged = false;
      for (let i = 0; i < signalNames.length; i++) {
        const value = peek$(ctx, signalNames[i]);
        currentValues.push(value);
        if (value !== lastSignalValues[i]) {
          hasChanged = true;
        }
      }
      lastSignalValues = currentValues;
      if (hasChanged) {
        lastValues = currentValues;
      }
      return lastValues;
    },
    subscribe: (cb) => {
      const listeners = [];
      for (const signalName of signalNames) {
        listeners.push(listen$(ctx, signalName, cb));
      }
      return () => {
        for (const listener of listeners) {
          listener();
        }
      };
    }
  };
}
function listen$(ctx, signalName, cb) {
  const { listeners } = ctx;
  let setListeners = listeners.get(signalName);
  if (!setListeners) {
    setListeners = /* @__PURE__ */ new Set();
    listeners.set(signalName, setListeners);
  }
  setListeners.add(cb);
  return () => setListeners.delete(cb);
}
function peek$(ctx, signalName) {
  const { values } = ctx;
  return values.get(signalName);
}
function set$(ctx, signalName, value) {
  const { listeners, values } = ctx;
  if (values.get(signalName) !== value) {
    values.set(signalName, value);
    const setListeners = listeners.get(signalName);
    if (setListeners) {
      for (const listener of setListeners) {
        listener(value);
      }
    }
  }
}
function listenPosition$(ctx, key, cb) {
  const { positionListeners } = ctx;
  let setListeners = positionListeners.get(key);
  if (!setListeners) {
    setListeners = /* @__PURE__ */ new Set();
    positionListeners.set(key, setListeners);
  }
  setListeners.add(cb);
  return () => setListeners.delete(cb);
}
function notifyPosition$(ctx, key, value) {
  const { positionListeners } = ctx;
  const setListeners = positionListeners.get(key);
  if (setListeners) {
    for (const listener of setListeners) {
      listener(value);
    }
  }
}
function useArr$(signalNames) {
  const ctx = React2__namespace.useContext(ContextState);
  const { subscribe, get } = React2__namespace.useMemo(() => createSelectorFunctionsArr(ctx, signalNames), [ctx, signalNames]);
  const value = shim.useSyncExternalStore(subscribe, get);
  return value;
}
function useSelector$(signalName, selector) {
  const ctx = React2__namespace.useContext(ContextState);
  const { subscribe, get } = React2__namespace.useMemo(() => createSelectorFunctionsArr(ctx, [signalName]), [ctx, signalName]);
  const value = shim.useSyncExternalStore(subscribe, () => selector(get()[0]));
  return value;
}

// src/components/DebugView.tsx
var DebugRow = ({ children }) => {
  return /* @__PURE__ */ React2__namespace.createElement(View, { style: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" } }, children);
};
var DebugView = React2__namespace.memo(function DebugView2({ state }) {
  const ctx = useStateContext();
  const [totalSize = 0, scrollAdjust = 0, rawScroll = 0, scroll = 0, _numContainers = 0, _numContainersPooled = 0] = useArr$([
    "totalSize",
    "scrollAdjust",
    "debugRawScroll",
    "debugComputedScroll",
    "numContainers",
    "numContainersPooled"
  ]);
  const contentSize = getContentSize(ctx);
  const [, forceUpdate] = React2.useReducer((x) => x + 1, 0);
  useInterval(() => {
    forceUpdate();
  }, 100);
  return /* @__PURE__ */ React2__namespace.createElement(
    View,
    {
      pointerEvents: "none",
      style: {
        // height: 100,
        backgroundColor: "#FFFFFFCC",
        borderRadius: 4,
        padding: 4,
        paddingBottom: 4,
        paddingLeft: 4,
        position: "absolute",
        right: 0,
        top: 0
      }
    },
    /* @__PURE__ */ React2__namespace.createElement(DebugRow, null, /* @__PURE__ */ React2__namespace.createElement(Text, null, "TotalSize:"), /* @__PURE__ */ React2__namespace.createElement(Text, null, totalSize.toFixed(2))),
    /* @__PURE__ */ React2__namespace.createElement(DebugRow, null, /* @__PURE__ */ React2__namespace.createElement(Text, null, "ContentSize:"), /* @__PURE__ */ React2__namespace.createElement(Text, null, contentSize.toFixed(2))),
    /* @__PURE__ */ React2__namespace.createElement(DebugRow, null, /* @__PURE__ */ React2__namespace.createElement(Text, null, "At end:"), /* @__PURE__ */ React2__namespace.createElement(Text, null, String(state.isAtEnd))),
    /* @__PURE__ */ React2__namespace.createElement(DebugRow, null, /* @__PURE__ */ React2__namespace.createElement(Text, null, "ScrollAdjust:"), /* @__PURE__ */ React2__namespace.createElement(Text, null, scrollAdjust.toFixed(2))),
    /* @__PURE__ */ React2__namespace.createElement(DebugRow, null, /* @__PURE__ */ React2__namespace.createElement(Text, null, "RawScroll: "), /* @__PURE__ */ React2__namespace.createElement(Text, null, rawScroll.toFixed(2))),
    /* @__PURE__ */ React2__namespace.createElement(DebugRow, null, /* @__PURE__ */ React2__namespace.createElement(Text, null, "ComputedScroll: "), /* @__PURE__ */ React2__namespace.createElement(Text, null, scroll.toFixed(2)))
  );
});
function useInterval(callback, delay) {
  React2.useEffect(() => {
    const interval = setInterval(callback, delay);
    return () => clearInterval(interval);
  }, [delay]);
}

// src/utils/devEnvironment.ts
var metroDev = typeof __DEV__ !== "undefined" ? __DEV__ : void 0;
var _a;
var envMode = typeof process !== "undefined" && typeof process.env === "object" && process.env ? (_a = process.env.NODE_ENV) != null ? _a : process.env.MODE : void 0;
var processDev = typeof envMode === "string" ? envMode.toLowerCase() !== "production" : void 0;
var _a2;
var IS_DEV = (_a2 = metroDev != null ? metroDev : processDev) != null ? _a2 : false;

// src/constants.ts
var POSITION_OUT_OF_VIEW = -1e7;
var ENABLE_DEVMODE = IS_DEV && false;
var ENABLE_DEBUG_VIEW = IS_DEV && false;

// src/constants-platform.native.ts
var f = global.nativeFabricUIManager;
var IsNewArchitecture = f !== void 0 && f != null;
var useAnimatedValue = (initialValue) => {
  const [animAnimatedValue] = React2.useState(() => new reactNative.Animated.Value(initialValue));
  return animAnimatedValue;
};

// src/utils/helpers.ts
function isFunction(obj) {
  return typeof obj === "function";
}
function isArray(obj) {
  return Array.isArray(obj);
}
var warned = /* @__PURE__ */ new Set();
function warnDevOnce(id, text) {
  if (IS_DEV && !warned.has(id)) {
    warned.add(id);
    console.warn(`[legend-list] ${text}`);
  }
}
function roundSize(size) {
  return Math.floor(size * 8) / 8;
}
function isNullOrUndefined(value) {
  return value === null || value === void 0;
}
function comparatorDefault(a, b) {
  return a - b;
}
function getPadding(s, type) {
  var _a3, _b, _c;
  return (_c = (_b = (_a3 = s[`padding${type}`]) != null ? _a3 : s.paddingVertical) != null ? _b : s.padding) != null ? _c : 0;
}
function extractPadding(style, contentContainerStyle, type) {
  return getPadding(style, type) + getPadding(contentContainerStyle, type);
}
function findContainerId(ctx, key) {
  var _a3, _b;
  const directMatch = (_b = (_a3 = ctx.state) == null ? void 0 : _a3.containerItemKeys) == null ? void 0 : _b.get(key);
  if (directMatch !== void 0) {
    return directMatch;
  }
  const numContainers = peek$(ctx, "numContainers");
  for (let i = 0; i < numContainers; i++) {
    const itemKey = peek$(ctx, `containerItemKey${i}`);
    if (itemKey === key) {
      return i;
    }
  }
  return -1;
}

// src/hooks/useValue$.ts
function useValue$(key, params) {
  const { getValue, delay } = params || {};
  const ctx = useStateContext();
  const getNewValue = () => {
    var _a3;
    return (_a3 = getValue ? getValue(peek$(ctx, key)) : peek$(ctx, key)) != null ? _a3 : 0;
  };
  const animValue = useAnimatedValue(getNewValue());
  React2.useMemo(() => {
    let prevValue;
    let didQueueTask = false;
    listen$(ctx, key, (v) => {
      const newValue = getNewValue();
      if (delay !== void 0) {
        const fn = () => {
          didQueueTask = false;
          const latestValue = getNewValue();
          if (latestValue !== void 0) {
            animValue.setValue(latestValue);
          }
        };
        const delayValue = isFunction(delay) ? delay(newValue, prevValue) : delay;
        prevValue = newValue;
        if (!didQueueTask) {
          didQueueTask = true;
          if (delayValue === void 0) {
            fn();
          } else if (delayValue === 0) {
            queueMicrotask(fn);
          } else {
            setTimeout(fn, delayValue);
          }
        }
      } else {
        animValue.setValue(newValue);
      }
    });
  }, []);
  return animValue;
}
var typedForwardRef = React2.forwardRef;
var typedMemo = React2.memo;
var getComponent = (Component) => {
  if (React2__namespace.isValidElement(Component)) {
    return Component;
  }
  if (Component) {
    return /* @__PURE__ */ React2__namespace.createElement(Component, null);
  }
  return null;
};

// src/components/PositionView.native.tsx
var PositionViewState = typedMemo(function PositionViewState2({
  id,
  horizontal,
  style,
  refView,
  ...rest
}) {
  const [position = POSITION_OUT_OF_VIEW] = useArr$([`containerPosition${id}`]);
  return /* @__PURE__ */ React2__namespace.createElement(
    reactNative.View,
    {
      ref: refView,
      style: [
        style,
        horizontal ? { transform: [{ translateX: position }] } : { transform: [{ translateY: position }] }
      ],
      ...rest
    }
  );
});
var PositionViewAnimated = typedMemo(function PositionViewAnimated2({
  id,
  horizontal,
  style,
  refView,
  ...rest
}) {
  const position$ = useValue$(`containerPosition${id}`, {
    getValue: (v) => v != null ? v : POSITION_OUT_OF_VIEW
  });
  let position;
  if (reactNative.Platform.OS === "ios" || reactNative.Platform.OS === "android") {
    position = horizontal ? { transform: [{ translateX: position$ }] } : { transform: [{ translateY: position$ }] };
  } else {
    position = horizontal ? { left: position$ } : { top: position$ };
  }
  return /* @__PURE__ */ React2__namespace.createElement(reactNative.Animated.View, { ref: refView, style: [style, position], ...rest });
});
var PositionViewSticky = typedMemo(function PositionViewSticky2({
  id,
  horizontal,
  style,
  refView,
  animatedScrollY,
  index,
  stickyHeaderConfig,
  children,
  ...rest
}) {
  const [position = POSITION_OUT_OF_VIEW, headerSize = 0, stylePaddingTop = 0] = useArr$([
    `containerPosition${id}`,
    "headerSize",
    "stylePaddingTop"
  ]);
  const transform = React2__namespace.useMemo(() => {
    var _a3;
    if (animatedScrollY) {
      const stickyConfigOffset = (_a3 = stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.offset) != null ? _a3 : 0;
      const stickyStart = position + headerSize + stylePaddingTop - stickyConfigOffset;
      const stickyPosition = animatedScrollY.interpolate({
        extrapolateLeft: "clamp",
        extrapolateRight: "extend",
        inputRange: [
          stickyStart,
          stickyStart + 5e3
        ],
        outputRange: [position, position + 5e3]
      });
      return horizontal ? [{ translateX: stickyPosition }] : [{ translateY: stickyPosition }];
    }
  }, [animatedScrollY, headerSize, horizontal, position, stylePaddingTop, stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.offset]);
  const viewStyle = React2__namespace.useMemo(() => [style, { zIndex: index + 1e3 }, { transform }], [style, transform]);
  const renderStickyHeaderBackdrop = React2__namespace.useMemo(() => {
    if (!(stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.backdropComponent)) {
      return null;
    }
    return /* @__PURE__ */ React2__namespace.createElement(
      reactNative.View,
      {
        style: {
          inset: 0,
          pointerEvents: "none",
          position: "absolute"
        }
      },
      getComponent(stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.backdropComponent)
    );
  }, [stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.backdropComponent]);
  return /* @__PURE__ */ React2__namespace.createElement(reactNative.Animated.View, { ref: refView, style: viewStyle, ...rest }, renderStickyHeaderBackdrop, children);
});
var PositionView = IsNewArchitecture ? PositionViewState : PositionViewAnimated;
function useInit(cb) {
  React2.useState(() => cb());
}

// src/state/ContextContainer.ts
var ContextContainer = React2.createContext(null);
function useContextContainer() {
  return React2.useContext(ContextContainer);
}
function useViewability(callback, configId) {
  const ctx = useStateContext();
  const containerContext = useContextContainer();
  useInit(() => {
    if (!containerContext) {
      return;
    }
    const { containerId } = containerContext;
    const key = containerId + (configId != null ? configId : "");
    const value = ctx.mapViewabilityValues.get(key);
    if (value) {
      callback(value);
    }
  });
  React2.useEffect(() => {
    if (!containerContext) {
      return;
    }
    const { containerId } = containerContext;
    const key = containerId + (configId != null ? configId : "");
    ctx.mapViewabilityCallbacks.set(key, callback);
    return () => {
      ctx.mapViewabilityCallbacks.delete(key);
    };
  }, [ctx, callback, configId, containerContext]);
}
function useViewabilityAmount(callback) {
  const ctx = useStateContext();
  const containerContext = useContextContainer();
  useInit(() => {
    if (!containerContext) {
      return;
    }
    const { containerId } = containerContext;
    const value = ctx.mapViewabilityAmountValues.get(containerId);
    if (value) {
      callback(value);
    }
  });
  React2.useEffect(() => {
    if (!containerContext) {
      return;
    }
    const { containerId } = containerContext;
    ctx.mapViewabilityAmountCallbacks.set(containerId, callback);
    return () => {
      ctx.mapViewabilityAmountCallbacks.delete(containerId);
    };
  }, [ctx, callback, containerContext]);
}
function useRecyclingEffect(effect) {
  const containerContext = useContextContainer();
  const prevValues = React2.useRef({
    prevIndex: void 0,
    prevItem: void 0
  });
  React2.useEffect(() => {
    if (!containerContext) {
      return;
    }
    const { index, value } = containerContext;
    let ret;
    if (prevValues.current.prevIndex !== void 0 && prevValues.current.prevItem !== void 0) {
      ret = effect({
        index,
        item: value,
        prevIndex: prevValues.current.prevIndex,
        prevItem: prevValues.current.prevItem
      });
    }
    prevValues.current = {
      prevIndex: index,
      prevItem: value
    };
    return ret;
  }, [effect, containerContext]);
}
function useRecyclingState(valueOrFun) {
  var _a3, _b;
  const containerContext = useContextContainer();
  const computeValue = (ctx) => {
    if (isFunction(valueOrFun)) {
      const initializer = valueOrFun;
      return ctx ? initializer({
        index: ctx.index,
        item: ctx.value,
        prevIndex: void 0,
        prevItem: void 0
      }) : initializer();
    }
    return valueOrFun;
  };
  const [stateValue, setStateValue] = React2.useState(() => {
    return computeValue(containerContext);
  });
  const prevItemKeyRef = React2.useRef((_a3 = containerContext == null ? void 0 : containerContext.itemKey) != null ? _a3 : null);
  const currentItemKey = (_b = containerContext == null ? void 0 : containerContext.itemKey) != null ? _b : null;
  if (currentItemKey !== null && prevItemKeyRef.current !== currentItemKey) {
    prevItemKeyRef.current = currentItemKey;
    setStateValue(computeValue(containerContext));
  }
  const triggerLayout = containerContext == null ? void 0 : containerContext.triggerLayout;
  const setState = React2.useCallback(
    (newState) => {
      if (!triggerLayout) {
        return;
      }
      setStateValue((prevValue) => {
        return isFunction(newState) ? newState(prevValue) : newState;
      });
      triggerLayout();
    },
    [triggerLayout]
  );
  return [stateValue, setState];
}
function useIsLastItem() {
  const containerContext = useContextContainer();
  const isLast = useSelector$("lastItemKeys", (lastItemKeys) => {
    if (containerContext) {
      const { itemKey } = containerContext;
      if (!isNullOrUndefined(itemKey)) {
        return (lastItemKeys == null ? void 0 : lastItemKeys.includes(itemKey)) || false;
      }
    }
    return false;
  });
  return isLast;
}
function useListScrollSize() {
  const [scrollSize] = useArr$(["scrollSize"]);
  return scrollSize;
}
var noop = () => {
};
function useSyncLayout() {
  const containerContext = useContextContainer();
  if (IsNewArchitecture && containerContext) {
    const { triggerLayout: syncLayout } = containerContext;
    return syncLayout;
  } else {
    return noop;
  }
}

// src/components/Separator.tsx
function Separator({ ItemSeparatorComponent, leadingItem }) {
  const isLastItem = useIsLastItem();
  return isLastItem ? null : /* @__PURE__ */ React2__namespace.createElement(ItemSeparatorComponent, { leadingItem });
}
function useOnLayoutSync({
  ref,
  onLayoutProp,
  onLayoutChange
}, deps = []) {
  const lastLayoutRef = React2.useRef(null);
  const onLayout = React2.useCallback(
    (event) => {
      var _a3, _b;
      const { layout } = event.nativeEvent;
      if (layout.height !== ((_a3 = lastLayoutRef.current) == null ? void 0 : _a3.height) || layout.width !== ((_b = lastLayoutRef.current) == null ? void 0 : _b.width)) {
        onLayoutChange(layout, false);
        onLayoutProp == null ? void 0 : onLayoutProp(event);
        lastLayoutRef.current = layout;
      }
    },
    [onLayoutChange]
  );
  if (IsNewArchitecture) {
    React2.useLayoutEffect(() => {
      if (ref.current) {
        ref.current.measure((x, y, width, height) => {
          const layout = { height, width, x, y };
          lastLayoutRef.current = layout;
          onLayoutChange(layout, true);
        });
      }
    }, deps);
  }
  return { onLayout };
}
var Platform2 = reactNative.Platform;
var PlatformAdjustBreaksScroll = Platform2.OS === "android";

// src/components/Container.tsx
var Container = typedMemo(function Container2({
  id,
  recycleItems,
  horizontal,
  getRenderedItem: getRenderedItem2,
  updateItemSize: updateItemSize2,
  ItemSeparatorComponent,
  stickyHeaderConfig
}) {
  const ctx = useStateContext();
  const { columnWrapperStyle, animatedScrollY } = ctx;
  const [column = 0, span = 1, data, itemKey, numColumns = 1, extraData, isSticky] = useArr$([
    `containerColumn${id}`,
    `containerSpan${id}`,
    `containerItemData${id}`,
    `containerItemKey${id}`,
    "numColumns",
    "extraData",
    `containerSticky${id}`
  ]);
  const itemLayoutRef = React2.useRef({
    didLayout: false,
    horizontal,
    itemKey,
    pendingShrinkToken: 0,
    updateItemSize: updateItemSize2
  });
  itemLayoutRef.current.horizontal = horizontal;
  itemLayoutRef.current.itemKey = itemKey;
  itemLayoutRef.current.updateItemSize = updateItemSize2;
  const ref = React2.useRef(null);
  const [layoutRenderCount, forceLayoutRender] = React2.useState(0);
  const resolvedColumn = column > 0 ? column : 1;
  const resolvedSpan = Math.min(Math.max(span || 1, 1), numColumns);
  const otherAxisPos = numColumns > 1 ? `${(resolvedColumn - 1) / numColumns * 100}%` : 0;
  const otherAxisSize = numColumns > 1 ? `${resolvedSpan / numColumns * 100}%` : void 0;
  const style = React2.useMemo(() => {
    let paddingStyles;
    if (columnWrapperStyle) {
      const { columnGap, rowGap, gap } = columnWrapperStyle;
      if (horizontal) {
        paddingStyles = {
          paddingRight: columnGap || gap || void 0,
          paddingVertical: numColumns > 1 ? (rowGap || gap || 0) / 2 : void 0
        };
      } else {
        paddingStyles = {
          paddingBottom: rowGap || gap || void 0,
          paddingHorizontal: numColumns > 1 ? (columnGap || gap || 0) / 2 : void 0
        };
      }
    }
    return horizontal ? {
      flexDirection: ItemSeparatorComponent ? "row" : void 0,
      height: otherAxisSize,
      left: 0,
      position: "absolute",
      top: otherAxisPos,
      ...paddingStyles || {}
    } : {
      left: otherAxisPos,
      position: "absolute",
      right: numColumns > 1 ? null : 0,
      top: 0,
      width: otherAxisSize,
      ...paddingStyles || {}
    };
  }, [horizontal, otherAxisPos, otherAxisSize, columnWrapperStyle, numColumns]);
  const renderedItemInfo = React2.useMemo(
    () => itemKey !== void 0 ? getRenderedItem2(itemKey) : null,
    [itemKey, data, extraData]
  );
  const { index, renderedItem } = renderedItemInfo || {};
  const contextValue = React2.useMemo(() => {
    ctx.viewRefs.set(id, ref);
    return {
      containerId: id,
      index,
      itemKey,
      triggerLayout: () => {
        forceLayoutRender((v) => v + 1);
      },
      value: data
    };
  }, [id, itemKey, index, data]);
  const onLayoutChange = React2.useCallback((rectangle) => {
    var _a3, _b;
    const {
      horizontal: currentHorizontal,
      itemKey: currentItemKey,
      updateItemSize: updateItemSizeFn,
      lastSize,
      pendingShrinkToken
    } = itemLayoutRef.current;
    if (isNullOrUndefined(currentItemKey)) {
      return;
    }
    itemLayoutRef.current.didLayout = true;
    let layout = rectangle;
    const axis = currentHorizontal ? "width" : "height";
    const size = roundSize(rectangle[axis]);
    const prevSize = lastSize ? roundSize(lastSize[axis]) : void 0;
    const doUpdate = () => {
      itemLayoutRef.current.lastSize = layout;
      updateItemSizeFn(currentItemKey, layout);
      itemLayoutRef.current.didLayout = true;
    };
    if (Platform2.OS === "web" && prevSize !== void 0 && size + 1 < prevSize) {
      const token = pendingShrinkToken + 1;
      itemLayoutRef.current.pendingShrinkToken = token;
      requestAnimationFrame(() => {
        var _a4;
        if (itemLayoutRef.current.pendingShrinkToken !== token) {
          return;
        }
        const element = ref.current;
        const rect = (_a4 = element == null ? void 0 : element.getBoundingClientRect) == null ? void 0 : _a4.call(element);
        if (rect) {
          layout = { height: rect.height, width: rect.width };
        }
        doUpdate();
      });
      return;
    }
    if (IsNewArchitecture || size > 0) {
      doUpdate();
    } else {
      (_b = (_a3 = ref.current) == null ? void 0 : _a3.measure) == null ? void 0 : _b.call(_a3, (_x, _y, width, height) => {
        layout = { height, width };
        doUpdate();
      });
    }
  }, []);
  const { onLayout } = useOnLayoutSync(
    {
      onLayoutChange,
      ref
    },
    [itemKey, layoutRenderCount]
  );
  if (!IsNewArchitecture) {
    React2.useEffect(() => {
      if (!isNullOrUndefined(itemKey)) {
        itemLayoutRef.current.didLayout = false;
        const timeout = setTimeout(() => {
          if (!itemLayoutRef.current.didLayout) {
            const {
              itemKey: currentItemKey,
              lastSize,
              updateItemSize: updateItemSizeFn
            } = itemLayoutRef.current;
            if (lastSize && !isNullOrUndefined(currentItemKey)) {
              updateItemSizeFn(currentItemKey, lastSize);
              itemLayoutRef.current.didLayout = true;
            }
          }
        }, 16);
        return () => {
          clearTimeout(timeout);
        };
      }
    }, [itemKey]);
  }
  const PositionComponent = isSticky ? PositionViewSticky : PositionView;
  return /* @__PURE__ */ React2__namespace.createElement(
    PositionComponent,
    {
      animatedScrollY: isSticky ? animatedScrollY : void 0,
      horizontal,
      id,
      index,
      key: recycleItems ? void 0 : itemKey,
      onLayout,
      refView: ref,
      stickyHeaderConfig,
      style
    },
    /* @__PURE__ */ React2__namespace.createElement(ContextContainer.Provider, { value: contextValue }, renderedItem, renderedItemInfo && ItemSeparatorComponent && /* @__PURE__ */ React2__namespace.createElement(Separator, { ItemSeparatorComponent, leadingItem: renderedItemInfo.item }))
  );
});

// src/components/Containers.native.tsx
var Containers = typedMemo(function Containers2({
  horizontal,
  recycleItems,
  ItemSeparatorComponent,
  waitForInitialLayout,
  stickyHeaderConfig,
  updateItemSize: updateItemSize2,
  getRenderedItem: getRenderedItem2
}) {
  const ctx = useStateContext();
  const columnWrapperStyle = ctx.columnWrapperStyle;
  const [numContainers, numColumns] = useArr$(["numContainersPooled", "numColumns"]);
  const animSize = useValue$("totalSize", {
    // Use a microtask if increasing the size significantly, otherwise use a timeout
    // If this is the initial scroll, we don't want to delay because we want to update the size immediately
    delay: (value, prevValue) => {
      var _a3;
      return !((_a3 = ctx.state) == null ? void 0 : _a3.initialScroll) ? !prevValue || value - prevValue > 20 ? 0 : 200 : void 0;
    }
  });
  const animOpacity = waitForInitialLayout && !IsNewArchitecture ? useValue$("readyToRender", { getValue: (value) => value ? 1 : 0 }) : void 0;
  const otherAxisSize = useValue$("otherAxisSize", { delay: 0 });
  const containers = [];
  for (let i = 0; i < numContainers; i++) {
    containers.push(
      /* @__PURE__ */ React2__namespace.createElement(
        Container,
        {
          getRenderedItem: getRenderedItem2,
          horizontal,
          ItemSeparatorComponent,
          id: i,
          key: i,
          recycleItems,
          stickyHeaderConfig,
          updateItemSize: updateItemSize2
        }
      )
    );
  }
  const style = horizontal ? { minHeight: otherAxisSize, opacity: animOpacity, width: animSize } : { height: animSize, minWidth: otherAxisSize, opacity: animOpacity };
  if (columnWrapperStyle) {
    const { columnGap, rowGap, gap } = columnWrapperStyle;
    const gapX = columnGap || gap || 0;
    const gapY = rowGap || gap || 0;
    if (horizontal) {
      if (gapY && numColumns > 1) {
        style.marginVertical = -gapY / 2;
      }
      if (gapX) {
        style.marginRight = -gapX;
      }
    } else {
      if (gapX && numColumns > 1) {
        style.marginHorizontal = -gapX;
      }
      if (gapY) {
        style.marginBottom = -gapY;
      }
    }
  }
  return /* @__PURE__ */ React2__namespace.createElement(reactNative.Animated.View, { style }, containers);
});
function DevNumbers() {
  return IS_DEV && // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  React2__namespace.memo(function DevNumbers2() {
    return Array.from({ length: 100 }).map((_, index) => /* @__PURE__ */ React2__namespace.createElement(
      reactNative.View,
      {
        key: index,
        style: {
          height: 100,
          pointerEvents: "none",
          position: "absolute",
          top: index * 100,
          width: "100%"
        }
      },
      /* @__PURE__ */ React2__namespace.createElement(reactNative.Text, { style: { color: "red" } }, index * 100)
    ));
  });
}
var ListComponentScrollView = reactNative.Animated.ScrollView;
function ScrollAdjust() {
  const bias = 1e7;
  const [scrollAdjust, scrollAdjustUserOffset] = useArr$(["scrollAdjust", "scrollAdjustUserOffset"]);
  const scrollOffset = (scrollAdjust || 0) + (scrollAdjustUserOffset || 0) + bias;
  return /* @__PURE__ */ React2__namespace.createElement(
    reactNative.View,
    {
      style: {
        height: 0,
        left: 0,
        position: "absolute",
        top: scrollOffset,
        width: 0
      }
    }
  );
}
function SnapWrapper({ ScrollComponent, ...props }) {
  const [snapToOffsets] = useArr$(["snapToOffsets"]);
  return /* @__PURE__ */ React2__namespace.createElement(ScrollComponent, { ...props, snapToOffsets });
}
var LayoutView = ({ onLayoutChange, refView, ...rest }) => {
  const ref = refView != null ? refView : React2.useRef();
  const { onLayout } = useOnLayoutSync({ onLayoutChange, ref });
  return /* @__PURE__ */ React2__namespace.createElement(reactNative.View, { ...rest, onLayout, ref });
};

// src/components/ListComponent.tsx
var ListComponent = typedMemo(function ListComponent2({
  canRender,
  style,
  contentContainerStyle,
  horizontal,
  initialContentOffset,
  recycleItems,
  ItemSeparatorComponent,
  alignItemsAtEnd: _alignItemsAtEnd,
  waitForInitialLayout,
  onScroll: onScroll2,
  onLayout,
  ListHeaderComponent,
  ListHeaderComponentStyle,
  ListFooterComponent,
  ListFooterComponentStyle,
  ListEmptyComponent,
  getRenderedItem: getRenderedItem2,
  updateItemSize: updateItemSize2,
  refScrollView,
  renderScrollComponent,
  scrollAdjustHandler,
  onLayoutHeader,
  snapToIndices,
  stickyHeaderConfig,
  stickyHeaderIndices,
  ...rest
}) {
  const ctx = useStateContext();
  const maintainVisibleContentPosition = ctx.state.props.maintainVisibleContentPosition;
  const ScrollComponent = renderScrollComponent ? React2.useMemo(
    () => React2__namespace.forwardRef((props, ref) => renderScrollComponent({ ...props, ref })),
    [renderScrollComponent]
  ) : ListComponentScrollView;
  const SnapOrScroll = snapToIndices ? SnapWrapper : ScrollComponent;
  React2.useLayoutEffect(() => {
    if (!ListHeaderComponent) {
      set$(ctx, "headerSize", 0);
    }
    if (!ListFooterComponent) {
      set$(ctx, "footerSize", 0);
    }
  }, [ListHeaderComponent, ListFooterComponent, ctx]);
  return /* @__PURE__ */ React2__namespace.createElement(
    SnapOrScroll,
    {
      ...rest,
      contentContainerStyle: [
        contentContainerStyle,
        horizontal ? {
          height: "100%"
        } : {}
      ],
      contentOffset: initialContentOffset ? horizontal ? { x: initialContentOffset, y: 0 } : { x: 0, y: initialContentOffset } : void 0,
      horizontal,
      maintainVisibleContentPosition: maintainVisibleContentPosition.size || maintainVisibleContentPosition.data ? { minIndexForVisible: 0 } : void 0,
      onLayout,
      onScroll: onScroll2,
      ref: refScrollView,
      ScrollComponent: snapToIndices ? ScrollComponent : void 0,
      style
    },
    /* @__PURE__ */ React2__namespace.createElement(ScrollAdjust, null),
    ListHeaderComponent && /* @__PURE__ */ React2__namespace.createElement(LayoutView, { onLayoutChange: onLayoutHeader, style: ListHeaderComponentStyle }, getComponent(ListHeaderComponent)),
    ListEmptyComponent && getComponent(ListEmptyComponent),
    canRender && !ListEmptyComponent && /* @__PURE__ */ React2__namespace.createElement(
      Containers,
      {
        getRenderedItem: getRenderedItem2,
        horizontal,
        ItemSeparatorComponent,
        recycleItems,
        stickyHeaderConfig,
        updateItemSize: updateItemSize2,
        waitForInitialLayout
      }
    ),
    ListFooterComponent && /* @__PURE__ */ React2__namespace.createElement(
      LayoutView,
      {
        onLayoutChange: (layout) => {
          const size = layout[horizontal ? "width" : "height"];
          set$(ctx, "footerSize", size);
        },
        style: ListFooterComponentStyle
      },
      getComponent(ListFooterComponent)
    ),
    IS_DEV && ENABLE_DEVMODE && /* @__PURE__ */ React2__namespace.createElement(DevNumbers, null)
  );
});

// src/utils/getId.ts
function getId(state, index) {
  const { data, keyExtractor } = state.props;
  if (!data) {
    return "";
  }
  const ret = index < data.length ? keyExtractor ? keyExtractor(data[index], index) : index : null;
  const id = ret;
  state.idCache[index] = id;
  return id;
}

// src/core/calculateOffsetForIndex.ts
function calculateOffsetForIndex(ctx, index) {
  const state = ctx.state;
  let position = 0;
  if (index !== void 0) {
    position = state.positions.get(getId(state, index)) || 0;
    const paddingTop = peek$(ctx, "stylePaddingTop");
    if (paddingTop) {
      position += paddingTop;
    }
    const headerSize = peek$(ctx, "headerSize");
    if (headerSize) {
      position += headerSize;
    }
  }
  return position;
}

// src/core/addTotalSize.ts
function addTotalSize(ctx, key, add) {
  const state = ctx.state;
  const prevTotalSize = state.totalSize;
  let totalSize = state.totalSize;
  if (key === null) {
    totalSize = add;
    if (state.timeoutSetPaddingTop) {
      clearTimeout(state.timeoutSetPaddingTop);
      state.timeoutSetPaddingTop = void 0;
    }
  } else {
    totalSize += add;
  }
  if (prevTotalSize !== totalSize) {
    if (!IsNewArchitecture && state.initialScroll && totalSize < prevTotalSize) {
      state.pendingTotalSize = totalSize;
    } else {
      state.pendingTotalSize = void 0;
      state.totalSize = totalSize;
      set$(ctx, "totalSize", totalSize);
    }
  }
}

// src/core/setSize.ts
function setSize(ctx, itemKey, size) {
  const state = ctx.state;
  const { sizes } = state;
  const previousSize = sizes.get(itemKey);
  const diff = previousSize !== void 0 ? size - previousSize : size;
  if (diff !== 0) {
    addTotalSize(ctx, itemKey, diff);
  }
  sizes.set(itemKey, size);
}

// src/utils/getItemSize.ts
function getItemSize(ctx, key, index, data, useAverageSize, preferCachedSize) {
  var _a3;
  const state = ctx.state;
  const {
    sizesKnown,
    sizes,
    averageSizes,
    props: { estimatedItemSize, getEstimatedItemSize, getFixedItemSize, getItemType },
    scrollingTo
  } = state;
  let size;
  const itemType = getItemType ? (_a3 = getItemType(data, index)) != null ? _a3 : "" : "";
  if (size === void 0) {
    size = getEstimatedItemSize ? getEstimatedItemSize(data, index, itemType) : estimatedItemSize;
  }
  setSize(ctx, key, size);
  return size;
}

// src/core/calculateOffsetWithOffsetPosition.ts
function calculateOffsetWithOffsetPosition(ctx, offsetParam, params) {
  const state = ctx.state;
  const { index, viewOffset, viewPosition } = params;
  let offset = offsetParam;
  if (viewOffset) {
    offset -= viewOffset;
  }
  if (viewPosition !== void 0 && index !== void 0) {
    const itemSize = getItemSize(ctx, getId(state, index), index, state.props.data[index]);
    const trailingInset = getContentInsetEnd(state);
    offset -= viewPosition * (state.scrollLength - trailingInset - itemSize);
  }
  return offset;
}

// src/core/clampScrollOffset.ts
function clampScrollOffset(ctx, offset) {
  const state = ctx.state;
  const contentSize = getContentSize(ctx);
  let clampedOffset = offset;
  if (Number.isFinite(contentSize) && Number.isFinite(state.scrollLength) && (Platform2.OS !== "android" || state.lastLayout)) {
    const maxOffset = Math.max(0, contentSize - state.scrollLength);
    clampedOffset = Math.min(offset, maxOffset);
  }
  clampedOffset = Math.max(0, clampedOffset);
  return clampedOffset;
}

// src/utils/setInitialRenderState.ts
function setInitialRenderState(ctx, {
  didLayout,
  didInitialScroll
}) {
  const { state } = ctx;
  if (didLayout) {
    state.didContainersLayout = true;
  }
  if (didInitialScroll) {
    state.didFinishInitialScroll = true;
  }
  if (state.didContainersLayout && state.didFinishInitialScroll) {
    set$(ctx, "readyToRender", true);
  }
}

// src/core/finishScrollTo.ts
function finishScrollTo(ctx) {
  var _a3, _b, _c, _d;
  const state = ctx.state;
  if (state == null ? void 0 : state.scrollingTo) {
    const scrollingTo = state.scrollingTo;
    const callback = scrollingTo.onSettled;
    if (scrollingTo.isScrollToEnd) {
      const currentLastIndex = state.props.data.length - 1;
      const isAtEnd = state.isAtEnd;
      const retryCount = (_a3 = scrollingTo.retryCount) != null ? _a3 : 0;
      const MAX_RETRIES = 3;
      const dataChanged = scrollingTo.index !== currentLastIndex;
      const notAtBottom = !isAtEnd;
      const shouldRetry = (dataChanged || notAtBottom) && currentLastIndex >= 0 && retryCount < MAX_RETRIES;
      if (shouldRetry) {
        state.scrollHistory.length = 0;
        state.scrollingTo = void 0;
        const targetId = getId(state, currentLastIndex);
        const itemSize = getItemSize(ctx, targetId, currentLastIndex, state.props.data[currentLastIndex]);
        const currentOffset = calculateOffsetForIndex(ctx, currentLastIndex);
        scrollTo(ctx, {
          animated: false,
          // Don't animate the correction
          index: currentLastIndex,
          isScrollToEnd: true,
          itemKey: targetId,
          itemSize,
          offset: currentOffset,
          onSettled: callback,
          // Preserve original callback
          viewOffset: scrollingTo.viewOffset,
          viewPosition: (_b = scrollingTo.viewPosition) != null ? _b : 1,
          forceScroll: true,
          retryCount: retryCount + 1
          // Track retry attempts
        });
        return;
      }
      if (retryCount >= MAX_RETRIES && (dataChanged || notAtBottom)) {
        console.warn("[FINISH-SCROLL-TO] ScrollToEnd reached max retries, giving up:", {
          retryCount,
          targetWas: scrollingTo.index,
          currentEnd: currentLastIndex,
          isAtEnd,
          dataChanged
        });
      }
    }
    state.scrollHistory.length = 0;
    state.initialScroll = void 0;
    state.initialAnchor = void 0;
    state.scrollingTo = void 0;
    if (state.pendingTotalSize !== void 0) {
      addTotalSize(ctx, null, state.pendingTotalSize);
    }
    if ((_c = state.props) == null ? void 0 : _c.data) {
      (_d = state.triggerCalculateItemsInView) == null ? void 0 : _d.call(state, { doMVCP: true, forceFullItemPositions: true });
    }
    if (PlatformAdjustBreaksScroll) {
      state.scrollAdjustHandler.commitPendingAdjust(scrollingTo);
    }
    setInitialRenderState(ctx, { didInitialScroll: true });
    if (scrollingTo.isInitialScroll && ctx.initializationManager.isInitializing()) {
      ctx.initializationManager.markInitialScrollComplete();
      ctx.initializationManager.transitionToStabilizingPhase();
    }
    if (callback) {
      callback();
    }
  }
}

// src/core/checkFinishedScroll.ts
function checkFinishedScroll(ctx) {
  ctx.state.animFrameCheckFinishedScroll = requestAnimationFrame(() => checkFinishedScrollFrame(ctx));
}
function checkFinishedScrollFrame(ctx) {
  const scrollingTo = ctx.state.scrollingTo;
  if (scrollingTo) {
    const { state } = ctx;
    state.animFrameCheckFinishedScroll = void 0;
    const scroll = state.scrollPending;
    const adjust = state.scrollAdjustHandler.getAdjust();
    const clampedTargetOffset = clampScrollOffset(ctx, scrollingTo.offset - (scrollingTo.viewOffset || 0));
    const maxOffset = clampScrollOffset(ctx, scroll);
    const diff1 = Math.abs(scroll - clampedTargetOffset);
    const diff2 = Math.abs(diff1 - adjust);
    const isNotOverscrolled = Math.abs(scroll - maxOffset) < 1;
    if (isNotOverscrolled && (diff1 < 1 || diff2 < 1)) {
      finishScrollTo(ctx);
    }
  }
}
function checkFinishedScrollFallback(ctx) {
  const state = ctx.state;
  const scrollingTo = state.scrollingTo;
  const slowTimeout = (scrollingTo == null ? void 0 : scrollingTo.isInitialScroll) || !state.didContainersLayout;
  state.timeoutCheckFinishedScrollFallback = setTimeout(
    () => {
      let numChecks = 0;
      const checkHasScrolled = () => {
        state.timeoutCheckFinishedScrollFallback = void 0;
        const isStillScrollingTo = state.scrollingTo;
        if (isStillScrollingTo) {
          numChecks++;
          if (state.hasScrolled || numChecks > 5) {
            finishScrollTo(ctx);
          } else {
            state.timeoutCheckFinishedScrollFallback = setTimeout(checkHasScrolled, 100);
          }
        }
      };
      checkHasScrolled();
    },
    slowTimeout ? 500 : 100
  );
}

// src/core/doScrollTo.native.ts
function doScrollTo(ctx, params) {
  var _a3;
  const state = ctx.state;
  const { animated, horizontal, offset } = params;
  const { refScroller } = state;
  (_a3 = refScroller.current) == null ? void 0 : _a3.scrollTo({
    animated: !!animated,
    x: horizontal ? offset : 0,
    y: horizontal ? 0 : offset
  });
  if (!animated) {
    state.scroll = offset;
    checkFinishedScrollFallback(ctx);
  }
}

// src/core/scrollTo.ts
function scrollTo(ctx, params) {
  const state = ctx.state;
  const { noScrollingTo, forceScroll, ...scrollTarget } = params;
  const { animated, isInitialScroll, offset: scrollTargetOffset, precomputedWithViewOffset } = scrollTarget;
  const {
    props: { horizontal }
  } = state;
  if (state.animFrameCheckFinishedScroll) {
    cancelAnimationFrame(ctx.state.animFrameCheckFinishedScroll);
  }
  if (state.timeoutCheckFinishedScrollFallback) {
    clearTimeout(ctx.state.timeoutCheckFinishedScrollFallback);
  }
  let offset = precomputedWithViewOffset ? scrollTargetOffset : calculateOffsetWithOffsetPosition(ctx, scrollTargetOffset, scrollTarget);
  offset = clampScrollOffset(ctx, offset);
  state.scrollHistory.length = 0;
  if (!noScrollingTo) {
    state.scrollingTo = scrollTarget;
  }
  state.scrollPending = offset;
  if (!forceScroll && Math.abs(offset - state.scroll) < 1) {
    finishScrollTo(ctx);
    return;
  }
  if (forceScroll || !isInitialScroll || Platform2.OS === "android") {
    doScrollTo(ctx, { animated, horizontal, isInitialScroll, offset });
  } else {
    state.scroll = offset;
    setTimeout(() => finishScrollTo(ctx), 100);
  }
}

// src/platform/flushSync.native.ts
var flushSync = (fn) => {
  fn();
};

// src/utils/checkThreshold.ts
var HYSTERESIS_MULTIPLIER = 1.3;
var checkThreshold = (distance, atThreshold, threshold, wasReached, snapshot, context, onReached, setSnapshot, allowReentryOnChange) => {
  const absDistance = Math.abs(distance);
  const within = atThreshold || threshold > 0 && absDistance <= threshold;
  if (wasReached === null) {
    if (atThreshold && threshold > 0) {
      return false;
    }
    if (within) {
      return false;
    }
    if (!within && distance >= 0) {
      return false;
    }
    return null;
  }
  const updateSnapshot = () => {
    setSnapshot({
      atThreshold,
      contentSize: context.contentSize,
      dataLength: context.dataLength,
      scrollPosition: context.scrollPosition
    });
  };
  if (wasReached === false) {
    if (!within) {
      return false;
    }
    onReached(distance);
    updateSnapshot();
    return true;
  }
  const reset = !atThreshold && threshold > 0 && absDistance >= threshold * HYSTERESIS_MULTIPLIER || !atThreshold && threshold <= 0 && absDistance > 0;
  if (reset) {
    setSnapshot(void 0);
    return false;
  }
  if (within) {
    const changed = !snapshot || snapshot.atThreshold !== atThreshold || snapshot.contentSize !== context.contentSize || snapshot.dataLength !== context.dataLength;
    if (changed) {
      if (allowReentryOnChange) {
        onReached(distance);
      }
      updateSnapshot();
    }
  }
  return true;
};

// src/utils/checkAtBottom.ts
function checkAtBottom(ctx) {
  var _a3;
  const state = ctx.state;
  if (!state) {
    return;
  }
  const {
    scrollLength,
    scroll,
    maintainingScrollAtEnd,
    props: { maintainScrollAtEndThreshold, onEndReachedThreshold }
  } = state;
  const contentSize = getContentSize(ctx);
  if (!maintainingScrollAtEnd) {
    const insetEnd = getContentInsetEnd(state);
    const distanceFromEnd = contentSize - scroll - scrollLength - insetEnd;
    const isContentLess = contentSize < scrollLength;
    state.isAtEnd = isContentLess || distanceFromEnd < scrollLength * maintainScrollAtEndThreshold;
    state.isEndReached = checkThreshold(
      distanceFromEnd,
      isContentLess,
      onEndReachedThreshold * scrollLength,
      state.isEndReached,
      state.endReachedSnapshot,
      {
        contentSize,
        dataLength: (_a3 = state.props.data) == null ? void 0 : _a3.length,
        scrollPosition: scroll
      },
      (distance) => {
        var _a4, _b;
        if (state.isInitializing) {
          return;
        }
        (_b = (_a4 = state.props).onEndReached) == null ? void 0 : _b.call(_a4, { distanceFromEnd: distance });
      },
      (snapshot) => {
        state.endReachedSnapshot = snapshot;
      },
      true
    );
  }
}

// src/utils/checkAtTop.ts
function checkAtTop(state) {
  var _a3;
  if (!state) {
    return;
  }
  const {
    scrollLength,
    scroll,
    props: { onStartReachedThreshold }
  } = state;
  const distanceFromTop = scroll;
  state.isAtStart = distanceFromTop <= 0;
  state.isStartReached = checkThreshold(
    distanceFromTop,
    false,
    onStartReachedThreshold * scrollLength,
    state.isStartReached,
    state.startReachedSnapshot,
    {
      contentSize: state.totalSize,
      dataLength: (_a3 = state.props.data) == null ? void 0 : _a3.length,
      scrollPosition: scroll
    },
    (distance) => {
      var _a4, _b;
      if (state.isInitializing) {
        return;
      }
      (_b = (_a4 = state.props).onStartReached) == null ? void 0 : _b.call(_a4, { distanceFromStart: distance });
    },
    (snapshot) => {
      state.startReachedSnapshot = snapshot;
    },
    false
  );
}

// src/core/updateScroll.ts
function updateScroll(ctx, newScroll, forceUpdate) {
  const state = ctx.state;
  const { scrollingTo, scrollAdjustHandler, lastScrollAdjustForHistory } = state;
  const prevScroll = state.scroll;
  state.hasScrolled = true;
  state.lastBatchingAction = Date.now();
  const currentTime = Date.now();
  const adjust = scrollAdjustHandler.getAdjust();
  const adjustChanged = lastScrollAdjustForHistory !== void 0 && Math.abs(adjust - lastScrollAdjustForHistory) > 0.1;
  if (adjustChanged) {
    state.scrollHistory.length = 0;
  }
  state.lastScrollAdjustForHistory = adjust;
  if (scrollingTo === void 0 && !(state.scrollHistory.length === 0 && newScroll === state.scroll)) {
    if (!adjustChanged) {
      state.scrollHistory.push({ scroll: newScroll, time: currentTime });
    }
  }
  if (state.scrollHistory.length > 5) {
    state.scrollHistory.shift();
  }
  state.scrollPrev = prevScroll;
  state.scrollPrevTime = state.scrollTime;
  state.scroll = newScroll;
  state.scrollTime = currentTime;
  const ignoreScrollFromMVCP = state.ignoreScrollFromMVCP;
  if (ignoreScrollFromMVCP && !scrollingTo) {
    const { lt, gt } = ignoreScrollFromMVCP;
    if (lt && newScroll < lt || gt && newScroll > gt) {
      state.ignoreScrollFromMVCPIgnored = true;
      return;
    }
  }
  const scrollDelta = Math.abs(newScroll - prevScroll);
  const scrollLength = state.scrollLength;
  const lastCalculated = state.scrollLastCalculate;
  const shouldUpdate = forceUpdate || state.dataChangeNeedsScrollUpdate || state.scrollLastCalculate === void 0 || lastCalculated === void 0 || Math.abs(state.scroll - lastCalculated) > 2;
  if (shouldUpdate) {
    state.scrollLastCalculate = state.scroll;
    state.ignoreScrollFromMVCPIgnored = false;
    state.lastScrollDelta = scrollDelta;
    const runCalculateItems = () => {
      var _a3;
      (_a3 = state.triggerCalculateItemsInView) == null ? void 0 : _a3.call(state, { doMVCP: scrollingTo !== void 0 });
      checkAtBottom(ctx);
      checkAtTop(state);
    };
    if (Platform2.OS === "web" && scrollLength > 0 && scrollingTo === void 0 && scrollDelta > scrollLength) {
      flushSync(runCalculateItems);
    } else {
      runCalculateItems();
    }
    state.dataChangeNeedsScrollUpdate = false;
    state.lastScrollDelta = 0;
  }
}

// src/utils/requestAdjust.ts
function requestAdjust(ctx, positionDiff, dataChanged) {
  const state = ctx.state;
  if (Math.abs(positionDiff) > 0.1) {
    const needsScrollWorkaround = Platform2.OS === "android" && !IsNewArchitecture && dataChanged && state.scroll <= positionDiff;
    const doit = () => {
      if (needsScrollWorkaround) {
        scrollTo(ctx, {
          noScrollingTo: true,
          offset: state.scroll
        });
      } else {
        state.scrollAdjustHandler.requestAdjust(positionDiff);
        if (state.adjustingFromInitialMount) {
          state.adjustingFromInitialMount--;
        }
      }
    };
    state.scroll += positionDiff;
    state.scrollForNextCalculateItemsInView = void 0;
    if (state.isInitializing && Math.abs(positionDiff) > 1) {
      ctx.initializationManager.onMVCPAdjusted();
    }
    const readyToRender = peek$(ctx, "readyToRender");
    if (readyToRender) {
      doit();
      if (Platform2.OS !== "web") {
        const threshold = state.scroll - positionDiff / 2;
        if (!state.ignoreScrollFromMVCP) {
          state.ignoreScrollFromMVCP = {};
        }
        if (positionDiff > 0) {
          state.ignoreScrollFromMVCP.lt = threshold;
        } else {
          state.ignoreScrollFromMVCP.gt = threshold;
        }
        if (state.ignoreScrollFromMVCPTimeout) {
          clearTimeout(state.ignoreScrollFromMVCPTimeout);
        }
        const delay = needsScrollWorkaround ? 250 : 100;
        state.ignoreScrollFromMVCPTimeout = setTimeout(() => {
          state.ignoreScrollFromMVCP = void 0;
          const shouldForceUpdate = state.ignoreScrollFromMVCPIgnored && state.scrollProcessingEnabled !== false;
          if (shouldForceUpdate) {
            state.ignoreScrollFromMVCPIgnored = false;
            state.scrollPending = state.scroll;
            updateScroll(ctx, state.scroll, true);
          }
        }, delay);
      }
    } else {
      state.adjustingFromInitialMount = (state.adjustingFromInitialMount || 0) + 1;
      requestAnimationFrame(doit);
    }
  }
}

// src/core/ensureInitialAnchor.ts
var INITIAL_ANCHOR_TOLERANCE = 0.5;
var INITIAL_ANCHOR_MAX_ATTEMPTS = 4;
var INITIAL_ANCHOR_SETTLED_TICKS = 2;
function ensureInitialAnchor(ctx) {
  var _a3, _b, _c, _d, _e;
  const state = ctx.state;
  const { initialAnchor, didContainersLayout, positions, scroll, scrollLength } = state;
  const anchor = initialAnchor;
  const item = state.props.data[anchor.index];
  if (!didContainersLayout) {
    return;
  }
  const id = getId(state, anchor.index);
  if (positions.get(id) === void 0) {
    return;
  }
  const size = getItemSize(ctx, id, anchor.index, item);
  if (size === void 0) {
    return;
  }
  const availableSpace = Math.max(0, scrollLength - size);
  const desiredOffset = calculateOffsetForIndex(ctx, anchor.index) - ((_a3 = anchor.viewOffset) != null ? _a3 : 0) - ((_b = anchor.viewPosition) != null ? _b : 0) * availableSpace;
  const clampedDesiredOffset = clampScrollOffset(ctx, desiredOffset);
  const delta = clampedDesiredOffset - scroll;
  if (Math.abs(delta) <= INITIAL_ANCHOR_TOLERANCE) {
    const settledTicks = ((_c = anchor.settledTicks) != null ? _c : 0) + 1;
    if (settledTicks >= INITIAL_ANCHOR_SETTLED_TICKS) {
      state.initialAnchor = void 0;
    } else {
      anchor.settledTicks = settledTicks;
    }
    return;
  }
  if (((_d = anchor.attempts) != null ? _d : 0) >= INITIAL_ANCHOR_MAX_ATTEMPTS) {
    state.initialAnchor = void 0;
    return;
  }
  const lastDelta = anchor.lastDelta;
  if (lastDelta !== void 0 && Math.abs(delta) >= Math.abs(lastDelta)) {
    state.initialAnchor = void 0;
    return;
  }
  Object.assign(anchor, {
    attempts: ((_e = anchor.attempts) != null ? _e : 0) + 1,
    lastDelta: delta,
    settledTicks: 0
  });
  requestAdjust(ctx, delta);
}

// src/core/initialization/mvcpInitialization.ts
function prepareInitializationMVCP(ctx) {
  var _a3;
  const state = ctx.state;
  const manager = ctx.initializationManager;
  const anchorId = manager.getMVCPAnchorOverride();
  if (!anchorId) return void 0;
  const anchorIndex = state.indexByKey.get(anchorId);
  if (anchorIndex === void 0) {
    return void 0;
  }
  const prevPosition = state.positions.get(anchorId);
  if (prevPosition === void 0) {
    return void 0;
  }
  const targetViewPosition = (_a3 = manager.getTargetViewPosition()) != null ? _a3 : 0.5;
  return () => {
    const newPosition = state.positions.get(anchorId);
    if (newPosition === void 0) {
      return;
    }
    const targetScroll = newPosition - targetViewPosition * state.scrollLength;
    const contentSize = getContentSize(ctx);
    const maxScroll = Math.max(0, contentSize - state.scrollLength);
    const clampedTargetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    const scrollAdjustment = clampedTargetScroll - state.scroll;
    if (Math.abs(scrollAdjustment) > 0.1) {
      requestAdjust(ctx, scrollAdjustment, false);
    }
  };
}

// src/core/mvcp.ts
function prepareMVCP(ctx, dataChanged) {
  const state = ctx.state;
  const { idsInView, positions, props } = state;
  const {
    maintainVisibleContentPosition: { data: mvcpData, size: mvcpScroll, shouldRestorePosition },
    alignItemsAtEnd
  } = props;
  const scrollingTo = state.scrollingTo;
  let prevPosition;
  let targetId;
  const idsInViewWithPositions = [];
  const scrollTarget = scrollingTo == null ? void 0 : scrollingTo.index;
  const scrollingToViewPosition = scrollingTo == null ? void 0 : scrollingTo.viewPosition;
  const shouldMVCP = dataChanged ? mvcpData : mvcpScroll;
  const indexByKey = state.indexByKey;
  if (shouldMVCP) {
    if (scrollTarget !== void 0) {
      if (!IsNewArchitecture && (scrollingTo == null ? void 0 : scrollingTo.isInitialScroll)) {
        return void 0;
      }
      targetId = getId(state, scrollTarget);
    } else if (idsInView.length > 0 && state.didContainersLayout) {
      if (dataChanged) {
        if (alignItemsAtEnd) {
          for (let i = idsInView.length - 1; i >= 0; i--) {
            const id = idsInView[i];
            const index = indexByKey.get(id);
            if (index !== void 0) {
              idsInViewWithPositions.push({ id, position: positions.get(id) });
            }
          }
        } else {
          for (let i = 0; i < idsInView.length; i++) {
            const id = idsInView[i];
            const index = indexByKey.get(id);
            if (index !== void 0) {
              idsInViewWithPositions.push({ id, position: positions.get(id) });
            }
          }
        }
      } else {
        if (alignItemsAtEnd) {
          for (let i = idsInView.length - 1; i >= 0; i--) {
            const id = idsInView[i];
            const index = indexByKey.get(id);
            if (index !== void 0) {
              targetId = id;
              break;
            }
          }
        } else {
          targetId = idsInView.find((id) => indexByKey.get(id) !== void 0);
        }
      }
    }
    if (targetId !== void 0) {
      prevPosition = positions.get(targetId);
    }
    return () => {
      let positionDiff = 0;
      if (dataChanged && targetId === void 0 && mvcpData) {
        const data = state.props.data;
        for (let i = 0; i < idsInViewWithPositions.length; i++) {
          const { id, position } = idsInViewWithPositions[i];
          const index = indexByKey.get(id);
          if (index !== void 0 && shouldRestorePosition) {
            const item = data[index];
            if (item === void 0 || !shouldRestorePosition(item, index, data)) {
              continue;
            }
          }
          const newPosition = positions.get(id);
          if (newPosition !== void 0) {
            positionDiff = newPosition - position;
            break;
          }
        }
      }
      if (targetId !== void 0 && prevPosition !== void 0) {
        const newPosition = positions.get(targetId);
        if (newPosition !== void 0) {
          const totalSize = getContentSize(ctx);
          let diff = newPosition - prevPosition;
          if (diff !== 0 && state.scroll + state.scrollLength > totalSize) {
            if (diff > 0) {
              diff = Math.max(0, totalSize - state.scroll - state.scrollLength);
            } else {
              diff = 0;
            }
          }
          positionDiff = diff;
        }
      }
      if (scrollingToViewPosition && scrollingToViewPosition > 0) {
        const newSize = getItemSize(ctx, targetId, scrollTarget, state.props.data[scrollTarget]);
        const prevSize = scrollingTo == null ? void 0 : scrollingTo.itemSize;
        if (newSize !== void 0 && prevSize !== void 0 && newSize !== (scrollingTo == null ? void 0 : scrollingTo.itemSize)) {
          const diff = newSize - prevSize;
          if (diff !== 0) {
            positionDiff += (newSize - prevSize) * scrollingToViewPosition;
            scrollingTo.itemSize = newSize;
          }
        }
      }
      if (Math.abs(positionDiff) > 0.1) {
        requestAdjust(ctx, positionDiff, dataChanged && mvcpData);
      }
    };
  }
}

// src/core/prepareColumnStartState.ts
function prepareColumnStartState(ctx, startIndex, useAverageSize) {
  var _a3;
  const state = ctx.state;
  const numColumns = peek$(ctx, "numColumns");
  let rowStartIndex = startIndex;
  const columnAtStart = state.columns.get(state.idCache[startIndex]);
  if (columnAtStart !== 1) {
    rowStartIndex = findRowStartIndex(state, numColumns, startIndex);
  }
  let currentRowTop = 0;
  const curId = state.idCache[rowStartIndex];
  const column = state.columns.get(curId);
  if (rowStartIndex > 0) {
    const prevIndex = rowStartIndex - 1;
    const prevId = state.idCache[prevIndex];
    const prevPosition = (_a3 = state.positions.get(prevId)) != null ? _a3 : 0;
    const prevRowStart = findRowStartIndex(state, numColumns, prevIndex);
    const prevRowHeight = calculateRowMaxSize(ctx, prevRowStart, prevIndex);
    currentRowTop = prevPosition + prevRowHeight;
  }
  return {
    column,
    currentRowTop,
    startIndex: rowStartIndex
  };
}
function findRowStartIndex(state, numColumns, index) {
  if (numColumns <= 1) {
    return Math.max(0, index);
  }
  let rowStart = Math.max(0, index);
  while (rowStart > 0) {
    const columnForIndex = state.columns.get(state.idCache[rowStart]);
    if (columnForIndex === 1) {
      break;
    }
    rowStart--;
  }
  return rowStart;
}
function calculateRowMaxSize(ctx, startIndex, endIndex, useAverageSize) {
  const state = ctx.state;
  if (endIndex < startIndex) {
    return 0;
  }
  const { data } = state.props;
  if (!data) {
    return 0;
  }
  let maxSize = 0;
  for (let i = startIndex; i <= endIndex; i++) {
    if (i < 0 || i >= data.length) {
      continue;
    }
    const id = state.idCache[i];
    const size = getItemSize(ctx, id, i, data[i]);
    if (size > maxSize) {
      maxSize = size;
    }
  }
  return maxSize;
}

// src/core/updateTotalSize.ts
function updateTotalSize(ctx) {
  var _a3, _b, _c;
  const state = ctx.state;
  const {
    positions,
    props: { data }
  } = state;
  const numColumns = (_a3 = peek$(ctx, "numColumns")) != null ? _a3 : 1;
  if (data.length === 0) {
    addTotalSize(ctx, null, 0);
  } else {
    const lastId = getId(state, data.length - 1);
    if (lastId !== void 0) {
      const lastPosition = positions.get(lastId);
      if (lastPosition !== void 0) {
        if (numColumns > 1) {
          let rowStart = data.length - 1;
          while (rowStart > 0) {
            const rowId = (_b = state.idCache[rowStart]) != null ? _b : getId(state, rowStart);
            const column = state.columns.get(rowId);
            if (column === 1 || column === void 0) {
              break;
            }
            rowStart -= 1;
          }
          let maxSize = 0;
          for (let i = rowStart; i < data.length; i++) {
            const rowId = (_c = state.idCache[i]) != null ? _c : getId(state, i);
            const size = getItemSize(ctx, rowId, i, data[i]);
            if (size > maxSize) {
              maxSize = size;
            }
          }
          addTotalSize(ctx, null, lastPosition + maxSize);
        } else {
          const lastSize = getItemSize(ctx, lastId, data.length - 1, data[data.length - 1]);
          if (lastSize !== void 0) {
            const totalSize = lastPosition + lastSize;
            addTotalSize(ctx, null, totalSize);
          }
        }
      }
    }
  }
}

// src/utils/getScrollVelocity.ts
var getScrollVelocity = (state) => {
  const { scrollHistory } = state;
  const newestIndex = scrollHistory.length - 1;
  if (newestIndex < 1) {
    return 0;
  }
  const newest = scrollHistory[newestIndex];
  const now = Date.now();
  let direction = 0;
  for (let i = newestIndex; i > 0; i--) {
    const delta = scrollHistory[i].scroll - scrollHistory[i - 1].scroll;
    if (delta !== 0) {
      direction = Math.sign(delta);
      break;
    }
  }
  if (direction === 0) {
    return 0;
  }
  let oldest = newest;
  for (let i = newestIndex - 1; i >= 0; i--) {
    const current = scrollHistory[i];
    const next = scrollHistory[i + 1];
    const delta = next.scroll - current.scroll;
    const deltaSign = Math.sign(delta);
    if (deltaSign !== 0 && deltaSign !== direction) {
      break;
    }
    if (now - current.time > 1e3) {
      break;
    }
    oldest = current;
  }
  const scrollDiff = newest.scroll - oldest.scroll;
  const timeDiff = newest.time - oldest.time;
  return timeDiff > 0 ? scrollDiff / timeDiff : 0;
};

// src/utils/updateSnapToOffsets.ts
function updateSnapToOffsets(ctx) {
  const state = ctx.state;
  const {
    positions,
    props: { snapToIndices }
  } = state;
  const snapToOffsets = Array(snapToIndices.length);
  for (let i = 0; i < snapToIndices.length; i++) {
    const idx = snapToIndices[i];
    const key = getId(state, idx);
    snapToOffsets[i] = positions.get(key);
  }
  set$(ctx, "snapToOffsets", snapToOffsets);
}

// src/core/updateItemPositions.ts
function updateItemPositions(ctx, dataChanged, { startIndex, scrollBottomBuffered, forceFullUpdate = false, doMVCP } = {
  doMVCP: false,
  forceFullUpdate: false,
  scrollBottomBuffered: -1,
  startIndex: 0
}) {
  var _a3, _b, _c, _d, _e, _f;
  const state = ctx.state;
  const {
    columns,
    columnSpans,
    indexByKey,
    positions,
    idCache,
    sizesKnown,
    props: { data, getEstimatedItemSize, overrideItemLayout, snapToIndices },
    scrollingTo
  } = state;
  const dataLength = data.length;
  const numColumns = (_a3 = peek$(ctx, "numColumns")) != null ? _a3 : 1;
  const hasColumns = numColumns > 1;
  const indexByKeyForChecking = IS_DEV ? /* @__PURE__ */ new Map() : void 0;
  const extraData = peek$(ctx, "extraData");
  const layoutConfig = overrideItemLayout ? { span: 1 } : void 0;
  const lastScrollDelta = state.lastScrollDelta;
  const velocity = getScrollVelocity(state);
  const shouldOptimize = !forceFullUpdate && !dataChanged && (Math.abs(velocity) > 0 || Platform2.OS === "web" && state.scrollLength > 0 && lastScrollDelta > state.scrollLength);
  const maxVisibleArea = scrollBottomBuffered + 1e3;
  !doMVCP || dataChanged || state.scrollAdjustHandler.getAdjust() !== 0 || ((_b = peek$(ctx, "scrollAdjustPending")) != null ? _b : 0) !== 0;
  const alignItemsPaddingTop = peek$(ctx, "alignItemsPaddingTop") || 0;
  let currentRowTop = alignItemsPaddingTop;
  let column = 1;
  let maxSizeInRow = 0;
  if (dataChanged) {
    columnSpans.clear();
  }
  if (startIndex > 0) {
    if (hasColumns) {
      const { startIndex: processedStartIndex, currentRowTop: initialRowTop } = prepareColumnStartState(
        ctx,
        startIndex);
      startIndex = processedStartIndex;
      currentRowTop = initialRowTop;
    } else if (startIndex < dataLength) {
      const prevIndex = startIndex - 1;
      const prevId = getId(state, prevIndex);
      const prevPosition = (_c = positions.get(prevId)) != null ? _c : 0;
      const prevSize = (_d = sizesKnown.get(prevId)) != null ? _d : getItemSize(ctx, prevId, prevIndex, data[prevIndex]);
      currentRowTop = prevPosition + prevSize;
    }
  }
  const needsIndexByKey = dataChanged || indexByKey.size === 0;
  let didBreakEarly = false;
  let breakAt;
  for (let i = startIndex; i < dataLength; i++) {
    if (shouldOptimize && breakAt !== void 0 && i > breakAt) {
      didBreakEarly = true;
      break;
    }
    if (shouldOptimize && breakAt === void 0 && !scrollingTo && !dataChanged && currentRowTop > maxVisibleArea) {
      const itemsPerRow = hasColumns ? numColumns : 1;
      breakAt = i + itemsPerRow + 10;
    }
    const id = (_e = idCache[i]) != null ? _e : getId(state, i);
    let span = 1;
    if (hasColumns && overrideItemLayout && layoutConfig) {
      layoutConfig.span = 1;
      overrideItemLayout(layoutConfig, data[i], i, numColumns, extraData);
      const requestedSpan = layoutConfig.span;
      if (requestedSpan !== void 0 && Number.isFinite(requestedSpan)) {
        span = Math.max(1, Math.min(numColumns, Math.round(requestedSpan)));
      }
    }
    if (hasColumns && column + span - 1 > numColumns) {
      currentRowTop += maxSizeInRow;
      column = 1;
      maxSizeInRow = 0;
    }
    const size = (_f = sizesKnown.get(id)) != null ? _f : getItemSize(ctx, id, i, data[i]);
    if (IS_DEV && needsIndexByKey) {
      if (indexByKeyForChecking.has(id)) {
        console.error(
          `[legend-list] Error: Detected overlapping key (${id}) which causes missing items and gaps and other terrrible things. Check that keyExtractor returns unique values.`
        );
      }
      indexByKeyForChecking.set(id, i);
    }
    if (currentRowTop !== positions.get(id)) {
      positions.set(id, currentRowTop);
      notifyPosition$(ctx, id, currentRowTop);
    }
    if (needsIndexByKey) {
      indexByKey.set(id, i);
    }
    columns.set(id, column);
    columnSpans.set(id, span);
    if (hasColumns) {
      if (size > maxSizeInRow) {
        maxSizeInRow = size;
      }
      column += span;
      if (column > numColumns) {
        currentRowTop += maxSizeInRow;
        column = 1;
        maxSizeInRow = 0;
      }
    } else {
      currentRowTop += size;
    }
  }
  if (!didBreakEarly) {
    updateTotalSize(ctx);
  }
  if (snapToIndices) {
    updateSnapToOffsets(ctx);
  }
}

// src/core/viewability.ts
function ensureViewabilityState(ctx, configId) {
  let map = ctx.mapViewabilityConfigStates;
  if (!map) {
    map = /* @__PURE__ */ new Map();
    ctx.mapViewabilityConfigStates = map;
  }
  let state = map.get(configId);
  if (!state) {
    state = { end: -1, previousEnd: -1, previousStart: -1, start: -1, viewableItems: [] };
    map.set(configId, state);
  }
  return state;
}
function setupViewability(props) {
  let { viewabilityConfig, viewabilityConfigCallbackPairs, onViewableItemsChanged } = props;
  if (viewabilityConfig || onViewableItemsChanged) {
    viewabilityConfigCallbackPairs = [
      ...viewabilityConfigCallbackPairs || [],
      {
        onViewableItemsChanged,
        viewabilityConfig: viewabilityConfig || {
          viewAreaCoveragePercentThreshold: 0
        }
      }
    ];
  }
  return viewabilityConfigCallbackPairs;
}
function updateViewableItems(state, ctx, viewabilityConfigCallbackPairs, scrollSize, start, end) {
  const {
    timeouts,
    props: { data }
  } = state;
  for (const viewabilityConfigCallbackPair of viewabilityConfigCallbackPairs) {
    const viewabilityState = ensureViewabilityState(ctx, viewabilityConfigCallbackPair.viewabilityConfig.id);
    viewabilityState.start = start;
    viewabilityState.end = end;
    if (viewabilityConfigCallbackPair.viewabilityConfig.minimumViewTime) {
      const timer = setTimeout(() => {
        timeouts.delete(timer);
        updateViewableItemsWithConfig(data, viewabilityConfigCallbackPair, state, ctx, scrollSize);
      }, viewabilityConfigCallbackPair.viewabilityConfig.minimumViewTime);
      timeouts.add(timer);
    } else {
      updateViewableItemsWithConfig(data, viewabilityConfigCallbackPair, state, ctx, scrollSize);
    }
  }
}
function updateViewableItemsWithConfig(data, viewabilityConfigCallbackPair, state, ctx, scrollSize) {
  const { viewabilityConfig, onViewableItemsChanged } = viewabilityConfigCallbackPair;
  const configId = viewabilityConfig.id;
  const viewabilityState = ensureViewabilityState(ctx, configId);
  const { viewableItems: previousViewableItems, start, end } = viewabilityState;
  const viewabilityTokens = /* @__PURE__ */ new Map();
  for (const [containerId, value] of ctx.mapViewabilityAmountValues) {
    viewabilityTokens.set(
      containerId,
      computeViewability(
        state,
        ctx,
        viewabilityConfig,
        containerId,
        value.key,
        scrollSize,
        value.item,
        value.index
      )
    );
  }
  const changed = [];
  if (previousViewableItems) {
    for (const viewToken of previousViewableItems) {
      const containerId = findContainerId(ctx, viewToken.key);
      if (!checkIsViewable(
        state,
        ctx,
        viewabilityConfig,
        containerId,
        viewToken.key,
        scrollSize,
        viewToken.item,
        viewToken.index
      )) {
        viewToken.isViewable = false;
        changed.push(viewToken);
      }
    }
  }
  const viewableItems = [];
  for (let i = start; i <= end; i++) {
    const item = data[i];
    if (item) {
      const key = getId(state, i);
      const containerId = findContainerId(ctx, key);
      if (checkIsViewable(state, ctx, viewabilityConfig, containerId, key, scrollSize, item, i)) {
        const viewToken = {
          containerId,
          index: i,
          isViewable: true,
          item,
          key
        };
        viewableItems.push(viewToken);
        if (!(previousViewableItems == null ? void 0 : previousViewableItems.find((v) => v.key === viewToken.key))) {
          changed.push(viewToken);
        }
      }
    }
  }
  Object.assign(viewabilityState, {
    previousEnd: end,
    previousStart: start,
    viewableItems
  });
  if (changed.length > 0) {
    viewabilityState.viewableItems = viewableItems;
    for (let i = 0; i < changed.length; i++) {
      const change = changed[i];
      maybeUpdateViewabilityCallback(ctx, configId, change.containerId, change);
    }
    if (onViewableItemsChanged) {
      onViewableItemsChanged({ changed, viewableItems });
    }
  }
  for (const [containerId, value] of ctx.mapViewabilityAmountValues) {
    if (value.sizeVisible < 0) {
      ctx.mapViewabilityAmountValues.delete(containerId);
    }
  }
}
function shallowEqual(prev, next) {
  if (!prev) return false;
  const keys = Object.keys(next);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    if (prev[k] !== next[k]) return false;
  }
  return true;
}
function computeViewability(state, ctx, viewabilityConfig, containerId, key, scrollSize, item, index) {
  const { sizes, positions, scroll: scrollState } = state;
  const topPad = (peek$(ctx, "stylePaddingTop") || 0) + (peek$(ctx, "headerSize") || 0);
  const { itemVisiblePercentThreshold, viewAreaCoveragePercentThreshold } = viewabilityConfig;
  const viewAreaMode = viewAreaCoveragePercentThreshold != null;
  const viewablePercentThreshold = viewAreaMode ? viewAreaCoveragePercentThreshold : itemVisiblePercentThreshold;
  const scroll = scrollState - topPad;
  const top = positions.get(key) - scroll;
  const size = sizes.get(key) || 0;
  const bottom = top + size;
  const isEntirelyVisible = top >= 0 && bottom <= scrollSize && bottom > top;
  const sizeVisible = isEntirelyVisible ? size : Math.min(bottom, scrollSize) - Math.max(top, 0);
  const percentVisible = size ? isEntirelyVisible ? 100 : 100 * (sizeVisible / size) : 0;
  const percentOfScroller = size ? 100 * (sizeVisible / scrollSize) : 0;
  const percent = isEntirelyVisible ? 100 : viewAreaMode ? percentOfScroller : percentVisible;
  const isViewable = percent >= viewablePercentThreshold;
  const value = {
    containerId,
    index,
    isViewable,
    item,
    key,
    percentOfScroller,
    percentVisible,
    scrollSize,
    size,
    sizeVisible
  };
  const prev = ctx.mapViewabilityAmountValues.get(containerId);
  if (!shallowEqual(prev, value)) {
    ctx.mapViewabilityAmountValues.set(containerId, value);
    const cb = ctx.mapViewabilityAmountCallbacks.get(containerId);
    if (cb) {
      cb(value);
    }
  }
  return value;
}
function checkIsViewable(state, ctx, viewabilityConfig, containerId, key, scrollSize, item, index) {
  let value = ctx.mapViewabilityAmountValues.get(containerId);
  if (!value || value.key !== key) {
    value = computeViewability(state, ctx, viewabilityConfig, containerId, key, scrollSize, item, index);
  }
  return value.isViewable;
}
function maybeUpdateViewabilityCallback(ctx, configId, containerId, viewToken) {
  const key = containerId + configId;
  ctx.mapViewabilityValues.set(key, viewToken);
  const cb = ctx.mapViewabilityCallbacks.get(key);
  cb == null ? void 0 : cb(viewToken);
}

// src/utils/checkAllSizesKnown.ts
function isNullOrUndefined2(value) {
  return value === null || value === void 0;
}
function checkAllSizesKnown(state) {
  const { startBuffered, endBuffered, sizesKnown } = state;
  if (!isNullOrUndefined2(endBuffered) && !isNullOrUndefined2(startBuffered) && startBuffered >= 0 && endBuffered >= 0) {
    let areAllKnown = true;
    for (let i = startBuffered; areAllKnown && i <= endBuffered; i++) {
      const key = getId(state, i);
      areAllKnown && (areAllKnown = sizesKnown.has(key));
    }
    return areAllKnown;
  }
  return false;
}

// src/utils/findAvailableContainers.ts
function findAvailableContainers(ctx, numNeeded, startBuffered, endBuffered, pendingRemoval, requiredItemTypes, needNewContainers) {
  const numContainers = peek$(ctx, "numContainers");
  const state = ctx.state;
  const { stickyContainerPool, containerItemTypes } = state;
  const result = [];
  const availableContainers = [];
  const pendingRemovalSet = new Set(pendingRemoval);
  let pendingRemovalChanged = false;
  const stickyIndicesSet = state.props.stickyIndicesSet;
  const stickyItemIndices = (needNewContainers == null ? void 0 : needNewContainers.filter((index) => stickyIndicesSet.has(index))) || [];
  const canReuseContainer = (containerIndex, requiredType) => {
    if (!requiredType) return true;
    const existingType = containerItemTypes.get(containerIndex);
    if (!existingType) return true;
    return existingType === requiredType;
  };
  const neededTypes = requiredItemTypes ? [...requiredItemTypes] : [];
  let typeIndex = 0;
  for (let i = 0; i < stickyItemIndices.length; i++) {
    const requiredType = neededTypes[typeIndex];
    let foundContainer = false;
    for (const containerIndex of stickyContainerPool) {
      const key = peek$(ctx, `containerItemKey${containerIndex}`);
      const isPendingRemoval = pendingRemovalSet.has(containerIndex);
      if ((key === void 0 || isPendingRemoval) && canReuseContainer(containerIndex, requiredType) && !result.includes(containerIndex)) {
        result.push(containerIndex);
        if (isPendingRemoval && pendingRemovalSet.delete(containerIndex)) {
          pendingRemovalChanged = true;
        }
        foundContainer = true;
        if (requiredItemTypes) typeIndex++;
        break;
      }
    }
    if (!foundContainer) {
      const newContainerIndex = numContainers + result.filter((index) => index >= numContainers).length;
      result.push(newContainerIndex);
      stickyContainerPool.add(newContainerIndex);
      if (requiredItemTypes) typeIndex++;
    }
  }
  for (let u = 0; u < numContainers && result.length < numNeeded; u++) {
    if (stickyContainerPool.has(u)) {
      continue;
    }
    const key = peek$(ctx, `containerItemKey${u}`);
    const requiredType = neededTypes[typeIndex];
    const isPending = key !== void 0 && pendingRemovalSet.has(u);
    const canUse = key === void 0 || isPending && canReuseContainer(u, requiredType);
    if (canUse) {
      if (isPending) {
        pendingRemovalSet.delete(u);
        pendingRemovalChanged = true;
      }
      result.push(u);
      if (requiredItemTypes) {
        typeIndex++;
      }
    }
  }
  for (let u = 0; u < numContainers && result.length < numNeeded; u++) {
    if (stickyContainerPool.has(u)) {
      continue;
    }
    const key = peek$(ctx, `containerItemKey${u}`);
    if (key === void 0) continue;
    const index = state.indexByKey.get(key);
    const isOutOfView = index < startBuffered || index > endBuffered;
    if (isOutOfView) {
      const distance = index < startBuffered ? startBuffered - index : index - endBuffered;
      if (!requiredItemTypes || typeIndex < neededTypes.length && canReuseContainer(u, neededTypes[typeIndex])) {
        availableContainers.push({ distance, index: u });
      }
    }
  }
  const remaining = numNeeded - result.length;
  if (remaining > 0) {
    if (availableContainers.length > 0) {
      if (availableContainers.length > remaining) {
        availableContainers.sort(comparatorByDistance);
        availableContainers.length = remaining;
      }
      for (const container of availableContainers) {
        result.push(container.index);
        if (requiredItemTypes) {
          typeIndex++;
        }
      }
    }
    const stillNeeded = numNeeded - result.length;
    if (stillNeeded > 0) {
      for (let i = 0; i < stillNeeded; i++) {
        result.push(numContainers + i);
      }
      if (IS_DEV && numContainers + stillNeeded > peek$(ctx, "numContainersPooled")) {
        console.warn(
          "[legend-list] No unused container available, so creating one on demand. This can be a minor performance issue and is likely caused by the estimatedItemSize being too large. Consider decreasing estimatedItemSize or increasing initialContainerPoolRatio.",
          {
            debugInfo: {
              numContainers,
              numContainersPooled: peek$(ctx, "numContainersPooled"),
              numNeeded,
              stillNeeded
            }
          }
        );
      }
    }
  }
  if (pendingRemovalChanged) {
    pendingRemoval.length = 0;
    for (const value of pendingRemovalSet) {
      pendingRemoval.push(value);
    }
  }
  return result.sort(comparatorDefault);
}
function comparatorByDistance(a, b) {
  return b.distance - a.distance;
}

// src/core/scrollToIndex.ts
function scrollToIndex(ctx, { index, viewOffset = 0, animated = true, viewPosition, onSettled, isScrollToEnd }) {
  const state = ctx.state;
  const { data } = state.props;
  if (index >= data.length) {
    index = data.length - 1;
  } else if (index < 0) {
    index = 0;
  }
  const firstIndexOffset = calculateOffsetForIndex(ctx, index);
  const isLast = index === data.length - 1;
  if (isLast && viewPosition === void 0) {
    viewPosition = 1;
  }
  state.scrollForNextCalculateItemsInView = void 0;
  const targetId = getId(state, index);
  const itemSize = getItemSize(ctx, targetId, index, state.props.data[index]);
  const wrappedOnSettled = onSettled ? () => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        onSettled();
      });
    });
  } : void 0;
  scrollTo(ctx, {
    animated,
    index,
    isInitialScroll: state.initialScroll !== void 0 && state.initialScroll.index === index,
    isScrollToEnd,
    itemKey: targetId,
    itemSize,
    offset: firstIndexOffset,
    onSettled: wrappedOnSettled,
    viewOffset,
    viewPosition: viewPosition != null ? viewPosition : 0,
    forceScroll: true
  });
}

// src/utils/setDidLayout.ts
function setDidLayout(ctx) {
  const state = ctx.state;
  const {
    loadStartTime,
    initialScroll,
    props: { onLoad }
  } = state;
  state.queuedInitialLayout = true;
  checkAtBottom(ctx);
  const setIt = () => {
    setInitialRenderState(ctx, { didLayout: true });
    if (onLoad) {
      onLoad({ elapsedTimeInMs: Date.now() - loadStartTime });
    }
  };
  if ((initialScroll == null ? void 0 : initialScroll.index) !== void 0) {
    const target = initialScroll;
    const runScroll = () => scrollToIndex(ctx, { ...target, animated: false });
    runScroll();
    requestAnimationFrame(runScroll);
  }
  setIt();
}

// src/core/calculateItemsInView.ts
function findCurrentStickyIndex(stickyArray, scroll, state) {
  var _a3;
  const idCache = state.idCache;
  const positions = state.positions;
  for (let i = stickyArray.length - 1; i >= 0; i--) {
    const stickyIndex = stickyArray[i];
    const stickyId = (_a3 = idCache[stickyIndex]) != null ? _a3 : getId(state, stickyIndex);
    const stickyPos = stickyId ? positions.get(stickyId) : void 0;
    if (stickyPos !== void 0 && scroll >= stickyPos) {
      return i;
    }
  }
  return -1;
}
function getActiveStickyIndices(ctx, stickyHeaderIndices) {
  const state = ctx.state;
  return new Set(
    Array.from(state.stickyContainerPool).map((i) => peek$(ctx, `containerItemKey${i}`)).map((key) => key ? state.indexByKey.get(key) : void 0).filter((idx) => idx !== void 0 && stickyHeaderIndices.has(idx))
  );
}
function handleStickyActivation(ctx, stickyHeaderIndices, stickyArray, currentStickyIdx, needNewContainers, needNewContainersSet, startBuffered, endBuffered) {
  var _a3;
  const state = ctx.state;
  const activeIndices = getActiveStickyIndices(ctx, stickyHeaderIndices);
  set$(ctx, "activeStickyIndex", currentStickyIdx >= 0 ? stickyArray[currentStickyIdx] : -1);
  for (let offset = 0; offset <= 1; offset++) {
    const idx = currentStickyIdx - offset;
    if (idx < 0 || activeIndices.has(stickyArray[idx])) continue;
    const stickyIndex = stickyArray[idx];
    const stickyId = (_a3 = state.idCache[stickyIndex]) != null ? _a3 : getId(state, stickyIndex);
    if (stickyId && !state.containerItemKeys.has(stickyId) && (stickyIndex < startBuffered || stickyIndex > endBuffered) && !needNewContainersSet.has(stickyIndex)) {
      needNewContainersSet.add(stickyIndex);
      needNewContainers.push(stickyIndex);
    }
  }
}
function handleStickyRecycling(ctx, stickyArray, scroll, scrollBuffer, currentStickyIdx, pendingRemoval, alwaysRenderIndicesSet) {
  var _a3, _b, _c;
  const state = ctx.state;
  for (const containerIndex of state.stickyContainerPool) {
    const itemKey = peek$(ctx, `containerItemKey${containerIndex}`);
    const itemIndex = itemKey ? state.indexByKey.get(itemKey) : void 0;
    if (itemIndex === void 0) continue;
    if (alwaysRenderIndicesSet.has(itemIndex)) continue;
    const arrayIdx = stickyArray.indexOf(itemIndex);
    if (arrayIdx === -1) {
      state.stickyContainerPool.delete(containerIndex);
      set$(ctx, `containerSticky${containerIndex}`, false);
      continue;
    }
    const isRecentSticky = arrayIdx >= currentStickyIdx - 1 && arrayIdx <= currentStickyIdx + 1;
    if (isRecentSticky) continue;
    const nextIndex = stickyArray[arrayIdx + 1];
    let shouldRecycle = false;
    if (nextIndex) {
      const nextId = (_a3 = state.idCache[nextIndex]) != null ? _a3 : getId(state, nextIndex);
      const nextPos = nextId ? state.positions.get(nextId) : void 0;
      shouldRecycle = nextPos !== void 0 && scroll > nextPos + scrollBuffer * 2;
    } else {
      const currentId = (_b = state.idCache[itemIndex]) != null ? _b : getId(state, itemIndex);
      if (currentId) {
        const currentPos = state.positions.get(currentId);
        const currentSize = (_c = state.sizes.get(currentId)) != null ? _c : getItemSize(ctx, currentId, itemIndex, state.props.data[itemIndex]);
        shouldRecycle = currentPos !== void 0 && scroll > currentPos + currentSize + scrollBuffer * 3;
      }
    }
    if (shouldRecycle) {
      pendingRemoval.push(containerIndex);
    }
  }
}
function getMvcpHandler(ctx, mode, dataChanged) {
  switch (mode) {
    case "none" /* NONE */:
      return void 0;
    case "regular" /* REGULAR */:
      return prepareMVCP(ctx, dataChanged);
    case "initialization" /* INITIALIZATION */:
      return prepareInitializationMVCP(ctx);
    default:
      return void 0;
  }
}
function calculateItemsInView(ctx, params = {}) {
  var _a3;
  const state = ctx.state;
  reactNative.unstable_batchedUpdates(() => {
    var _a4, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m;
    const {
      columns,
      columnSpans,
      containerItemKeys,
      enableScrollForNextCalculateItemsInView,
      idCache,
      indexByKey,
      initialScroll,
      minIndexSizeChanged,
      positions,
      props: {
        alwaysRenderIndicesArr,
        alwaysRenderIndicesSet,
        getItemType,
        itemsAreEqual,
        keyExtractor,
        onStickyHeaderChange,
        scrollBuffer
      },
      scrollForNextCalculateItemsInView,
      scrollLength,
      sizes,
      startBufferedId: startBufferedIdOrig,
      viewabilityConfigCallbackPairs
    } = state;
    const { data } = state.props;
    const stickyIndicesArr = state.props.stickyIndicesArr || [];
    const stickyIndicesSet = state.props.stickyIndicesSet || /* @__PURE__ */ new Set();
    const alwaysRenderArr = alwaysRenderIndicesArr || [];
    const alwaysRenderSet = alwaysRenderIndicesSet || /* @__PURE__ */ new Set();
    const prevNumContainers = peek$(ctx, "numContainers");
    if (!data || scrollLength === 0 || !prevNumContainers) {
      if (!IsNewArchitecture && state.initialAnchor) {
        ensureInitialAnchor(ctx);
      }
      return;
    }
    const totalSize = getContentSize(ctx);
    const topPad = peek$(ctx, "stylePaddingTop") + peek$(ctx, "headerSize");
    const numColumns = peek$(ctx, "numColumns");
    const { dataChanged, doMVCP, forceFullItemPositions } = params;
    const speed = getScrollVelocity(state);
    const scrollExtra = 0;
    const { queuedInitialLayout } = state;
    let { scroll: scrollState } = state;
    if (!queuedInitialLayout && initialScroll) {
      const updatedOffset = calculateOffsetWithOffsetPosition(
        ctx,
        calculateOffsetForIndex(ctx, initialScroll.index),
        initialScroll
      );
      scrollState = updatedOffset;
    }
    const scrollAdjustPending = (_a4 = peek$(ctx, "scrollAdjustPending")) != null ? _a4 : 0;
    const scrollAdjustPad = scrollAdjustPending - topPad;
    let scroll = Math.round(scrollState + scrollExtra + scrollAdjustPad);
    if (scroll + scrollLength > totalSize) {
      scroll = Math.max(0, totalSize - scrollLength);
    }
    if (ENABLE_DEBUG_VIEW) {
      set$(ctx, "debugRawScroll", scrollState);
      set$(ctx, "debugComputedScroll", scroll);
    }
    const previousStickyIndex = peek$(ctx, "activeStickyIndex");
    const currentStickyIdx = stickyIndicesArr.length > 0 ? findCurrentStickyIndex(stickyIndicesArr, scroll, state) : -1;
    const nextActiveStickyIndex = currentStickyIdx >= 0 ? stickyIndicesArr[currentStickyIdx] : -1;
    if (currentStickyIdx >= 0 || previousStickyIndex >= 0) {
      set$(ctx, "activeStickyIndex", nextActiveStickyIndex);
    }
    let scrollBufferTop = scrollBuffer;
    let scrollBufferBottom = scrollBuffer;
    if (speed > 0 || speed === 0 && scroll < Math.max(50, scrollBuffer)) {
      scrollBufferTop = scrollBuffer * 0.5;
      scrollBufferBottom = scrollBuffer * 1.5;
    } else {
      scrollBufferTop = scrollBuffer * 1.5;
      scrollBufferBottom = scrollBuffer * 0.5;
    }
    if (state.isInitializing) {
      scrollBufferTop *= 4;
      scrollBufferBottom *= 4;
    }
    const scrollTopBuffered = scroll - scrollBufferTop;
    const scrollBottom = scroll + scrollLength + (scroll < 0 ? -scroll : 0);
    const scrollBottomBuffered = scrollBottom + scrollBufferBottom;
    if (!dataChanged && !forceFullItemPositions && scrollForNextCalculateItemsInView) {
      const { top, bottom } = scrollForNextCalculateItemsInView;
      if (top === null && bottom === null) {
        state.scrollForNextCalculateItemsInView = void 0;
      } else if ((top === null || scrollTopBuffered > top) && (bottom === null || scrollBottomBuffered < bottom)) {
        if (!IsNewArchitecture && state.initialAnchor) {
          ensureInitialAnchor(ctx);
        }
        return;
      }
    }
    const mvcpMode = peek$(ctx, "mvcpMode");
    const checkMVCP = doMVCP ? getMvcpHandler(ctx, mvcpMode, dataChanged) : void 0;
    if (dataChanged) {
      indexByKey.clear();
      idCache.length = 0;
      positions.clear();
    }
    const startIndex = forceFullItemPositions || dataChanged ? 0 : (_b = minIndexSizeChanged != null ? minIndexSizeChanged : state.startBuffered) != null ? _b : 0;
    updateItemPositions(ctx, dataChanged, {
      doMVCP,
      forceFullUpdate: !!forceFullItemPositions,
      scrollBottomBuffered,
      startIndex
    });
    if (minIndexSizeChanged !== void 0) {
      state.minIndexSizeChanged = void 0;
    }
    checkMVCP == null ? void 0 : checkMVCP();
    let startNoBuffer = null;
    let startBuffered = null;
    let startBufferedId = null;
    let endNoBuffer = null;
    let endBuffered = null;
    let loopStart = !dataChanged && !forceFullItemPositions && startBufferedIdOrig ? indexByKey.get(startBufferedIdOrig) || 0 : 0;
    for (let i = loopStart; i >= 0; i--) {
      const id = (_c = idCache[i]) != null ? _c : getId(state, i);
      const top = positions.get(id);
      const size = (_d = sizes.get(id)) != null ? _d : getItemSize(ctx, id, i, data[i]);
      const bottom = top + size;
      if (bottom > scroll - scrollBufferTop) {
        loopStart = i;
      } else {
        break;
      }
    }
    if (numColumns > 1) {
      while (loopStart > 0) {
        const loopId = (_e = idCache[loopStart]) != null ? _e : getId(state, loopStart);
        const loopColumn = columns.get(loopId);
        if (loopColumn === 1 || loopColumn === void 0) {
          break;
        }
        loopStart -= 1;
      }
    }
    let foundEnd = false;
    let nextTop;
    let nextBottom;
    let maxIndexRendered = 0;
    for (let i = 0; i < prevNumContainers; i++) {
      const key = peek$(ctx, `containerItemKey${i}`);
      if (key !== void 0) {
        const index = indexByKey.get(key);
        maxIndexRendered = Math.max(maxIndexRendered, index);
      }
    }
    let firstFullyOnScreenIndex;
    const dataLength = data.length;
    for (let i = Math.max(0, loopStart); i < dataLength && (!foundEnd || i <= maxIndexRendered); i++) {
      const id = (_f = idCache[i]) != null ? _f : getId(state, i);
      const size = (_g = sizes.get(id)) != null ? _g : getItemSize(ctx, id, i, data[i]);
      const top = positions.get(id);
      if (!foundEnd) {
        if (startNoBuffer === null && top + size > scroll) {
          startNoBuffer = i;
        }
        if (firstFullyOnScreenIndex === void 0 && top >= scroll - 10) {
          firstFullyOnScreenIndex = i;
        }
        if (startBuffered === null && top + size > scrollTopBuffered) {
          startBuffered = i;
          startBufferedId = id;
          if (scrollTopBuffered < 0) {
            nextTop = null;
          } else {
            nextTop = top;
          }
        }
        if (startNoBuffer !== null) {
          if (top <= scrollBottom) {
            endNoBuffer = i;
          }
          if (top <= scrollBottomBuffered) {
            endBuffered = i;
            if (scrollBottomBuffered > totalSize) {
              nextBottom = null;
            } else {
              nextBottom = top + size;
            }
          } else {
            foundEnd = true;
          }
        }
      }
    }
    const idsInView = [];
    for (let i = firstFullyOnScreenIndex; i <= endNoBuffer; i++) {
      const id = (_h = idCache[i]) != null ? _h : getId(state, i);
      idsInView.push(id);
    }
    Object.assign(state, {
      endBuffered,
      endNoBuffer,
      firstFullyOnScreenIndex,
      idsInView,
      startBuffered,
      startBufferedId,
      startNoBuffer
    });
    if (enableScrollForNextCalculateItemsInView && nextTop !== void 0 && nextBottom !== void 0) {
      state.scrollForNextCalculateItemsInView = isNullOrUndefined(nextTop) && isNullOrUndefined(nextBottom) ? void 0 : {
        bottom: nextBottom,
        top: nextTop
      };
    }
    let numContainers = prevNumContainers;
    const pendingRemoval = [];
    if (dataChanged) {
      for (let i = 0; i < numContainers; i++) {
        const itemKey = peek$(ctx, `containerItemKey${i}`);
        if (!keyExtractor || itemKey && indexByKey.get(itemKey) === void 0) {
          pendingRemoval.push(i);
        }
      }
    }
    if (startBuffered !== null && endBuffered !== null) {
      const needNewContainers = [];
      const needNewContainersSet = /* @__PURE__ */ new Set();
      for (let i = startBuffered; i <= endBuffered; i++) {
        const id = (_i = idCache[i]) != null ? _i : getId(state, i);
        if (!containerItemKeys.has(id)) {
          needNewContainersSet.add(i);
          needNewContainers.push(i);
        }
      }
      if (alwaysRenderArr.length > 0) {
        for (const index of alwaysRenderArr) {
          if (index < 0 || index >= dataLength) continue;
          const id = (_j = idCache[index]) != null ? _j : getId(state, index);
          if (id && !containerItemKeys.has(id) && !needNewContainersSet.has(index)) {
            needNewContainersSet.add(index);
            needNewContainers.push(index);
          }
        }
      }
      if (stickyIndicesArr.length > 0) {
        handleStickyActivation(
          ctx,
          stickyIndicesSet,
          stickyIndicesArr,
          currentStickyIdx,
          needNewContainers,
          needNewContainersSet,
          startBuffered,
          endBuffered
        );
      } else if (previousStickyIndex !== -1) {
        set$(ctx, "activeStickyIndex", -1);
      }
      if (needNewContainers.length > 0) {
        const requiredItemTypes = getItemType ? needNewContainers.map((i) => {
          const itemType = getItemType(data[i], i);
          return itemType !== void 0 ? String(itemType) : "";
        }) : void 0;
        const availableContainers = findAvailableContainers(
          ctx,
          needNewContainers.length,
          startBuffered,
          endBuffered,
          pendingRemoval,
          requiredItemTypes,
          needNewContainers
        );
        for (let idx = 0; idx < needNewContainers.length; idx++) {
          const i = needNewContainers[idx];
          const containerIndex = availableContainers[idx];
          const id = (_k = idCache[i]) != null ? _k : getId(state, i);
          const oldKey = peek$(ctx, `containerItemKey${containerIndex}`);
          if (oldKey && oldKey !== id) {
            containerItemKeys.delete(oldKey);
          }
          set$(ctx, `containerItemKey${containerIndex}`, id);
          set$(ctx, `containerItemData${containerIndex}`, data[i]);
          if (requiredItemTypes) {
            state.containerItemTypes.set(containerIndex, requiredItemTypes[idx]);
          }
          containerItemKeys.set(id, containerIndex);
          const containerSticky = `containerSticky${containerIndex}`;
          const isSticky = stickyIndicesSet.has(i);
          const isAlwaysRender = alwaysRenderSet.has(i);
          if (isSticky) {
            set$(ctx, containerSticky, true);
            state.stickyContainerPool.add(containerIndex);
          } else {
            if (peek$(ctx, containerSticky)) {
              set$(ctx, containerSticky, false);
            }
            if (isAlwaysRender) {
              state.stickyContainerPool.add(containerIndex);
            } else if (state.stickyContainerPool.has(containerIndex)) {
              state.stickyContainerPool.delete(containerIndex);
            }
          }
          if (containerIndex >= numContainers) {
            numContainers = containerIndex + 1;
          }
        }
        if (numContainers !== prevNumContainers) {
          set$(ctx, "numContainers", numContainers);
          if (numContainers > peek$(ctx, "numContainersPooled")) {
            set$(ctx, "numContainersPooled", Math.ceil(numContainers * 1.5));
          }
        }
      }
      if (alwaysRenderArr.length > 0) {
        for (const index of alwaysRenderArr) {
          if (index < 0 || index >= dataLength) continue;
          const id = (_l = idCache[index]) != null ? _l : getId(state, index);
          const containerIndex = containerItemKeys.get(id);
          if (containerIndex !== void 0) {
            state.stickyContainerPool.add(containerIndex);
          }
        }
      }
    }
    if (state.stickyContainerPool.size > 0) {
      handleStickyRecycling(
        ctx,
        stickyIndicesArr,
        scroll,
        scrollBuffer,
        currentStickyIdx,
        pendingRemoval,
        alwaysRenderSet
      );
    }
    let didChangePositions = false;
    for (let i = 0; i < numContainers; i++) {
      const itemKey = peek$(ctx, `containerItemKey${i}`);
      if (pendingRemoval.includes(i)) {
        if (itemKey !== void 0) {
          containerItemKeys.delete(itemKey);
        }
        state.containerItemTypes.delete(i);
        if (state.stickyContainerPool.has(i)) {
          set$(ctx, `containerSticky${i}`, false);
          state.stickyContainerPool.delete(i);
        }
        set$(ctx, `containerItemKey${i}`, void 0);
        set$(ctx, `containerItemData${i}`, void 0);
        set$(ctx, `containerPosition${i}`, POSITION_OUT_OF_VIEW);
        set$(ctx, `containerColumn${i}`, -1);
        set$(ctx, `containerSpan${i}`, 1);
      } else {
        const itemIndex = indexByKey.get(itemKey);
        const item = data[itemIndex];
        if (item !== void 0) {
          const id = (_m = idCache[itemIndex]) != null ? _m : getId(state, itemIndex);
          const positionValue = positions.get(id);
          if (positionValue === void 0) {
            set$(ctx, `containerPosition${i}`, POSITION_OUT_OF_VIEW);
          } else {
            const shouldApplyAdjust = queuedInitialLayout || !initialScroll;
            const position = (positionValue || 0) - (shouldApplyAdjust ? scrollAdjustPending : 0);
            const column = columns.get(id) || 1;
            const span = columnSpans.get(id) || 1;
            const prevPos = peek$(ctx, `containerPosition${i}`);
            const prevColumn = peek$(ctx, `containerColumn${i}`);
            const prevSpan = peek$(ctx, `containerSpan${i}`);
            const prevData = peek$(ctx, `containerItemData${i}`);
            if (position !== prevPos) {
              set$(ctx, `containerPosition${i}`, position);
              didChangePositions = true;
            }
            if (column >= 0 && column !== prevColumn) {
              set$(ctx, `containerColumn${i}`, column);
            }
            if (span !== prevSpan) {
              set$(ctx, `containerSpan${i}`, span);
            }
            if (prevData !== item && (itemsAreEqual ? !itemsAreEqual(prevData, item, itemIndex, data) : true)) {
              set$(ctx, `containerItemData${i}`, item);
            }
          }
        }
      }
    }
    if (Platform2.OS === "web" && didChangePositions) {
      set$(ctx, "lastPositionUpdate", Date.now());
    }
    if (!queuedInitialLayout && endBuffered !== null) {
      if (checkAllSizesKnown(state)) {
        setDidLayout(ctx);
      }
    }
    if (viewabilityConfigCallbackPairs) {
      updateViewableItems(state, ctx, viewabilityConfigCallbackPairs, scrollLength, startNoBuffer, endNoBuffer);
    }
    if (onStickyHeaderChange && stickyIndicesArr.length > 0 && nextActiveStickyIndex !== void 0 && nextActiveStickyIndex !== previousStickyIndex) {
      const item = data[nextActiveStickyIndex];
      if (item !== void 0) {
        onStickyHeaderChange({ index: nextActiveStickyIndex, item });
      }
    }
  });
  if (!IsNewArchitecture && state.initialAnchor) {
    ensureInitialAnchor(ctx);
  }
  if (state.isInitializing && ctx.initializationManager.getCurrentPhase() === "STABILIZING" /* STABILIZING */) {
    (_a3 = ctx.initializationManager) == null ? void 0 : _a3.checkStabilization();
  }
}

// src/core/checkActualChange.ts
function checkActualChange(state, dataProp, previousData) {
  if (!previousData || !dataProp || dataProp.length !== previousData.length) {
    return true;
  }
  const {
    idCache,
    props: { keyExtractor }
  } = state;
  for (let i = 0; i < dataProp.length; i++) {
    if (dataProp[i] !== previousData[i]) {
      return true;
    }
    if (keyExtractor ? idCache[i] !== keyExtractor(previousData[i], i) : dataProp[i] !== previousData[i]) {
      return true;
    }
  }
  return false;
}

// src/core/doMaintainScrollAtEnd.ts
function doMaintainScrollAtEnd(ctx, animated) {
  const state = ctx.state;
  const {
    didContainersLayout,
    isAtEnd,
    refScroller,
    props: { maintainScrollAtEnd }
  } = state;
  if (state.maintainingScrollAtEnd) {
    return false;
  }
  if (isAtEnd && maintainScrollAtEnd && didContainersLayout) {
    state.maintainingScrollAtEnd = true;
    const contentSize = getContentSize(ctx);
    if (contentSize < state.scrollLength) {
      state.scroll = 0;
    }
    requestAnimationFrame(() => {
      var _a3;
      (_a3 = refScroller.current) == null ? void 0 : _a3.scrollToEnd({
        animated
      });
      setTimeout(
        () => {
          state.maintainingScrollAtEnd = false;
        },
        0
      );
    });
    return true;
  }
  return false;
}

// src/utils/updateAveragesOnDataChange.ts
function updateAveragesOnDataChange(state, oldData, newData) {
  var _a3;
  const {
    averageSizes,
    sizesKnown,
    indexByKey,
    props: { itemsAreEqual, getItemType, keyExtractor }
  } = state;
  if (!itemsAreEqual || !oldData.length || !newData.length) {
    for (const key in averageSizes) {
      delete averageSizes[key];
    }
    return;
  }
  const itemTypesToPreserve = {};
  const newDataLength = newData.length;
  const oldDataLength = oldData.length;
  for (let newIndex = 0; newIndex < newDataLength; newIndex++) {
    const newItem = newData[newIndex];
    const id = keyExtractor ? keyExtractor(newItem, newIndex) : String(newIndex);
    const oldIndex = indexByKey.get(id);
    if (oldIndex !== void 0 && oldIndex < oldDataLength) {
      const knownSize = sizesKnown.get(id);
      if (knownSize === void 0) continue;
      const oldItem = oldData[oldIndex];
      const areEqual = itemsAreEqual(oldItem, newItem, newIndex, newData);
      if (areEqual) {
        const itemType = getItemType ? (_a3 = getItemType(newItem, newIndex)) != null ? _a3 : "" : "";
        let typeData = itemTypesToPreserve[itemType];
        if (!typeData) {
          typeData = itemTypesToPreserve[itemType] = { count: 0, totalSize: 0 };
        }
        typeData.totalSize += knownSize;
        typeData.count++;
      }
    }
  }
  for (const key in averageSizes) {
    delete averageSizes[key];
  }
  for (const itemType in itemTypesToPreserve) {
    const { totalSize, count } = itemTypesToPreserve[itemType];
    if (count > 0) {
      averageSizes[itemType] = {
        avg: totalSize / count,
        num: count
      };
    }
  }
}

// src/core/checkResetContainers.ts
function checkResetContainers(ctx, dataProp) {
  const state = ctx.state;
  const { previousData } = state;
  if (previousData) {
    updateAveragesOnDataChange(state, previousData, dataProp);
  }
  const { maintainScrollAtEnd } = state.props;
  calculateItemsInView(ctx, { dataChanged: true, doMVCP: true });
  const shouldMaintainScrollAtEnd = maintainScrollAtEnd === true || maintainScrollAtEnd.onDataChange;
  if (shouldMaintainScrollAtEnd) {
    doMaintainScrollAtEnd(ctx, false);
  }
  checkAtTop(state);
  checkAtBottom(ctx);
  ctx.initializationManager.checkStabilization();
  state.previousData = dataProp;
}

// src/core/doInitialAllocateContainers.ts
function doInitialAllocateContainers(ctx) {
  var _a3, _b, _c;
  const state = ctx.state;
  const {
    scrollLength,
    props: {
      data,
      getEstimatedItemSize,
      getFixedItemSize,
      getItemType,
      scrollBuffer,
      numColumns,
      estimatedItemSize
    }
  } = state;
  const hasContainers = peek$(ctx, "numContainers");
  if (scrollLength > 0 && data.length > 0 && !hasContainers) {
    let averageItemSize;
    if (getFixedItemSize || getEstimatedItemSize) {
      let totalSize = 0;
      const num = Math.min(20, data.length);
      for (let i = 0; i < num; i++) {
        const item = data[i];
        if (item !== void 0) {
          const itemType = (_a3 = getItemType == null ? void 0 : getItemType(item, i)) != null ? _a3 : "";
          totalSize += (_c = (_b = getFixedItemSize == null ? void 0 : getFixedItemSize(item, i, itemType)) != null ? _b : getEstimatedItemSize == null ? void 0 : getEstimatedItemSize(item, i, itemType)) != null ? _c : estimatedItemSize;
        }
      }
      averageItemSize = totalSize / num;
    } else {
      averageItemSize = estimatedItemSize;
    }
    const numContainers = Math.ceil((scrollLength + scrollBuffer * 2) / averageItemSize * numColumns);
    for (let i = 0; i < numContainers; i++) {
      set$(ctx, `containerPosition${i}`, POSITION_OUT_OF_VIEW);
      set$(ctx, `containerColumn${i}`, -1);
      set$(ctx, `containerSpan${i}`, 1);
    }
    set$(ctx, "numContainers", numContainers);
    set$(ctx, "numContainersPooled", numContainers * state.props.initialContainerPoolRatio);
    if (!IsNewArchitecture || state.lastLayout) {
      if (state.initialScroll) {
        requestAnimationFrame(() => {
          calculateItemsInView(ctx, { dataChanged: true, doMVCP: true });
        });
      } else {
        calculateItemsInView(ctx, { dataChanged: true, doMVCP: true });
      }
    }
    return true;
  }
}

// src/core/handleLayout.ts
function handleLayout(ctx, layout, setCanRender) {
  const state = ctx.state;
  const { maintainScrollAtEnd } = state.props;
  const measuredLength = layout[state.props.horizontal ? "width" : "height"];
  const previousLength = state.scrollLength;
  const scrollLength = measuredLength > 0 ? measuredLength : previousLength;
  const otherAxisSize = layout[state.props.horizontal ? "height" : "width"];
  const needsCalculate = !state.lastLayout || scrollLength > state.scrollLength || state.lastLayout.x !== layout.x || state.lastLayout.y !== layout.y;
  state.lastLayout = layout;
  const prevOtherAxisSize = state.otherAxisSize;
  const didChange = scrollLength !== state.scrollLength || otherAxisSize !== prevOtherAxisSize;
  if (didChange) {
    state.scrollLength = scrollLength;
    state.otherAxisSize = otherAxisSize;
    state.lastBatchingAction = Date.now();
    state.scrollForNextCalculateItemsInView = void 0;
    if (scrollLength > 0) {
      doInitialAllocateContainers(ctx);
    }
    if (needsCalculate) {
      calculateItemsInView(ctx, { doMVCP: true });
    }
    if (didChange || otherAxisSize !== prevOtherAxisSize) {
      set$(ctx, "scrollSize", { height: layout.height, width: layout.width });
    }
    if (maintainScrollAtEnd === true || maintainScrollAtEnd.onLayout) {
      doMaintainScrollAtEnd(ctx, false);
    }
    checkAtBottom(ctx);
    checkAtTop(state);
    if (state) {
      state.needsOtherAxisSize = otherAxisSize - (state.props.stylePaddingTop || 0) < 10;
    }
    if (IS_DEV && measuredLength === 0) {
      warnDevOnce(
        "height0",
        `List ${state.props.horizontal ? "width" : "height"} is 0. You may need to set a style or \`flex: \` for the list, because children are absolutely positioned.`
      );
    }
  }
  setCanRender(true);
}

// src/core/onScroll.ts
function onScroll(ctx, event) {
  var _a3, _b, _c, _d;
  const state = ctx.state;
  const {
    scrollProcessingEnabled,
    props: { onScroll: onScrollProp }
  } = state;
  if (scrollProcessingEnabled === false) {
    return;
  }
  if (((_b = (_a3 = event.nativeEvent) == null ? void 0 : _a3.contentSize) == null ? void 0 : _b.height) === 0 && ((_c = event.nativeEvent.contentSize) == null ? void 0 : _c.width) === 0) {
    return;
  }
  let insetChanged = false;
  if ((_d = event.nativeEvent) == null ? void 0 : _d.contentInset) {
    const { contentInset } = event.nativeEvent;
    const prevInset = state.nativeContentInset;
    if (!prevInset || prevInset.top !== contentInset.top || prevInset.bottom !== contentInset.bottom || prevInset.left !== contentInset.left || prevInset.right !== contentInset.right) {
      state.nativeContentInset = contentInset;
      insetChanged = true;
    }
  }
  let newScroll = event.nativeEvent.contentOffset[state.props.horizontal ? "x" : "y"];
  if (state.scrollingTo) {
    const maxOffset = clampScrollOffset(ctx, newScroll);
    if (newScroll !== maxOffset && Math.abs(newScroll - maxOffset) > 1) {
      newScroll = maxOffset;
      scrollTo(ctx, {
        forceScroll: true,
        isInitialScroll: true,
        noScrollingTo: true,
        offset: newScroll
      });
      return;
    }
  }
  state.scrollPending = newScroll;
  updateScroll(ctx, newScroll, insetChanged);
  if (state.scrollingTo) {
    const isWebAnimatedScroll = Platform2.OS === "web" && state.scrollingTo.animated;
    if (!isWebAnimatedScroll) {
      checkFinishedScroll(ctx);
    }
  }
  onScrollProp == null ? void 0 : onScrollProp(event);
}

// src/core/ScrollAdjustHandler.ts
var ScrollAdjustHandler = class {
  constructor(ctx) {
    this.appliedAdjust = 0;
    this.pendingAdjust = 0;
    this.ctx = ctx;
  }
  requestAdjust(add) {
    const scrollingTo = this.ctx.state.scrollingTo;
    if (PlatformAdjustBreaksScroll && (scrollingTo == null ? void 0 : scrollingTo.animated) && !scrollingTo.isInitialScroll) {
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
  commitPendingAdjust(scrollTarget) {
    if (PlatformAdjustBreaksScroll) {
      const state = this.ctx.state;
      const pending = this.pendingAdjust;
      this.pendingAdjust = 0;
      if (pending !== 0) {
        let targetScroll;
        if ((scrollTarget == null ? void 0 : scrollTarget.index) !== void 0) {
          let targetIndex = scrollTarget.index;
          if (scrollTarget.isScrollToEnd) {
            const currentLastIndex = state.props.data.length - 1;
            if (currentLastIndex >= 0 && currentLastIndex !== targetIndex) {
              targetIndex = currentLastIndex;
            }
          } else if (scrollTarget.itemKey !== void 0) {
            const currentIndex = state.indexByKey.get(scrollTarget.itemKey);
            if (currentIndex !== void 0) {
              targetIndex = currentIndex;
            }
          }
          const currentOffset = calculateOffsetForIndex(this.ctx, targetIndex);
          targetScroll = calculateOffsetWithOffsetPosition(this.ctx, currentOffset, scrollTarget);
          targetScroll = clampScrollOffset(this.ctx, targetScroll);
        } else {
          targetScroll = clampScrollOffset(this.ctx, state.scroll + pending);
        }
        const adjustment = targetScroll - state.scroll;
        if (Math.abs(adjustment) > 0.1 || Math.abs(pending) > 0.1) {
          this.appliedAdjust += adjustment;
          state.scroll = targetScroll;
          state.scrollForNextCalculateItemsInView = void 0;
          set$(this.ctx, "scrollAdjust", this.appliedAdjust);
        }
        set$(this.ctx, "scrollAdjustPending", 0);
        calculateItemsInView(this.ctx, { doMVCP: true });
      }
    }
  }
};

// src/core/updateItemSize.ts
var pendingMaintainScrollAtEndFrame = null;
function updateItemSize(ctx, itemKey, sizeObj) {
  var _a3;
  const state = ctx.state;
  const {
    didContainersLayout,
    sizesKnown,
    props: {
      getFixedItemSize,
      getItemType,
      horizontal,
      suggestEstimatedItemSize,
      onItemSizeChanged,
      data,
      maintainScrollAtEnd
    }
  } = state;
  if (!data) return;
  const index = state.indexByKey.get(itemKey);
  if (getFixedItemSize) {
    if (index === void 0) {
      return;
    }
    const itemData = state.props.data[index];
    if (itemData === void 0) {
      return;
    }
    const type = getItemType ? (_a3 = getItemType(itemData, index)) != null ? _a3 : "" : "";
    const size2 = getFixedItemSize(itemData, index, type);
    if (size2 !== void 0 && size2 === sizesKnown.get(itemKey)) {
      return;
    }
  }
  let needsRecalculate = !didContainersLayout;
  let shouldMaintainScrollAtEnd = false;
  let minIndexSizeChanged;
  let maxOtherAxisSize = peek$(ctx, "otherAxisSize") || 0;
  const prevSizeKnown = state.sizesKnown.get(itemKey);
  const diff = updateOneItemSize(ctx, itemKey, sizeObj);
  const size = roundSize(horizontal ? sizeObj.width : sizeObj.height);
  if (diff !== 0) {
    minIndexSizeChanged = minIndexSizeChanged !== void 0 ? Math.min(minIndexSizeChanged, index) : index;
    const { startBuffered, endBuffered } = state;
    needsRecalculate || (needsRecalculate = index >= startBuffered && index <= endBuffered);
    if (!needsRecalculate && state.containerItemKeys.has(itemKey)) {
      needsRecalculate = true;
    }
    if (state.needsOtherAxisSize) {
      const otherAxisSize = horizontal ? sizeObj.height : sizeObj.width;
      maxOtherAxisSize = Math.max(maxOtherAxisSize, otherAxisSize);
    }
    if (prevSizeKnown !== void 0 && Math.abs(prevSizeKnown - size) > 5) {
      shouldMaintainScrollAtEnd = true;
    }
    onItemSizeChanged == null ? void 0 : onItemSizeChanged({
      index,
      itemData: state.props.data[index],
      itemKey,
      previous: size - diff,
      size
    });
  }
  if (minIndexSizeChanged !== void 0) {
    state.minIndexSizeChanged = state.minIndexSizeChanged !== void 0 ? Math.min(state.minIndexSizeChanged, minIndexSizeChanged) : minIndexSizeChanged;
  }
  if (IS_DEV && suggestEstimatedItemSize && minIndexSizeChanged !== void 0) {
    if (state.timeoutSizeMessage) clearTimeout(state.timeoutSizeMessage);
    state.timeoutSizeMessage = setTimeout(() => {
      var _a4;
      state.timeoutSizeMessage = void 0;
      const num = state.sizesKnown.size;
      const avg = (_a4 = state.averageSizes[""]) == null ? void 0 : _a4.avg;
      console.warn(
        `[legend-list] Based on the ${num} items rendered so far, the optimal estimated size is ${avg}.`
      );
    }, 1e3);
  }
  const cur = peek$(ctx, "otherAxisSize");
  if (!cur || maxOtherAxisSize > cur) {
    set$(ctx, "otherAxisSize", maxOtherAxisSize);
  }
  if (didContainersLayout || checkAllSizesKnown(state)) {
    if (needsRecalculate) {
      state.scrollForNextCalculateItemsInView = void 0;
      calculateItemsInView(ctx, { doMVCP: true });
    }
    if (shouldMaintainScrollAtEnd) {
      if (maintainScrollAtEnd === true || maintainScrollAtEnd.onItemLayout) {
        if (pendingMaintainScrollAtEndFrame === null) {
          pendingMaintainScrollAtEndFrame = requestAnimationFrame(() => {
            pendingMaintainScrollAtEndFrame = null;
            doMaintainScrollAtEnd(ctx, false);
          });
        }
      }
    }
  }
}
function updateOneItemSize(ctx, itemKey, sizeObj) {
  var _a3;
  const state = ctx.state;
  const {
    indexByKey,
    sizesKnown,
    averageSizes,
    props: { data, horizontal, getEstimatedItemSize, getItemType, getFixedItemSize }
  } = state;
  if (!data) return 0;
  const index = indexByKey.get(itemKey);
  const prevSize = getItemSize(ctx, itemKey, index, data[index]);
  const rawSize = horizontal ? sizeObj.width : sizeObj.height;
  const size = Platform2.OS === "web" ? Math.round(rawSize) : roundSize(rawSize);
  const prevSizeKnown = sizesKnown.get(itemKey);
  sizesKnown.set(itemKey, size);
  if (!getEstimatedItemSize && !getFixedItemSize && size > 0) {
    const itemType = getItemType ? (_a3 = getItemType(data[index], index)) != null ? _a3 : "" : "";
    let averages = averageSizes[itemType];
    if (!averages) {
      averages = averageSizes[itemType] = { avg: 0, num: 0 };
    }
    if (averages.num === 0) {
      averages.avg = size;
      averages.num++;
    } else if (prevSizeKnown !== void 0 && prevSizeKnown > 0) {
      averages.avg += (size - prevSizeKnown) / averages.num;
    } else {
      averages.avg = (averages.avg * averages.num + size) / (averages.num + 1);
      averages.num++;
    }
  }
  if (!prevSize || Math.abs(prevSize - size) > 0.1) {
    setSize(ctx, itemKey, size);
    return size - prevSize;
  }
  return 0;
}
function useWrapIfItem(fn) {
  return React2.useMemo(
    () => fn ? (arg1, arg2, arg3) => arg1 !== void 0 && arg2 !== void 0 ? fn(arg1, arg2, arg3) : void 0 : void 0,
    [fn]
  );
}
var useCombinedRef = (...refs) => {
  const callback = React2.useCallback((element) => {
    for (const ref of refs) {
      if (!ref) {
        continue;
      }
      if (isFunction(ref)) {
        ref(element);
      } else {
        ref.current = element;
      }
    }
  }, refs);
  return callback;
};
function getWindowSize() {
  const screenSize = reactNative.Dimensions.get("window");
  return {
    height: screenSize.height,
    width: screenSize.width
  };
}
var StyleSheet = reactNative.StyleSheet;
function useStickyScrollHandler(stickyHeaderIndices, horizontal, ctx, onScroll2) {
  return React2.useMemo(() => {
    if (stickyHeaderIndices == null ? void 0 : stickyHeaderIndices.length) {
      const { animatedScrollY } = ctx;
      return reactNative.Animated.event(
        [
          {
            nativeEvent: {
              contentOffset: { [horizontal ? "x" : "y"]: animatedScrollY }
            }
          }
        ],
        {
          listener: onScroll2,
          useNativeDriver: true
        }
      );
    }
    return onScroll2;
  }, [stickyHeaderIndices == null ? void 0 : stickyHeaderIndices.join(","), horizontal]);
}

// src/utils/createColumnWrapperStyle.ts
function createColumnWrapperStyle(contentContainerStyle) {
  const { gap, columnGap, rowGap } = contentContainerStyle;
  if (gap || columnGap || rowGap) {
    contentContainerStyle.gap = void 0;
    contentContainerStyle.columnGap = void 0;
    contentContainerStyle.rowGap = void 0;
    return {
      columnGap,
      gap,
      rowGap
    };
  }
}

// src/utils/createImperativeHandle.ts
function createImperativeHandle(ctx) {
  const state = ctx.state;
  const scrollIndexIntoView = (options) => {
    if (state) {
      const { index, onSettled, ...rest } = options;
      const { startNoBuffer, endNoBuffer } = state;
      if (index < startNoBuffer || index > endNoBuffer) {
        const viewPosition = index < startNoBuffer ? 0 : 1;
        scrollToIndex(ctx, {
          ...rest,
          index,
          onSettled,
          viewPosition
        });
      } else if (onSettled) {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            onSettled();
          });
        });
      }
    }
  };
  const refScroller = state.refScroller;
  return {
    flashScrollIndicators: () => refScroller.current.flashScrollIndicators(),
    getNativeScrollRef: () => refScroller.current,
    getScrollableNode: () => refScroller.current.getScrollableNode(),
    getScrollResponder: () => refScroller.current.getScrollResponder(),
    getState: () => ({
      activeStickyIndex: peek$(ctx, "activeStickyIndex"),
      contentLength: getContentSize(ctx),
      data: state.props.data,
      elementAtIndex: (index) => {
        var _a3;
        return (_a3 = ctx.viewRefs.get(findContainerId(ctx, getId(state, index)))) == null ? void 0 : _a3.current;
      },
      end: state.endNoBuffer,
      endBuffered: state.endBuffered,
      isAtEnd: state.isAtEnd,
      isAtStart: state.isAtStart,
      isInitializing: state.isInitializing,
      listen: (signalName, cb) => listen$(ctx, signalName, cb),
      listenToPosition: (key, cb) => listenPosition$(ctx, key, cb),
      positionAtIndex: (index) => state.positions.get(getId(state, index)),
      positions: state.positions,
      scroll: state.scroll,
      scrollLength: state.scrollLength,
      scrollVelocity: getScrollVelocity(state),
      sizeAtIndex: (index) => state.sizesKnown.get(getId(state, index)),
      sizes: state.sizesKnown,
      start: state.startNoBuffer,
      startBuffered: state.startBuffered
    }),
    reportContentInset: (inset) => {
      state.contentInsetOverride = inset != null ? inset : void 0;
      updateScroll(ctx, state.scroll, true);
    },
    scrollIndexIntoView,
    scrollItemIntoView: ({ item, ...props }) => {
      const data = state.props.data;
      const index = data.indexOf(item);
      if (index !== -1) {
        scrollIndexIntoView({ index, ...props });
      }
    },
    scrollToEnd: (options) => {
      const data = state.props.data;
      const stylePaddingBottom = state.props.stylePaddingBottom;
      const index = data.length - 1;
      if (index !== -1) {
        const paddingBottom = stylePaddingBottom || 0;
        const footerSize = peek$(ctx, "footerSize") || 0;
        scrollToIndex(ctx, {
          ...options,
          index,
          viewOffset: -paddingBottom - footerSize + ((options == null ? void 0 : options.viewOffset) || 0),
          viewPosition: 1,
          isScrollToEnd: true
        });
      }
    },
    jumpToLatest: (options) => {
      var _a3;
      const data = state.props.data;
      const keyExtractor = state.props.keyExtractor;
      if (!data || data.length === 0) {
        console.warn("[jumpToLatest] No data available, cannot jump to latest");
        return;
      }
      if (ctx.initializationManager.isInitializing()) {
        ctx.initializationManager.exitInitialization({
          type: "failed" /* FAILED */,
          mode: ctx.initializationManager.getMode(),
          reason: "Interrupted by jumpToLatest call",
          timelineId: state.props.timelineId,
          isImperative: ctx.initializationManager.isImperativeInit()
        });
      }
      ctx.initializationManager.enterInitialization({
        timelineId: state.props.timelineId || "live-timeline",
        isImperative: true,
        // Mark as imperative to avoid timeline tracking update
        mode: "chat" /* CHAT */,
        // CHAT mode: anchors to bottom, viewPosition 1.0
        targetViewPosition: 1
      });
      const scrollPrepared = ctx.initializationManager.prepareInitialScroll(data, keyExtractor);
      if (!scrollPrepared) {
        ctx.initializationManager.exitInitialization({
          type: "failed" /* FAILED */,
          mode: ctx.initializationManager.getMode(),
          reason: "Failed to prepare scroll in jumpToLatest",
          timelineId: state.props.timelineId,
          isImperative: true
        });
        return;
      }
      const lastIndex = data.length - 1;
      const stylePaddingBottom = state.props.stylePaddingBottom || 0;
      const footerSize = peek$(ctx, "footerSize") || 0;
      scrollToIndex(ctx, {
        index: lastIndex,
        viewPosition: 1,
        viewOffset: -stylePaddingBottom - footerSize + ((options == null ? void 0 : options.viewOffset) || 0),
        animated: (_a3 = options == null ? void 0 : options.animated) != null ? _a3 : true,
        isScrollToEnd: true,
        // Enable retry logic if data changes during scroll
        onSettled: () => {
          ctx.initializationManager.transitionToStabilizingPhase();
        }
      });
    },
    scrollToIndex: (params) => scrollToIndex(ctx, params),
    scrollToItem: ({ item, ...props }) => {
      const data = state.props.data;
      const index = data.indexOf(item);
      if (index !== -1) {
        scrollToIndex(ctx, { index, ...props });
      }
    },
    scrollToOffset: (params) => {
      const wrappedParams = params.onSettled ? {
        ...params,
        onSettled: () => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              params.onSettled();
            });
          });
        }
      } : params;
      scrollTo(ctx, wrappedParams);
    },
    setScrollProcessingEnabled: (enabled) => {
      state.scrollProcessingEnabled = enabled;
    },
    setVisibleContentAnchorOffset: (value) => {
      const val = isFunction(value) ? value(peek$(ctx, "scrollAdjustUserOffset") || 0) : value;
      set$(ctx, "scrollAdjustUserOffset", val);
    }
  };
}

// src/utils/getAlwaysRenderIndices.ts
var sortAsc = (a, b) => a - b;
var toCount = (value) => typeof value === "number" && Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
var addIndex = (result, dataLength, index) => {
  if (index >= 0 && index < dataLength) {
    result.add(index);
  }
};
function getAlwaysRenderIndices(config, data, keyExtractor) {
  var _a3, _b;
  if (!config || data.length === 0) {
    return [];
  }
  const result = /* @__PURE__ */ new Set();
  const dataLength = data.length;
  const topCount = toCount(config.top);
  if (topCount > 0) {
    for (let i = 0; i < Math.min(topCount, dataLength); i++) {
      addIndex(result, dataLength, i);
    }
  }
  const bottomCount = toCount(config.bottom);
  if (bottomCount > 0) {
    for (let i = Math.max(0, dataLength - bottomCount); i < dataLength; i++) {
      addIndex(result, dataLength, i);
    }
  }
  if ((_a3 = config.indices) == null ? void 0 : _a3.length) {
    for (const index of config.indices) {
      if (!Number.isFinite(index)) continue;
      addIndex(result, dataLength, Math.floor(index));
    }
  }
  if ((_b = config.keys) == null ? void 0 : _b.length) {
    const keys = new Set(config.keys);
    for (let i = 0; i < dataLength && keys.size > 0; i++) {
      const key = keyExtractor(data[i], i);
      if (keys.has(key)) {
        addIndex(result, dataLength, i);
        keys.delete(key);
      }
    }
  }
  const indices = Array.from(result);
  indices.sort(sortAsc);
  return indices;
}
function getRenderedItem(ctx, key) {
  var _a3;
  const state = ctx.state;
  if (!state) {
    return null;
  }
  const {
    indexByKey,
    props: { data, getItemType, renderItem }
  } = state;
  const index = indexByKey.get(key);
  if (index === void 0) {
    return null;
  }
  let renderedItem = null;
  const extraData = peek$(ctx, "extraData");
  const item = data[index];
  if (renderItem && !isNullOrUndefined(item)) {
    const itemProps = {
      data,
      extraData,
      index,
      item,
      type: getItemType ? (_a3 = getItemType(item, index)) != null ? _a3 : "" : ""
    };
    renderedItem = isFunction(renderItem) ? renderItem(itemProps) : React2__namespace.default.createElement(renderItem, itemProps);
  }
  return { index, item: data[index], renderedItem };
}

// src/utils/normalizeMaintainVisibleContentPosition.ts
function normalizeMaintainVisibleContentPosition(value) {
  var _a3, _b;
  if (value === true) {
    return { data: true, size: true };
  }
  if (value && typeof value === "object") {
    return {
      data: (_a3 = value.data) != null ? _a3 : false,
      shouldRestorePosition: value.shouldRestorePosition,
      size: (_b = value.size) != null ? _b : true
    };
  }
  if (value === false) {
    return { data: false, size: false };
  }
  return { data: false, size: true };
}

// src/utils/setPaddingTop.ts
function setPaddingTop(ctx, { stylePaddingTop }) {
  const state = ctx.state;
  if (stylePaddingTop !== void 0) {
    const prevStylePaddingTop = peek$(ctx, "stylePaddingTop") || 0;
    if (stylePaddingTop < prevStylePaddingTop) {
      let prevTotalSize = peek$(ctx, "totalSize") || 0;
      set$(ctx, "totalSize", prevTotalSize + prevStylePaddingTop);
      state.timeoutSetPaddingTop = setTimeout(() => {
        prevTotalSize = peek$(ctx, "totalSize") || 0;
        set$(ctx, "totalSize", prevTotalSize - prevStylePaddingTop);
      }, 16);
    }
    set$(ctx, "stylePaddingTop", stylePaddingTop);
  }
}
function useThrottleDebounce(mode) {
  const timeoutRef = React2.useRef(null);
  const lastCallTimeRef = React2.useRef(0);
  const lastArgsRef = React2.useRef(null);
  const clearTimeoutRef = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  const execute = React2.useCallback(
    (callback, delay, ...args) => {
      {
        const now = Date.now();
        lastArgsRef.current = args;
        if (now - lastCallTimeRef.current >= delay) {
          lastCallTimeRef.current = now;
          callback(...args);
          clearTimeoutRef();
        } else {
          clearTimeoutRef();
          timeoutRef.current = setTimeout(
            () => {
              if (lastArgsRef.current) {
                lastCallTimeRef.current = Date.now();
                callback(...lastArgsRef.current);
                timeoutRef.current = null;
                lastArgsRef.current = null;
              }
            },
            delay - (now - lastCallTimeRef.current)
          );
        }
      }
    },
    [mode]
  );
  return execute;
}

// src/utils/throttledOnScroll.ts
function useThrottledOnScroll(originalHandler, scrollEventThrottle) {
  const throttle = useThrottleDebounce("throttle");
  return (event) => throttle(originalHandler, scrollEventThrottle, { nativeEvent: event.nativeEvent });
}

// src/components/LegendList.tsx
var DEFAULT_DRAW_DISTANCE = 250;
var DEFAULT_ITEM_SIZE = 100;
var LegendList = typedMemo(
  // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  typedForwardRef(function LegendList2(props, forwardedRef) {
    const { children, data: dataProp, renderItem: renderItemProp, ...restProps } = props;
    const isChildrenMode = children !== void 0 && dataProp === void 0;
    const processedProps = isChildrenMode ? {
      ...restProps,
      childrenMode: true,
      data: (isArray(children) ? children : React2__namespace.Children.toArray(children)).flat(1),
      renderItem: ({ item }) => item
    } : {
      ...restProps,
      data: dataProp || [],
      renderItem: renderItemProp
    };
    return /* @__PURE__ */ React2__namespace.createElement(StateProvider, null, /* @__PURE__ */ React2__namespace.createElement(LegendListInner, { ...processedProps, ref: forwardedRef }));
  })
);
var LegendListInner = typedForwardRef(function LegendListInner2(props, forwardedRef) {
  var _a3, _b, _c, _d, _e;
  const {
    alignItemsAtEnd = false,
    alwaysRender,
    columnWrapperStyle,
    contentContainerStyle: contentContainerStyleProp,
    contentInset,
    data: dataProp = [],
    dataVersion,
    drawDistance = 250,
    estimatedItemSize: estimatedItemSizeProp,
    estimatedListSize,
    extraData,
    getEstimatedItemSize,
    getFixedItemSize,
    getItemType,
    horizontal,
    initialContainerPoolRatio = 2,
    initialScrollAtEnd = false,
    initialScrollIndex: initialScrollIndexProp,
    initialScrollOffset: initialScrollOffsetProp,
    itemsAreEqual,
    keyExtractor: keyExtractorProp,
    ListEmptyComponent,
    ListHeaderComponent,
    maintainScrollAtEnd = false,
    maintainScrollAtEndThreshold = 0.1,
    maintainVisibleContentPosition: maintainVisibleContentPositionProp,
    numColumns: numColumnsProp = 1,
    overrideItemLayout,
    onEndReached,
    onEndReachedThreshold = 0.5,
    onInitializationComplete,
    onItemSizeChanged,
    onMetricsChange,
    onLayout: onLayoutProp,
    onLoad,
    onMomentumScrollEnd,
    onRefresh,
    onScroll: onScrollProp,
    onStartReached,
    onStartReachedThreshold = 0.5,
    onStickyHeaderChange,
    onViewableItemsChanged,
    progressViewOffset,
    recycleItems = false,
    refreshControl,
    refreshing,
    refScrollView,
    renderItem,
    scrollEventThrottle,
    snapToIndices,
    stabilizationAnchorId,
    stickyHeaderIndices: stickyHeaderIndicesProp,
    stickyIndices: stickyIndicesDeprecated,
    // TODOV3: Remove from v3 release
    style: styleProp,
    suggestEstimatedItemSize,
    debugInitialization,
    timelineId,
    viewabilityConfig,
    viewabilityConfigCallbackPairs,
    waitForInitialLayout = true,
    ...rest
  } = props;
  const animatedPropsInternal = props.animatedPropsInternal;
  const { childrenMode } = rest;
  const contentContainerStyleBase = StyleSheet.flatten(contentContainerStyleProp);
  const shouldFlexGrow = alignItemsAtEnd && (horizontal ? (contentContainerStyleBase == null ? void 0 : contentContainerStyleBase.minWidth) == null : (contentContainerStyleBase == null ? void 0 : contentContainerStyleBase.minHeight) == null);
  const contentContainerStyle = {
    ...contentContainerStyleBase,
    ...alignItemsAtEnd ? {
      display: "flex",
      flexDirection: horizontal ? "row" : "column",
      ...shouldFlexGrow ? { flexGrow: 1 } : {},
      justifyContent: "flex-end"
    } : {}
  };
  const style = { ...StyleSheet.flatten(styleProp) };
  const stylePaddingTopState = extractPadding(style, contentContainerStyle, "Top");
  const stylePaddingBottomState = extractPadding(style, contentContainerStyle, "Bottom");
  const maintainVisibleContentPositionConfig = normalizeMaintainVisibleContentPosition(
    maintainVisibleContentPositionProp
  );
  const [renderNum, setRenderNum] = React2.useState(0);
  const initialScrollProp = initialScrollAtEnd ? { index: Math.max(0, dataProp.length - 1), viewOffset: -stylePaddingBottomState, viewPosition: 1 } : initialScrollIndexProp || initialScrollOffsetProp ? typeof initialScrollIndexProp === "object" ? {
    index: initialScrollIndexProp.index || 0,
    viewOffset: initialScrollIndexProp.viewOffset || (initialScrollIndexProp.viewPosition === 1 ? -stylePaddingBottomState : 0),
    viewPosition: initialScrollIndexProp.viewPosition || 0
  } : {
    index: initialScrollIndexProp || 0,
    viewOffset: initialScrollOffsetProp || 0
  } : void 0;
  const [canRender, setCanRender] = React2__namespace.useState(!IsNewArchitecture);
  const ctx = useStateContext();
  ctx.columnWrapperStyle = columnWrapperStyle || (contentContainerStyle ? createColumnWrapperStyle(contentContainerStyle) : void 0);
  const refScroller = React2.useRef(null);
  const combinedRef = useCombinedRef(refScroller, refScrollView);
  const estimatedItemSize = estimatedItemSizeProp != null ? estimatedItemSizeProp : DEFAULT_ITEM_SIZE;
  const scrollBuffer = (drawDistance != null ? drawDistance : DEFAULT_DRAW_DISTANCE) || 1;
  const keyExtractor = keyExtractorProp != null ? keyExtractorProp : (_item, index) => index.toString();
  const stickyHeaderIndices = stickyHeaderIndicesProp != null ? stickyHeaderIndicesProp : stickyIndicesDeprecated;
  const alwaysRenderIndices = React2.useMemo(() => {
    const indices = getAlwaysRenderIndices(alwaysRender, dataProp, keyExtractor);
    return { arr: indices, set: new Set(indices) };
  }, [
    alwaysRender == null ? void 0 : alwaysRender.top,
    alwaysRender == null ? void 0 : alwaysRender.bottom,
    (_a3 = alwaysRender == null ? void 0 : alwaysRender.indices) == null ? void 0 : _a3.join(","),
    (_b = alwaysRender == null ? void 0 : alwaysRender.keys) == null ? void 0 : _b.join(","),
    dataProp,
    dataVersion,
    keyExtractor
  ]);
  if (IS_DEV && stickyIndicesDeprecated && !stickyHeaderIndicesProp) {
    warnDevOnce(
      "stickyIndices",
      "stickyIndices has been renamed to stickyHeaderIndices. Please update your props to use stickyHeaderIndices."
    );
  }
  const refState = React2.useRef();
  const hasOverrideItemLayout = !!overrideItemLayout;
  const prevHasOverrideItemLayout = React2.useRef(hasOverrideItemLayout);
  if (!refState.current) {
    if (!ctx.state) {
      const initialScrollLength = (estimatedListSize != null ? estimatedListSize : IsNewArchitecture ? { height: 0, width: 0 } : getWindowSize())[horizontal ? "width" : "height"];
      ctx.state = {
        activeStickyIndex: -1,
        averageSizes: {},
        columns: /* @__PURE__ */ new Map(),
        columnSpans: /* @__PURE__ */ new Map(),
        containerItemKeys: /* @__PURE__ */ new Map(),
        containerItemTypes: /* @__PURE__ */ new Map(),
        contentInsetOverride: void 0,
        dataChangeNeedsScrollUpdate: false,
        didColumnsChange: false,
        didDataChange: false,
        enableScrollForNextCalculateItemsInView: true,
        endBuffered: -1,
        endNoBuffer: -1,
        endReachedSnapshot: void 0,
        firstFullyOnScreenIndex: -1,
        idCache: [],
        idsInView: [],
        indexByKey: /* @__PURE__ */ new Map(),
        initialAnchor: (initialScrollProp == null ? void 0 : initialScrollProp.index) !== void 0 && (initialScrollProp == null ? void 0 : initialScrollProp.viewPosition) !== void 0 ? {
          attempts: 0,
          index: initialScrollProp.index,
          settledTicks: 0,
          viewOffset: (_c = initialScrollProp.viewOffset) != null ? _c : 0,
          viewPosition: initialScrollProp.viewPosition
        } : void 0,
        initialScroll: initialScrollProp,
        isAtEnd: false,
        isAtStart: false,
        isEndBufferSufficient: false,
        isEndReached: null,
        isFirst: true,
        isInitializing: false,
        isStartBufferSufficient: false,
        isStartReached: null,
        lastBatchingAction: Date.now(),
        lastLayout: void 0,
        lastScrollDelta: 0,
        lastTimelineId: void 0,
        lastStabilizationAnchorId: void 0,
        loadStartTime: Date.now(),
        minIndexSizeChanged: 0,
        nativeContentInset: void 0,
        nativeMarginTop: 0,
        pendingEndRequest: false,
        pendingStartRequest: false,
        positions: /* @__PURE__ */ new Map(),
        props: {},
        queuedCalculateItemsInView: 0,
        refScroller: void 0,
        scroll: 0,
        scrollAdjustHandler: new ScrollAdjustHandler(ctx),
        scrollForNextCalculateItemsInView: void 0,
        scrollHistory: [],
        scrollLength: initialScrollLength,
        scrollPending: 0,
        scrollPrev: 0,
        scrollPrevTime: 0,
        scrollProcessingEnabled: true,
        scrollTime: 0,
        sizes: /* @__PURE__ */ new Map(),
        sizesKnown: /* @__PURE__ */ new Map(),
        stabilizationStableFrames: 0,
        startBuffered: -1,
        startNoBuffer: -1,
        startReachedSnapshot: void 0,
        stickyContainerPool: /* @__PURE__ */ new Set(),
        stickyContainers: /* @__PURE__ */ new Map(),
        timeoutSizeMessage: 0,
        timeouts: /* @__PURE__ */ new Set(),
        totalSize: 0,
        viewabilityConfigCallbackPairs: void 0
      };
      const internalState = ctx.state;
      internalState.triggerCalculateItemsInView = (params) => calculateItemsInView(ctx, params);
      set$(ctx, "maintainVisibleContentPosition", maintainVisibleContentPositionConfig);
      set$(ctx, "extraData", extraData);
    }
    refState.current = ctx.state;
  }
  const state = refState.current;
  const isFirstLocal = state.isFirst;
  state.didColumnsChange = numColumnsProp !== state.props.numColumns;
  const didDataChangeLocal = state.props.dataVersion !== dataVersion || state.props.data !== dataProp && checkActualChange(state, dataProp, state.props.data);
  if (didDataChangeLocal) {
    state.dataChangeNeedsScrollUpdate = true;
    state.didDataChange = true;
    state.previousData = state.props.data;
  }
  const throttleScrollFn = scrollEventThrottle && onScrollProp ? useThrottledOnScroll(onScrollProp, scrollEventThrottle) : onScrollProp;
  state.props = {
    alignItemsAtEnd,
    alwaysRender,
    alwaysRenderIndicesArr: alwaysRenderIndices.arr,
    alwaysRenderIndicesSet: alwaysRenderIndices.set,
    animatedProps: animatedPropsInternal,
    contentInset,
    data: dataProp,
    dataVersion,
    estimatedItemSize,
    getEstimatedItemSize: useWrapIfItem(getEstimatedItemSize),
    getFixedItemSize: useWrapIfItem(getFixedItemSize),
    getItemType: useWrapIfItem(getItemType),
    horizontal: !!horizontal,
    initialContainerPoolRatio,
    itemsAreEqual,
    keyExtractor: useWrapIfItem(keyExtractor),
    maintainScrollAtEnd,
    maintainScrollAtEndThreshold,
    maintainVisibleContentPosition: maintainVisibleContentPositionConfig,
    numColumns: numColumnsProp,
    onEndReached,
    onEndReachedThreshold,
    onInitializationComplete,
    onItemSizeChanged,
    onLoad,
    onScroll: throttleScrollFn,
    onStartReached,
    onStartReachedThreshold,
    onStickyHeaderChange,
    overrideItemLayout,
    recycleItems: !!recycleItems,
    renderItem,
    scrollBuffer,
    snapToIndices,
    stabilizationAnchorId,
    stickyIndicesArr: stickyHeaderIndices != null ? stickyHeaderIndices : [],
    stickyIndicesSet: React2.useMemo(() => new Set(stickyHeaderIndices != null ? stickyHeaderIndices : []), [stickyHeaderIndices == null ? void 0 : stickyHeaderIndices.join(",")]),
    stylePaddingBottom: stylePaddingBottomState,
    stylePaddingTop: stylePaddingTopState,
    suggestEstimatedItemSize: !!suggestEstimatedItemSize,
    debugInitialization: !!debugInitialization,
    timelineId
  };
  state.refScroller = refScroller;
  const timelineChanged = timelineId !== state.lastTimelineId;
  const anchorChanged = stabilizationAnchorId !== state.lastStabilizationAnchorId;
  if (anchorChanged) {
    state.lastStabilizationAnchorId = stabilizationAnchorId;
  }
  if (timelineChanged) {
    if (ctx.initializationManager.isImperativeInit()) {
      return;
    }
    const isSwitchingFromFocused = (_d = state.lastTimelineId) == null ? void 0 : _d.includes("focused-timeline");
    const isSwitchingToLive = timelineId == null ? void 0 : timelineId.includes("live-timeline");
    const shouldExitEarly = isSwitchingFromFocused && isSwitchingToLive && !stabilizationAnchorId;
    state.lastTimelineId = timelineId;
    ctx.initializationManager.enterInitialization({
      anchorId: stabilizationAnchorId,
      timelineId: timelineId || ""
    });
    if (shouldExitEarly) {
      ctx.initializationManager.exitInitialization({
        type: "early-exit" /* EARLY_EXIT */,
        mode: ctx.initializationManager.getMode(),
        timelineId: timelineId || ""
      });
    } else {
      if (!initialScrollProp && dataProp && dataProp.length > 0) {
        const scrollPrepared = ctx.initializationManager.prepareInitialScroll(
          dataProp,
          keyExtractor
        );
        if (scrollPrepared) {
          ctx.initializationManager.enterScrollingPhase();
          setRenderNum((v) => v + 1);
        } else {
          ctx.initializationManager.exitInitialization({
            type: "failed" /* FAILED */,
            mode: ctx.initializationManager.getMode(),
            reason: "Scroll preparation failed - anchor not found in data",
            timelineId: timelineId || ""
          });
        }
      } else {
        ctx.initializationManager.exitInitialization({
          type: "failed" /* FAILED */,
          mode: ctx.initializationManager.getMode(),
          reason: "No data or has initialScroll prop",
          timelineId: timelineId || ""
        });
      }
    }
  }
  const memoizedLastItemKeys = React2.useMemo(() => {
    if (!dataProp.length) return [];
    return Array.from(
      { length: Math.min(numColumnsProp, dataProp.length) },
      (_, i) => getId(state, dataProp.length - 1 - i)
    );
  }, [dataProp, dataVersion, numColumnsProp]);
  const initializeStateVars = (shouldAdjustPadding) => {
    set$(ctx, "lastItemKeys", memoizedLastItemKeys);
    set$(ctx, "numColumns", numColumnsProp);
    const prevPaddingTop = peek$(ctx, "stylePaddingTop");
    setPaddingTop(ctx, { stylePaddingTop: stylePaddingTopState });
    refState.current.props.stylePaddingBottom = stylePaddingBottomState;
    let paddingDiff = stylePaddingTopState - prevPaddingTop;
    if (shouldAdjustPadding && maintainVisibleContentPositionConfig.size && paddingDiff && prevPaddingTop !== void 0 && Platform2.OS === "ios") {
      if (state.scroll < 0) {
        paddingDiff += state.scroll;
      }
      requestAdjust(ctx, paddingDiff);
    }
  };
  if (isFirstLocal) {
    initializeStateVars(false);
    updateItemPositions(
      ctx,
      /*dataChanged*/
      true
    );
  }
  const initialContentOffset = React2.useMemo(() => {
    var _a4;
    let value;
    const { initialScroll, initialAnchor } = refState.current;
    if (initialScroll) {
      if (!IsNewArchitecture && initialScroll.index !== void 0 && (!initialAnchor || (initialAnchor == null ? void 0 : initialAnchor.index) !== initialScroll.index)) {
        refState.current.initialAnchor = {
          attempts: 0,
          index: initialScroll.index,
          settledTicks: 0,
          viewOffset: (_a4 = initialScroll.viewOffset) != null ? _a4 : 0,
          viewPosition: initialScroll.viewPosition
        };
      }
      if (initialScroll.contentOffset !== void 0) {
        value = initialScroll.contentOffset;
      } else {
        const baseOffset = initialScroll.index !== void 0 ? calculateOffsetForIndex(ctx, initialScroll.index) : 0;
        const resolvedOffset = calculateOffsetWithOffsetPosition(ctx, baseOffset, initialScroll);
        const clampedOffset = clampScrollOffset(ctx, resolvedOffset);
        const updatedInitialScroll = { ...initialScroll, contentOffset: clampedOffset };
        refState.current.initialScroll = updatedInitialScroll;
        state.initialScroll = updatedInitialScroll;
        value = clampedOffset;
      }
    } else {
      refState.current.initialAnchor = void 0;
      value = 0;
    }
    if (!value) {
      setInitialRenderState(ctx, { didInitialScroll: true });
    }
    return value;
  }, [renderNum]);
  if (isFirstLocal || didDataChangeLocal || numColumnsProp !== peek$(ctx, "numColumns")) {
    refState.current.lastBatchingAction = Date.now();
    if (!keyExtractorProp && !isFirstLocal && didDataChangeLocal) {
      IS_DEV && !childrenMode && warnDevOnce(
        "keyExtractor",
        "Changing data without a keyExtractor can cause slow performance and resetting scroll. If your list data can change you should use a keyExtractor with a unique id for best performance and behavior."
      );
      refState.current.sizes.clear();
      refState.current.positions.clear();
      refState.current.totalSize = 0;
      set$(ctx, "totalSize", 0);
    }
  }
  const onLayoutHeader = React2.useCallback((rect, fromLayoutEffect) => {
    const { initialScroll } = refState.current;
    const size = rect[horizontal ? "width" : "height"];
    set$(ctx, "headerSize", size);
    if ((initialScroll == null ? void 0 : initialScroll.index) !== void 0) {
      if (IsNewArchitecture && Platform2.OS !== "android") {
        if (fromLayoutEffect) {
          setRenderNum((v) => v + 1);
        }
      } else {
        setTimeout(doInitialScroll, 17);
      }
    }
  }, []);
  const doInitialScroll = React2.useCallback(() => {
    const {
      initialScroll,
      didFinishInitialScroll,
      queuedInitialLayout,
      scrollingTo,
      didContainersLayout,
      scrollLength
    } = state;
    if (initialScroll && !queuedInitialLayout && !didFinishInitialScroll && !scrollingTo && didContainersLayout && scrollLength > 0) {
      scrollTo(ctx, {
        animated: false,
        index: initialScroll == null ? void 0 : initialScroll.index,
        isInitialScroll: true,
        offset: initialContentOffset,
        precomputedWithViewOffset: true
      });
    }
  }, [initialContentOffset]);
  const onLayoutChange = React2.useCallback((layout) => {
    doInitialScroll();
    handleLayout(ctx, layout, setCanRender);
  }, []);
  const { onLayout } = useOnLayoutSync({
    onLayoutChange,
    onLayoutProp,
    ref: refScroller
    // the type of ScrollView doesn't include measure?
  });
  React2.useLayoutEffect(() => {
    if (snapToIndices) {
      updateSnapToOffsets(ctx);
    }
  }, [snapToIndices]);
  React2.useLayoutEffect(() => {
    const {
      didColumnsChange,
      didDataChange,
      isFirst,
      props: { data }
    } = state;
    const didAllocateContainers = data.length > 0 && doInitialAllocateContainers(ctx);
    if (!didAllocateContainers && (isFirst || didDataChange || didColumnsChange)) {
      checkResetContainers(ctx, data);
    }
    state.didColumnsChange = false;
    state.didDataChange = false;
    state.isFirst = false;
  }, [dataProp, dataVersion, numColumnsProp]);
  React2.useLayoutEffect(() => {
    var _a4;
    set$(ctx, "extraData", extraData);
    const didToggleOverride = prevHasOverrideItemLayout.current !== hasOverrideItemLayout;
    prevHasOverrideItemLayout.current = hasOverrideItemLayout;
    if ((hasOverrideItemLayout || didToggleOverride) && numColumnsProp > 1) {
      (_a4 = state.triggerCalculateItemsInView) == null ? void 0 : _a4.call(state, { forceFullItemPositions: true });
    }
  }, [extraData, hasOverrideItemLayout, numColumnsProp]);
  React2.useLayoutEffect(
    () => initializeStateVars(true),
    [dataVersion, memoizedLastItemKeys.join(","), numColumnsProp, stylePaddingBottomState, stylePaddingTopState]
  );
  React2.useEffect(() => {
    if (!onMetricsChange) {
      return;
    }
    let lastMetrics;
    const emitMetrics = () => {
      const metrics = {
        footerSize: peek$(ctx, "footerSize") || 0,
        headerSize: peek$(ctx, "headerSize") || 0
      };
      if (!lastMetrics || metrics.headerSize !== lastMetrics.headerSize || metrics.footerSize !== lastMetrics.footerSize) {
        lastMetrics = metrics;
        onMetricsChange(metrics);
      }
    };
    emitMetrics();
    const unsubscribe = [listen$(ctx, "headerSize", emitMetrics), listen$(ctx, "footerSize", emitMetrics)];
    return () => {
      for (const unsub of unsubscribe) {
        unsub();
      }
    };
  }, [ctx, onMetricsChange]);
  React2.useEffect(() => {
    const viewability = setupViewability({
      onViewableItemsChanged,
      viewabilityConfig,
      viewabilityConfigCallbackPairs
    });
    state.viewabilityConfigCallbackPairs = viewability;
    state.enableScrollForNextCalculateItemsInView = !viewability;
  }, [viewabilityConfig, viewabilityConfigCallbackPairs, onViewableItemsChanged]);
  if (!IsNewArchitecture) {
    useInit(() => {
      doInitialAllocateContainers(ctx);
    });
  }
  React2.useImperativeHandle(forwardedRef, () => createImperativeHandle(ctx), []);
  if (Platform2.OS === "web") {
    React2.useEffect(doInitialScroll, []);
  }
  const fns = React2.useMemo(
    () => ({
      getRenderedItem: (key) => getRenderedItem(ctx, key),
      onMomentumScrollEnd: (event) => {
        checkFinishedScrollFallback(ctx);
        if (onMomentumScrollEnd) {
          onMomentumScrollEnd(event);
        }
      },
      onScroll: (event) => onScroll(ctx, event),
      updateItemSize: (itemKey, sizeObj) => updateItemSize(ctx, itemKey, sizeObj)
    }),
    []
  );
  const onScrollHandler = useStickyScrollHandler(stickyHeaderIndices, horizontal, ctx, fns.onScroll);
  return /* @__PURE__ */ React2__namespace.createElement(React2__namespace.Fragment, null, /* @__PURE__ */ React2__namespace.createElement(
    ListComponent,
    {
      ...rest,
      alignItemsAtEnd,
      canRender,
      contentContainerStyle,
      contentInset,
      getRenderedItem: fns.getRenderedItem,
      horizontal,
      initialContentOffset,
      ListEmptyComponent: dataProp.length === 0 ? ListEmptyComponent : void 0,
      ListHeaderComponent,
      onLayout,
      onLayoutHeader,
      onMomentumScrollEnd: fns.onMomentumScrollEnd,
      onScroll: onScrollHandler,
      recycleItems,
      refreshControl: refreshControl ? stylePaddingTopState > 0 ? React2__namespace.cloneElement(refreshControl, {
        progressViewOffset: (refreshControl.props.progressViewOffset || 0) + stylePaddingTopState
      }) : refreshControl : onRefresh && /* @__PURE__ */ React2__namespace.createElement(
        reactNative.RefreshControl,
        {
          onRefresh,
          progressViewOffset: (progressViewOffset || 0) + stylePaddingTopState,
          refreshing: !!refreshing
        }
      ),
      refScrollView: combinedRef,
      scrollAdjustHandler: (_e = refState.current) == null ? void 0 : _e.scrollAdjustHandler,
      scrollEventThrottle: 0,
      snapToIndices,
      stickyHeaderIndices,
      style,
      updateItemSize: fns.updateItemSize,
      waitForInitialLayout
    }
  ), IS_DEV && ENABLE_DEBUG_VIEW && /* @__PURE__ */ React2__namespace.createElement(DebugView, { state: refState.current }));
});

exports.InitializationCompletionType = InitializationCompletionType;
exports.InitializationMode = InitializationMode;
exports.InitializationPhase = InitializationPhase;
exports.LegendList = LegendList;
exports.typedForwardRef = typedForwardRef;
exports.typedMemo = typedMemo;
exports.useIsLastItem = useIsLastItem;
exports.useListScrollSize = useListScrollSize;
exports.useRecyclingEffect = useRecyclingEffect;
exports.useRecyclingState = useRecyclingState;
exports.useSyncLayout = useSyncLayout;
exports.useViewability = useViewability;
exports.useViewabilityAmount = useViewabilityAmount;

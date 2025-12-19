'use strict';

var React3 = require('react');
var shim = require('use-sync-external-store/shim');
var reactDom = require('react-dom');

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

var React3__namespace = /*#__PURE__*/_interopNamespace(React3);

// src/components/LegendList.tsx
React3.forwardRef(function AnimatedView2(props, ref) {
  return /* @__PURE__ */ React3__namespace.createElement("div", { ref, ...props });
});
var View = React3.forwardRef(function View2(props, ref) {
  return /* @__PURE__ */ React3__namespace.createElement("div", { ref, ...props });
});
var Text = View;

// src/state/getContentInsetEnd.ts
function getContentInsetEnd(state) {
  var _a3;
  const { props } = state;
  const horizontal = props.horizontal;
  let contentInset = props.contentInset;
  if (!contentInset) {
    const animatedInset = (_a3 = props.animatedProps) == null ? void 0 : _a3.contentInset;
    if (animatedInset) {
      if ("get" in animatedInset) {
        contentInset = animatedInset.get();
      } else {
        contentInset = animatedInset;
      }
    }
  }
  return (horizontal ? contentInset == null ? void 0 : contentInset.right : contentInset == null ? void 0 : contentInset.bottom) || 0;
}

// src/state/getContentSize.ts
function getContentSize(ctx) {
  var _a3;
  const { values, state } = ctx;
  const stylePaddingTop = values.get("stylePaddingTop") || 0;
  const stylePaddingBottom = state.props.stylePaddingBottom || 0;
  const headerSize = values.get("headerSize") || 0;
  const footerSize = values.get("footerSize") || 0;
  const contentInsetBottom = getContentInsetEnd(state);
  const totalSize = (_a3 = state.pendingTotalSize) != null ? _a3 : values.get("totalSize");
  return headerSize + footerSize + totalSize + stylePaddingTop + stylePaddingBottom + (contentInsetBottom || 0);
}

// src/platform/Animated.tsx
var createAnimatedValue = (value) => value;

// src/state/state.tsx
var ContextState = React3__namespace.createContext(null);
var contextNum = 0;
function StateProvider({ children }) {
  const [value] = React3__namespace.useState(() => ({
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
      ["alignItemsPaddingTop", 0],
      ["stylePaddingTop", 0],
      ["headerSize", 0],
      ["numContainers", 0],
      ["activeStickyIndex", -1],
      ["totalSize", 0],
      ["scrollAdjustPending", 0]
    ]),
    viewRefs: /* @__PURE__ */ new Map()
  }));
  return /* @__PURE__ */ React3__namespace.createElement(ContextState.Provider, { value }, children);
}
function useStateContext() {
  return React3__namespace.useContext(ContextState);
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
  const ctx = React3__namespace.useContext(ContextState);
  const { subscribe, get } = React3__namespace.useMemo(() => createSelectorFunctionsArr(ctx, signalNames), [ctx, signalNames]);
  const value = shim.useSyncExternalStore(subscribe, get);
  return value;
}
function useSelector$(signalName, selector) {
  const ctx = React3__namespace.useContext(ContextState);
  const { subscribe, get } = React3__namespace.useMemo(() => createSelectorFunctionsArr(ctx, [signalName]), [ctx, signalName]);
  const value = shim.useSyncExternalStore(subscribe, () => selector(get()[0]));
  return value;
}

// src/components/DebugView.tsx
var DebugRow = ({ children }) => {
  return /* @__PURE__ */ React3__namespace.createElement(View, { style: { alignItems: "center", flexDirection: "row", justifyContent: "space-between" } }, children);
};
var DebugView = React3__namespace.memo(function DebugView2({ state }) {
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
  const [, forceUpdate] = React3.useReducer((x) => x + 1, 0);
  useInterval(() => {
    forceUpdate();
  }, 100);
  return /* @__PURE__ */ React3__namespace.createElement(
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
    /* @__PURE__ */ React3__namespace.createElement(DebugRow, null, /* @__PURE__ */ React3__namespace.createElement(Text, null, "TotalSize:"), /* @__PURE__ */ React3__namespace.createElement(Text, null, totalSize.toFixed(2))),
    /* @__PURE__ */ React3__namespace.createElement(DebugRow, null, /* @__PURE__ */ React3__namespace.createElement(Text, null, "ContentSize:"), /* @__PURE__ */ React3__namespace.createElement(Text, null, contentSize.toFixed(2))),
    /* @__PURE__ */ React3__namespace.createElement(DebugRow, null, /* @__PURE__ */ React3__namespace.createElement(Text, null, "At end:"), /* @__PURE__ */ React3__namespace.createElement(Text, null, String(state.isAtEnd))),
    /* @__PURE__ */ React3__namespace.createElement(DebugRow, null, /* @__PURE__ */ React3__namespace.createElement(Text, null, "ScrollAdjust:"), /* @__PURE__ */ React3__namespace.createElement(Text, null, scrollAdjust.toFixed(2))),
    /* @__PURE__ */ React3__namespace.createElement(DebugRow, null, /* @__PURE__ */ React3__namespace.createElement(Text, null, "RawScroll: "), /* @__PURE__ */ React3__namespace.createElement(Text, null, rawScroll.toFixed(2))),
    /* @__PURE__ */ React3__namespace.createElement(DebugRow, null, /* @__PURE__ */ React3__namespace.createElement(Text, null, "ComputedScroll: "), /* @__PURE__ */ React3__namespace.createElement(Text, null, scroll.toFixed(2)))
  );
});
function useInterval(callback, delay) {
  React3.useEffect(() => {
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
var typedForwardRef = React3.forwardRef;
var typedMemo = React3.memo;

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
  const numContainers = peek$(ctx, "numContainers");
  for (let i = 0; i < numContainers; i++) {
    const itemKey = peek$(ctx, `containerItemKey${i}`);
    if (itemKey === key) {
      return i;
    }
  }
  return -1;
}

// src/components/PositionView.tsx
var PositionViewState = typedMemo(function PositionViewState2({
  id,
  horizontal,
  style,
  refView,
  ...props
}) {
  const [position = POSITION_OUT_OF_VIEW] = useArr$([`containerPosition${id}`]);
  const base = {
    contain: "paint layout style"
  };
  const composed = isArray(style) ? Object.assign({}, ...style) : style;
  const combinedStyle = horizontal ? { ...base, ...composed, left: position } : { ...base, ...composed, top: position };
  const { animatedScrollY, stickyOffset, onLayout, ...webProps } = props;
  return /* @__PURE__ */ React3__namespace.createElement("div", { ref: refView, ...webProps, style: combinedStyle });
});
var PositionViewSticky = typedMemo(function PositionViewSticky2({
  id,
  horizontal,
  style,
  refView,
  index,
  stickyOffset,
  animatedScrollY: _animatedScrollY,
  children,
  ...rest
}) {
  const [position = POSITION_OUT_OF_VIEW, headerSize = 0, activeStickyIndex] = useArr$([
    `containerPosition${id}`,
    "headerSize",
    "activeStickyIndex"
  ]);
  const base = {
    contain: "paint layout style"
  };
  const composed = React3__namespace.useMemo(
    () => {
      var _a3;
      return (_a3 = isArray(style) ? Object.assign({}, ...style) : style) != null ? _a3 : {};
    },
    [style]
  );
  const viewStyle = React3__namespace.useMemo(() => {
    var _a3;
    const styleBase = { ...base, ...composed };
    delete styleBase.transform;
    const offset = (_a3 = stickyOffset != null ? stickyOffset : headerSize) != null ? _a3 : 0;
    const isActive = activeStickyIndex === index;
    styleBase.position = isActive ? "sticky" : "absolute";
    styleBase.zIndex = index + 1e3;
    if (horizontal) {
      styleBase.left = isActive ? offset : position;
    } else {
      styleBase.top = isActive ? offset : position;
    }
    return styleBase;
  }, [composed, horizontal, position, index, stickyOffset, headerSize, activeStickyIndex]);
  return /* @__PURE__ */ React3__namespace.createElement("div", { ref: refView, style: viewStyle, ...rest }, children);
});
var PositionView = PositionViewState;

// src/constants-platform.ts
var IsNewArchitecture = true;
function useInit(cb) {
  React3.useState(() => cb());
}

// src/state/ContextContainer.ts
var ContextContainer = React3.createContext(null);
function useContextContainer() {
  return React3.useContext(ContextContainer);
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
  React3.useEffect(() => {
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
  React3.useEffect(() => {
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
  const prevValues = React3.useRef({
    prevIndex: void 0,
    prevItem: void 0
  });
  React3.useEffect(() => {
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
  const [stateValue, setStateValue] = React3.useState(() => {
    return computeValue(containerContext);
  });
  const prevItemKeyRef = React3.useRef((_a3 = containerContext == null ? void 0 : containerContext.itemKey) != null ? _a3 : null);
  const currentItemKey = (_b = containerContext == null ? void 0 : containerContext.itemKey) != null ? _b : null;
  if (currentItemKey !== null && prevItemKeyRef.current !== currentItemKey) {
    prevItemKeyRef.current = currentItemKey;
    setStateValue(computeValue(containerContext));
  }
  const triggerLayout = containerContext == null ? void 0 : containerContext.triggerLayout;
  const setState = React3.useCallback(
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
  if (containerContext) {
    const { triggerLayout: syncLayout } = containerContext;
    return syncLayout;
  } else {
    return noop;
  }
}

// src/components/Separator.tsx
function Separator({ ItemSeparatorComponent, leadingItem }) {
  const isLastItem = useIsLastItem();
  return isLastItem ? null : /* @__PURE__ */ React3__namespace.createElement(ItemSeparatorComponent, { leadingItem });
}

// src/hooks/createResizeObserver.ts
var globalResizeObserver = null;
function getGlobalResizeObserver() {
  if (!globalResizeObserver) {
    globalResizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const callbacks = callbackMap.get(entry.target);
        if (callbacks) {
          for (const callback of callbacks) {
            callback(entry);
          }
        }
      }
    });
  }
  return globalResizeObserver;
}
var callbackMap = /* @__PURE__ */ new WeakMap();
function createResizeObserver(element, callback) {
  if (typeof ResizeObserver === "undefined") {
    return () => {
    };
  }
  if (!element) {
    return () => {
    };
  }
  const observer = getGlobalResizeObserver();
  let callbacks = callbackMap.get(element);
  if (!callbacks) {
    callbacks = /* @__PURE__ */ new Set();
    callbackMap.set(element, callbacks);
    observer.observe(element);
  }
  callbacks.add(callback);
  return () => {
    if (callbacks) {
      callbacks.delete(callback);
      if (callbacks.size === 0) {
        callbackMap.delete(element);
        observer.unobserve(element);
      }
    }
  };
}

// src/hooks/useOnLayoutSync.tsx
function useOnLayoutSync({
  ref,
  onLayoutProp,
  onLayoutChange
}, deps) {
  React3.useLayoutEffect(() => {
    var _a3, _b;
    const current = ref.current;
    const scrollableNode = (_b = (_a3 = current == null ? void 0 : current.getScrollableNode) == null ? void 0 : _a3.call(current)) != null ? _b : null;
    const element = scrollableNode || current;
    if (!element) {
      return;
    }
    const emit = (layout, fromLayoutEffect) => {
      if (layout.height === 0 && layout.width === 0) {
        return;
      }
      onLayoutChange(layout, fromLayoutEffect);
      onLayoutProp == null ? void 0 : onLayoutProp({ nativeEvent: { layout } });
    };
    const rect = element.getBoundingClientRect();
    emit(toLayout(rect), true);
    let prevRect = rect;
    return createResizeObserver(element, (entry) => {
      var _a4;
      const target = entry.target instanceof HTMLElement ? entry.target : void 0;
      const rectObserved = (_a4 = entry.contentRect) != null ? _a4 : target == null ? void 0 : target.getBoundingClientRect();
      if (rectObserved.width !== prevRect.width || rectObserved.height !== prevRect.height) {
        prevRect = rectObserved;
        emit(toLayout(rectObserved), false);
      }
    });
  }, deps || []);
  return {};
}
function toLayout(rect) {
  if (!rect) {
    return { height: 0, width: 0, x: 0, y: 0 };
  }
  return {
    height: rect.height,
    width: rect.width,
    x: rect.left,
    y: rect.top
  };
}

// src/components/Container.tsx
var Container = typedMemo(function Container2({
  id,
  recycleItems,
  horizontal,
  getRenderedItem: getRenderedItem2,
  updateItemSize: updateItemSize2,
  ItemSeparatorComponent
}) {
  const ctx = useStateContext();
  const { columnWrapperStyle, animatedScrollY } = ctx;
  const [column = 0, data, itemKey, numColumns, extraData, isSticky, stickyOffset] = useArr$([
    `containerColumn${id}`,
    `containerItemData${id}`,
    `containerItemKey${id}`,
    "numColumns",
    "extraData",
    `containerSticky${id}`,
    `containerStickyOffset${id}`
  ]);
  const itemLayoutRef = React3.useRef({
    horizontal,
    itemKey,
    updateItemSize: updateItemSize2
  });
  itemLayoutRef.current.horizontal = horizontal;
  itemLayoutRef.current.itemKey = itemKey;
  itemLayoutRef.current.updateItemSize = updateItemSize2;
  const ref = React3.useRef(null);
  const [layoutRenderCount, forceLayoutRender] = React3.useState(0);
  const otherAxisPos = numColumns > 1 ? `${(column - 1) / numColumns * 100}%` : 0;
  const otherAxisSize = numColumns > 1 ? `${1 / numColumns * 100}%` : void 0;
  const didLayoutRef = React3.useRef(false);
  const style = React3.useMemo(() => {
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
  const renderedItemInfo = React3.useMemo(
    () => itemKey !== void 0 ? getRenderedItem2(itemKey) : null,
    [itemKey, data, extraData]
  );
  const { index, renderedItem } = renderedItemInfo || {};
  const contextValue = React3.useMemo(() => {
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
  const onLayoutChange = React3.useCallback((rectangle) => {
    const {
      horizontal: currentHorizontal,
      itemKey: currentItemKey,
      updateItemSize: updateItemSizeFn
    } = itemLayoutRef.current;
    if (isNullOrUndefined(currentItemKey)) {
      return;
    }
    didLayoutRef.current = true;
    let layout = rectangle;
    roundSize(rectangle[currentHorizontal ? "width" : "height"]);
    const doUpdate = () => {
      itemLayoutRef.current.lastSize = { height: layout.height, width: layout.width };
      updateItemSizeFn(currentItemKey, layout);
      didLayoutRef.current = true;
    };
    {
      doUpdate();
    }
  }, []);
  const { onLayout } = useOnLayoutSync(
    {
      onLayoutChange,
      ref
    },
    [itemKey, layoutRenderCount]
  );
  const PositionComponent = isSticky ? PositionViewSticky : PositionView;
  return /* @__PURE__ */ React3__namespace.createElement(
    PositionComponent,
    {
      animatedScrollY: isSticky ? animatedScrollY : void 0,
      horizontal,
      id,
      index,
      key: recycleItems ? void 0 : itemKey,
      onLayout,
      refView: ref,
      stickyOffset: isSticky ? stickyOffset : void 0,
      style
    },
    /* @__PURE__ */ React3__namespace.createElement(ContextContainer.Provider, { value: contextValue }, renderedItem, renderedItemInfo && ItemSeparatorComponent && /* @__PURE__ */ React3__namespace.createElement(Separator, { ItemSeparatorComponent, leadingItem: renderedItemInfo.item }))
  );
});

// src/platform/Platform.ts
var Platform = {
  // Widen the type to avoid unreachable-branch lints in cross-platform code that compares against other OSes
  OS: "web"
};

// src/utils/reordering.ts
var mapFn = (element) => {
  const indexStr = element.getAttribute("index");
  return [element, indexStr === null ? null : parseInt(indexStr)];
};
function sortDOMElements(container) {
  const elements = Array.from(container.children);
  if (elements.length <= 1) return elements;
  const items = elements.map(mapFn);
  items.sort((a, b) => {
    const aKey = a[1];
    const bKey = b[1];
    if (aKey === null) {
      return 1;
    }
    if (bKey === null) {
      return -1;
    }
    return aKey - bKey;
  });
  const targetPositions = /* @__PURE__ */ new Map();
  items.forEach((item, index) => {
    targetPositions.set(item[0], index);
  });
  const currentPositions = elements.map((el) => targetPositions.get(el));
  const lis = findLIS(currentPositions);
  const stableIndices = new Set(lis);
  for (let targetPos = 0; targetPos < items.length; targetPos++) {
    const element = items[targetPos][0];
    const currentPos = elements.indexOf(element);
    if (!stableIndices.has(currentPos)) {
      let nextStableElement = null;
      for (let i = targetPos + 1; i < items.length; i++) {
        const nextEl = items[i][0];
        const nextCurrentPos = elements.indexOf(nextEl);
        if (stableIndices.has(nextCurrentPos)) {
          nextStableElement = nextEl;
          break;
        }
      }
      if (nextStableElement) {
        container.insertBefore(element, nextStableElement);
      } else {
        container.appendChild(element);
      }
    }
  }
}
function findLIS(arr) {
  const n = arr.length;
  const tails = [];
  const predecessors = new Array(n).fill(-1);
  const indices = [];
  for (let i = 0; i < n; i++) {
    const num = arr[i];
    let left = 0, right = tails.length;
    while (left < right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[indices[mid]] < num) {
        left = mid + 1;
      } else {
        right = mid;
      }
    }
    if (left === tails.length) {
      tails.push(num);
      indices.push(i);
    } else {
      tails[left] = num;
      indices[left] = i;
    }
    if (left > 0) {
      predecessors[i] = indices[left - 1];
    }
  }
  const result = [];
  let k = indices[indices.length - 1];
  while (k !== -1) {
    result.unshift(k);
    k = predecessors[k];
  }
  return result;
}

// src/hooks/useDOMOrder.ts
function useDOMOrder(ref) {
  const ctx = useStateContext();
  const debounceRef = React3.useRef(void 0);
  React3.useEffect(() => {
    const unsubscribe = listen$(ctx, "lastPositionUpdate", () => {
      if (debounceRef.current !== void 0) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        const parent = ref.current;
        if (parent) {
          sortDOMElements(parent);
        }
        debounceRef.current = void 0;
      }, 500);
    });
    return () => {
      unsubscribe();
      if (debounceRef.current !== void 0) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [ctx]);
}

// src/components/Containers.tsx
var ContainersInner = typedMemo(function ContainersInner2({ horizontal, numColumns, children }) {
  const ref = React3.useRef(null);
  const ctx = useStateContext();
  const columnWrapperStyle = ctx.columnWrapperStyle;
  const [totalSize, otherAxisSize] = useArr$(["totalSize", "otherAxisSize"]);
  useDOMOrder(ref);
  const style = horizontal ? { minHeight: otherAxisSize, position: "relative", width: totalSize } : { height: totalSize, minWidth: otherAxisSize, position: "relative" };
  if (columnWrapperStyle && numColumns > 1) {
    const { columnGap, rowGap, gap } = columnWrapperStyle;
    const gapX = columnGap || gap || 0;
    const gapY = rowGap || gap || 0;
    if (horizontal) {
      if (gapY) {
        style.marginTop = style.marginBottom = -gapY / 2;
      }
      if (gapX) {
        style.marginRight = -gapX;
      }
    } else {
      if (gapX) {
        style.marginLeft = style.marginRight = -gapX;
      }
      if (gapY) {
        style.marginBottom = -gapY;
      }
    }
  }
  return /* @__PURE__ */ React3__namespace.createElement("div", { ref, style }, children);
});
var Containers = typedMemo(function Containers2({
  horizontal,
  recycleItems,
  ItemSeparatorComponent,
  waitForInitialLayout,
  updateItemSize: updateItemSize2,
  getRenderedItem: getRenderedItem2
}) {
  const [numContainers, numColumns] = useArr$(["numContainersPooled", "numColumns"]);
  const containers = [];
  for (let i = 0; i < numContainers; i++) {
    containers.push(
      /* @__PURE__ */ React3__namespace.createElement(
        Container,
        {
          getRenderedItem: getRenderedItem2,
          horizontal,
          ItemSeparatorComponent,
          id: i,
          key: i,
          recycleItems,
          updateItemSize: updateItemSize2
        }
      )
    );
  }
  return /* @__PURE__ */ React3__namespace.createElement(ContainersInner, { horizontal, numColumns, waitForInitialLayout }, containers);
});
function DevNumbers() {
  return IS_DEV && // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  React3__namespace.memo(function DevNumbers2() {
    return Array.from({ length: 100 }).map((_, index) => /* @__PURE__ */ React3__namespace.createElement(
      "div",
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
      /* @__PURE__ */ React3__namespace.createElement("div", { style: { color: "red" } }, index * 100)
    ));
  });
}

// src/platform/StyleSheet.tsx
function flattenStyles(styles) {
  if (isArray(styles)) {
    return Object.assign({}, ...styles.filter(Boolean));
  }
  return styles;
}
var StyleSheet = {
  create: (styles) => styles,
  flatten: (style) => flattenStyles(style)
};

// src/components/ListComponentScrollView.tsx
var ListComponentScrollView = React3.forwardRef(function ListComponentScrollView2({
  children,
  style,
  contentContainerStyle,
  horizontal = false,
  contentOffset,
  maintainVisibleContentPosition,
  onScroll: onScroll2,
  onMomentumScrollEnd,
  showsHorizontalScrollIndicator = true,
  showsVerticalScrollIndicator = true,
  refreshControl,
  onLayout,
  ...props
}, ref) {
  const scrollRef = React3.useRef(null);
  const contentRef = React3.useRef(null);
  React3.useImperativeHandle(ref, () => {
    const api = {
      getBoundingClientRect: () => {
        var _a3;
        return (_a3 = scrollRef.current) == null ? void 0 : _a3.getBoundingClientRect();
      },
      getScrollableNode: () => scrollRef.current,
      getScrollResponder: () => scrollRef.current,
      scrollBy: (x, y) => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy(x, y);
      },
      scrollTo: (options) => {
        const el = scrollRef.current;
        if (!el) return;
        const { x = 0, y = 0, animated = true } = options;
        el.scrollTo({ behavior: animated ? "smooth" : "auto", left: x, top: y });
      },
      scrollToEnd: (options = {}) => {
        const el = scrollRef.current;
        if (!el) return;
        const { animated = true } = options;
        if (horizontal) {
          el.scrollTo({ behavior: animated ? "smooth" : "auto", left: el.scrollWidth });
        } else {
          el.scrollTo({ behavior: animated ? "smooth" : "auto", top: el.scrollHeight });
        }
      },
      scrollToOffset: (params) => {
        const el = scrollRef.current;
        if (!el) return;
        const { offset, animated = true } = params;
        if (horizontal) {
          el.scrollTo({ behavior: animated ? "smooth" : "auto", left: offset });
        } else {
          el.scrollTo({ behavior: animated ? "smooth" : "auto", top: offset });
        }
      }
    };
    return api;
  }, [horizontal]);
  const handleScroll = React3.useCallback(
    (event) => {
      if (!onScroll2 || !(event == null ? void 0 : event.target)) {
        return;
      }
      const target = event.target;
      const scrollEvent = {
        nativeEvent: {
          contentOffset: {
            x: target.scrollLeft,
            y: target.scrollTop
          },
          contentSize: {
            height: target.scrollHeight,
            width: target.scrollWidth
          },
          layoutMeasurement: {
            height: target.clientHeight,
            width: target.clientWidth
          }
        }
      };
      onScroll2(scrollEvent);
    },
    [onScroll2, onMomentumScrollEnd]
  );
  React3.useLayoutEffect(() => {
    const element = scrollRef.current;
    if (!element) return;
    element.addEventListener("scroll", handleScroll);
    return () => {
      element.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);
  React3.useEffect(() => {
    const doScroll = () => {
      if (contentOffset && scrollRef.current) {
        scrollRef.current.scrollLeft = contentOffset.x || 0;
        scrollRef.current.scrollTop = contentOffset.y || 0;
      }
    };
    doScroll();
    requestAnimationFrame(doScroll);
  }, [contentOffset == null ? void 0 : contentOffset.x, contentOffset == null ? void 0 : contentOffset.y]);
  React3.useLayoutEffect(() => {
    if (!onLayout || !scrollRef.current) return;
    const element = scrollRef.current;
    const fireLayout = () => {
      const rect = element.getBoundingClientRect();
      onLayout({
        nativeEvent: {
          layout: {
            height: rect.height,
            width: rect.width,
            x: rect.left,
            y: rect.top
          }
        }
      });
    };
    fireLayout();
    const resizeObserver = new ResizeObserver(() => {
      fireLayout();
    });
    resizeObserver.observe(element);
    return () => resizeObserver.disconnect();
  }, [onLayout]);
  const scrollViewStyle = {
    overflow: "auto",
    overflowX: horizontal ? "auto" : showsHorizontalScrollIndicator ? "auto" : "hidden",
    overflowY: horizontal ? showsVerticalScrollIndicator ? "auto" : "hidden" : "auto",
    position: "relative",
    // Ensure proper positioning context
    WebkitOverflowScrolling: "touch",
    // iOS momentum scrolling
    ...StyleSheet.flatten(style)
  };
  const contentStyle = {
    display: horizontal ? "flex" : "block",
    flexDirection: horizontal ? "row" : void 0,
    minHeight: horizontal ? void 0 : "100%",
    minWidth: horizontal ? "100%" : void 0,
    ...StyleSheet.flatten(contentContainerStyle)
  };
  const { contentInset, scrollEventThrottle, ScrollComponent, ...webProps } = props;
  return /* @__PURE__ */ React3__namespace.createElement("div", { ref: scrollRef, ...webProps, style: scrollViewStyle }, refreshControl, /* @__PURE__ */ React3__namespace.createElement("div", { ref: contentRef, style: contentStyle }, children));
});
function Padding() {
  const [paddingTop] = useArr$(["alignItemsPaddingTop"]);
  return /* @__PURE__ */ React3__namespace.createElement("div", { style: { paddingTop } });
}
function PaddingDevMode() {
  const [paddingTop] = useArr$(["alignItemsPaddingTop"]);
  return /* @__PURE__ */ React3__namespace.createElement(React3__namespace.Fragment, null, /* @__PURE__ */ React3__namespace.createElement("div", { style: { paddingTop } }), /* @__PURE__ */ React3__namespace.createElement(
    "div",
    {
      style: {
        backgroundColor: "green",
        height: paddingTop,
        left: 0,
        position: "absolute",
        right: 0,
        top: 0
      }
    }
  ));
}
function useValueListener$(key, callback) {
  const ctx = useStateContext();
  React3.useLayoutEffect(() => {
    const unsubscribe = listen$(ctx, key, (value) => {
      callback(value);
    });
    return unsubscribe;
  }, [callback, ctx, key]);
}

// src/components/ScrollAdjust.tsx
function ScrollAdjust() {
  const ctx = useStateContext();
  const lastScrollOffsetRef = React3__namespace.useRef(0);
  const callback = React3__namespace.useCallback(() => {
    var _a3;
    const scrollAdjust = peek$(ctx, "scrollAdjust");
    const scrollAdjustUserOffset = peek$(ctx, "scrollAdjustUserOffset");
    const scrollOffset = (scrollAdjust || 0) + (scrollAdjustUserOffset || 0);
    const scrollView = (_a3 = ctx.state) == null ? void 0 : _a3.refScroller.current;
    if (scrollView && scrollOffset !== lastScrollOffsetRef.current) {
      const scrollDelta = scrollOffset - lastScrollOffsetRef.current;
      if (scrollDelta !== 0) {
        const el = scrollView.getScrollableNode();
        const prevScroll = el.scrollTop;
        const nextScroll = prevScroll + scrollDelta;
        const totalSize = el.scrollHeight;
        if (scrollDelta > 0 && !ctx.state.adjustingFromInitialMount && totalSize < nextScroll + el.clientHeight) {
          const child = el.firstElementChild;
          const prevPaddingBottom = child.style.paddingBottom;
          const pad = (nextScroll + el.clientHeight - totalSize) * 2;
          child.style.paddingBottom = `${pad}px`;
          void el.offsetHeight;
          scrollView.scrollBy(0, scrollDelta);
          requestAnimationFrame(() => {
            child.style.paddingBottom = prevPaddingBottom;
          });
        } else {
          scrollView.scrollBy(0, scrollDelta);
        }
      }
      lastScrollOffsetRef.current = scrollOffset;
    }
  }, [ctx]);
  useValueListener$("scrollAdjust", callback);
  useValueListener$("scrollAdjustUserOffset", callback);
  return null;
}
function SnapWrapper({ ScrollComponent, ...props }) {
  const [snapToOffsets] = useArr$(["snapToOffsets"]);
  return /* @__PURE__ */ React3__namespace.createElement(ScrollComponent, { ...props, snapToOffsets });
}
var LayoutView = ({ onLayoutChange, refView, children, ...rest }) => {
  const ref = refView != null ? refView : React3.useRef();
  useOnLayoutSync({ onLayoutChange, ref });
  return /* @__PURE__ */ React3__namespace.createElement("div", { ...rest, ref }, children);
};

// src/components/ListComponent.tsx
var getComponent = (Component) => {
  if (React3__namespace.isValidElement(Component)) {
    return Component;
  }
  if (Component) {
    return /* @__PURE__ */ React3__namespace.createElement(Component, null);
  }
  return null;
};
var ListComponent = typedMemo(function ListComponent2({
  canRender,
  style,
  contentContainerStyle,
  horizontal,
  initialContentOffset,
  recycleItems,
  ItemSeparatorComponent,
  alignItemsAtEnd,
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
  stickyHeaderIndices,
  ...rest
}) {
  const ctx = useStateContext();
  const maintainVisibleContentPosition = ctx.state.props.maintainVisibleContentPosition;
  const ScrollComponent = renderScrollComponent ? React3.useMemo(
    () => React3__namespace.forwardRef((props, ref) => renderScrollComponent({ ...props, ref })),
    [renderScrollComponent]
  ) : ListComponentScrollView;
  const SnapOrScroll = snapToIndices ? SnapWrapper : ScrollComponent;
  return /* @__PURE__ */ React3__namespace.createElement(
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
    /* @__PURE__ */ React3__namespace.createElement(ScrollAdjust, null),
    ENABLE_DEVMODE ? /* @__PURE__ */ React3__namespace.createElement(PaddingDevMode, null) : /* @__PURE__ */ React3__namespace.createElement(Padding, null),
    ListHeaderComponent && /* @__PURE__ */ React3__namespace.createElement(LayoutView, { onLayoutChange: onLayoutHeader, style: ListHeaderComponentStyle }, getComponent(ListHeaderComponent)),
    ListEmptyComponent && getComponent(ListEmptyComponent),
    canRender && !ListEmptyComponent && /* @__PURE__ */ React3__namespace.createElement(
      Containers,
      {
        getRenderedItem: getRenderedItem2,
        horizontal,
        ItemSeparatorComponent,
        recycleItems,
        updateItemSize: updateItemSize2,
        waitForInitialLayout
      }
    ),
    ListFooterComponent && /* @__PURE__ */ React3__namespace.createElement(
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
    IS_DEV && ENABLE_DEVMODE && /* @__PURE__ */ React3__namespace.createElement(DevNumbers, null)
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

// src/utils/setPaddingTop.ts
function setPaddingTop(ctx, { stylePaddingTop, alignItemsPaddingTop }) {
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
  if (alignItemsPaddingTop !== void 0) {
    set$(ctx, "alignItemsPaddingTop", alignItemsPaddingTop);
  }
}

// src/utils/updateAlignItemsPaddingTop.ts
function updateAlignItemsPaddingTop(ctx) {
  const state = ctx.state;
  const {
    scrollLength,
    props: { alignItemsAtEnd, data }
  } = state;
  if (alignItemsAtEnd) {
    let alignItemsPaddingTop = 0;
    if ((data == null ? void 0 : data.length) > 0) {
      const contentSize = getContentSize(ctx);
      alignItemsPaddingTop = Math.max(0, Math.floor(scrollLength - contentSize));
    }
    setPaddingTop(ctx, { alignItemsPaddingTop });
  }
}

// src/core/addTotalSize.ts
function addTotalSize(ctx, key, add) {
  const state = ctx.state;
  const { alignItemsAtEnd } = state.props;
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
    {
      state.pendingTotalSize = void 0;
      state.totalSize = totalSize;
      set$(ctx, "totalSize", totalSize);
      if (alignItemsAtEnd) {
        updateAlignItemsPaddingTop(ctx);
      }
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
  var _a3, _b;
  const state = ctx.state;
  const {
    sizesKnown,
    sizes,
    sizeInvalidationKeys,
    averageSizes,
    props: { estimatedItemSize, getEstimatedItemSize, getItemSizeInvalidationKey, getFixedItemSize, getItemType },
    scrollingTo
  } = state;
  const itemType = getItemType ? (_a3 = getItemType(data, index)) != null ? _a3 : "" : "";
  if (getItemSizeInvalidationKey) {
    const currentInvalidationKey = getItemSizeInvalidationKey(index, data, itemType);
    if (currentInvalidationKey !== void 0) {
      const cachedInvalidationKey = sizeInvalidationKeys.get(key);
      if (cachedInvalidationKey !== void 0 && cachedInvalidationKey !== currentInvalidationKey) {
        console.log(
          `[getItemSize] Invalidation key changed for ${key}: ${cachedInvalidationKey} \u2192 ${currentInvalidationKey}, forcing remeasurement`
        );
        sizesKnown.delete(key);
        sizes.delete(key);
        sizeInvalidationKeys.set(key, currentInvalidationKey);
        state.hasInvalidationChanges = true;
        console.log(`[getItemSize] hasInvalidationChanges set to TRUE for key: ${key}`);
      }
    }
  }
  const sizeKnown = sizesKnown.get(key);
  if (sizeKnown !== void 0) {
    console.log(`[getItemSize] Using sizesKnown cache for ${key}: ${sizeKnown}px`);
    return sizeKnown;
  }
  let size;
  if (preferCachedSize) {
    const cachedSize = sizes.get(key);
    if (cachedSize !== void 0) {
      console.log(`[getItemSize] Using sizes cache for ${key}: ${cachedSize}px (preferCachedSize=true)`);
      return cachedSize;
    }
  }
  if (getFixedItemSize) {
    size = getFixedItemSize(index, data, itemType);
    if (size !== void 0) {
      sizesKnown.set(key, size);
    }
  }
  if (size === void 0 && useAverageSize && sizeKnown === void 0 && !scrollingTo) {
    const averageSizeForType = (_b = averageSizes[itemType]) == null ? void 0 : _b.avg;
    if (averageSizeForType !== void 0) {
      size = roundSize(averageSizeForType);
    }
  }
  if (size === void 0) {
    size = sizes.get(key);
    if (size !== void 0) {
      return size;
    }
  }
  if (size === void 0) {
    size = getEstimatedItemSize ? getEstimatedItemSize(index, data, itemType) : estimatedItemSize;
    console.log(`[getItemSize] Calculated new size for ${key}: ${size}px (via ${getEstimatedItemSize ? "getEstimatedItemSize" : "estimatedItemSize"})`);
  }
  setSize(ctx, key, size);
  if (getItemSizeInvalidationKey) {
    const currentInvalidationKey = getItemSizeInvalidationKey(index, data, itemType);
    if (currentInvalidationKey !== void 0) {
      const existingKey = sizeInvalidationKeys.get(key);
      if (existingKey === void 0) {
        console.log(`[getItemSize] Storing initial invalidation key for ${key}: ${currentInvalidationKey}`);
      }
      sizeInvalidationKeys.set(key, currentInvalidationKey);
    }
  }
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
  if (Number.isFinite(contentSize) && Number.isFinite(state.scrollLength)) {
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
  var _a3, _b;
  const state = ctx.state;
  if (state == null ? void 0 : state.scrollingTo) {
    state.scrollHistory.length = 0;
    state.initialScroll = void 0;
    state.initialAnchor = void 0;
    state.scrollingTo = void 0;
    if (state.pendingTotalSize !== void 0) {
      addTotalSize(ctx, null, state.pendingTotalSize);
    }
    if ((_a3 = state.props) == null ? void 0 : _a3.data) {
      (_b = state.triggerCalculateItemsInView) == null ? void 0 : _b.call(state, { forceFullItemPositions: true });
    }
    {
      state.scrollAdjustHandler.commitPendingAdjust();
    }
    setInitialRenderState(ctx, { didInitialScroll: true });
  }
}

// src/core/doScrollTo.ts
var SCROLL_END_IDLE_MS = 80;
var SCROLL_END_MAX_MS = 1500;
var SMOOTH_SCROLL_DURATION_MS = 320;
function doScrollTo(ctx, params) {
  const state = ctx.state;
  const { animated, horizontal, offset } = params;
  const scroller = state.refScroller.current;
  const node = typeof (scroller == null ? void 0 : scroller.getScrollableNode) === "function" ? scroller.getScrollableNode() : scroller;
  if (node) {
    const left = horizontal ? offset : 0;
    const top = horizontal ? 0 : offset;
    node.scrollTo({ behavior: animated ? "smooth" : "auto", left, top });
    if (animated) {
      listenForScrollEnd(ctx, node);
    } else {
      state.scroll = offset;
      setTimeout(() => {
        finishScrollTo(ctx);
      }, 100);
    }
  }
}
function listenForScrollEnd(ctx, node) {
  const supportsScrollEnd = "onscrollend" in node;
  let idleTimeout;
  let maxTimeout;
  let settled = false;
  const targetToken = ctx.state.scrollingTo;
  const finish = () => {
    if (settled) return;
    settled = true;
    cleanup();
    if (targetToken === ctx.state.scrollingTo) {
      finishScrollTo(ctx);
    }
  };
  const onScroll2 = () => {
    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
    idleTimeout = setTimeout(finish, SCROLL_END_IDLE_MS);
  };
  const cleanup = () => {
    if (supportsScrollEnd) {
      node.removeEventListener("scrollend", finish);
    } else {
      node.removeEventListener("scroll", onScroll2);
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
    node.addEventListener("scroll", onScroll2);
    idleTimeout = setTimeout(finish, SMOOTH_SCROLL_DURATION_MS);
    maxTimeout = setTimeout(finish, SCROLL_END_MAX_MS);
  }
  return cleanup;
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
  if (forceScroll || !isInitialScroll || Platform.OS === "android") {
    doScrollTo(ctx, { animated, horizontal, isInitialScroll, offset });
  } else {
    state.scroll = offset;
  }
}

// src/utils/checkThreshold.ts
var HYSTERESIS_MULTIPLIER = 1.3;
var checkThreshold = (distance, atThreshold, threshold, wasReached, snapshot, context, onReached, setSnapshot) => {
  const absDistance = Math.abs(distance);
  const within = atThreshold || threshold > 0 && absDistance <= threshold;
  if (wasReached === null) {
    if (!within && distance >= 0) {
      return false;
    }
    return null;
  }
  const updateSnapshot = () => {
    setSnapshot == null ? void 0 : setSnapshot({
      atThreshold,
      contentSize: context.contentSize,
      dataLength: context.dataLength,
      scrollPosition: context.scrollPosition
    });
  };
  if (!wasReached) {
    if (!within) {
      return false;
    }
    onReached == null ? void 0 : onReached(distance);
    updateSnapshot();
    return true;
  }
  const reset = !atThreshold && threshold > 0 && absDistance >= threshold * HYSTERESIS_MULTIPLIER || !atThreshold && threshold <= 0 && absDistance > 0;
  if (reset) {
    setSnapshot == null ? void 0 : setSnapshot(void 0);
    return false;
  }
  if (within) {
    const changed = !snapshot || snapshot.atThreshold !== atThreshold || snapshot.contentSize !== context.contentSize || snapshot.dataLength !== context.dataLength;
    if (changed) {
      onReached == null ? void 0 : onReached(distance);
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
    queuedInitialLayout,
    scrollLength,
    scroll,
    maintainingScrollAtEnd,
    props: { maintainScrollAtEndThreshold, onEndReachedThreshold }
  } = state;
  const contentSize = getContentSize(ctx);
  if (contentSize > 0 && queuedInitialLayout && !maintainingScrollAtEnd) {
    const distanceFromEnd = contentSize - scroll - scrollLength;
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
        return (_b = (_a4 = state.props).onEndReached) == null ? void 0 : _b.call(_a4, { distanceFromEnd: distance });
      },
      (snapshot) => {
        state.endReachedSnapshot = snapshot;
      }
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
      return (_b = (_a4 = state.props).onStartReached) == null ? void 0 : _b.call(_a4, { distanceFromStart: distance });
    },
    (snapshot) => {
      state.startReachedSnapshot = snapshot;
    }
  );
}

// src/core/updateScroll.ts
function updateScroll(ctx, newScroll, forceUpdate) {
  var _a3;
  const state = ctx.state;
  const { scrollingTo, scrollAdjustHandler, lastScrollAdjustForHistory } = state;
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
  state.scrollPrev = state.scroll;
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
  const lastCalculated = state.scrollLastCalculate;
  const shouldUpdate = state.dataChangeNeedsScrollUpdate || state.scrollLastCalculate === void 0 || lastCalculated === void 0 || Math.abs(state.scroll - lastCalculated) > 2;
  if (shouldUpdate) {
    state.scrollLastCalculate = state.scroll;
    state.ignoreScrollFromMVCPIgnored = false;
    (_a3 = state.triggerCalculateItemsInView) == null ? void 0 : _a3.call(state, { doMVCP: scrollingTo !== void 0 });
    checkAtBottom(ctx);
    checkAtTop(state);
    state.dataChangeNeedsScrollUpdate = false;
  }
}

// src/utils/requestAdjust.ts
function requestAdjust(ctx, positionDiff, dataChanged) {
  const state = ctx.state;
  if (Math.abs(positionDiff) > 0.1) {
    const needsScrollWorkaround = Platform.OS === "android";
    const doit = () => {
      {
        state.scrollAdjustHandler.requestAdjust(positionDiff);
        if (state.adjustingFromInitialMount) {
          state.adjustingFromInitialMount--;
        }
      }
    };
    state.scroll += positionDiff;
    state.scrollForNextCalculateItemsInView = void 0;
    const readyToRender = peek$(ctx, "readyToRender");
    console.log(
      `[MVCP] Applying scroll adjustment | adjustment=${positionDiff.toFixed(1)}px newScroll=${state.scroll.toFixed(1)}px | needsWorkaround=${needsScrollWorkaround} readyToRender=${readyToRender}`
    );
    if (readyToRender) {
      doit();
    } else {
      state.adjustingFromInitialMount = (state.adjustingFromInitialMount || 0) + 1;
      requestAnimationFrame(doit);
    }
  }
}

// src/core/mvcp.ts
function prepareMVCP(ctx, dataChanged) {
  const state = ctx.state;
  const { idsInView, positions, props } = state;
  const {
    maintainVisibleContentPosition: { data: mvcpData, size: mvcpScroll }
  } = props;
  const scrollingTo = state.scrollingTo;
  let prevPosition;
  let targetId;
  const idsInViewWithPositions = [];
  const scrollTarget = scrollingTo == null ? void 0 : scrollingTo.index;
  const scrollingToViewPosition = scrollingTo == null ? void 0 : scrollingTo.viewPosition;
  const shouldMVCP = dataChanged ? mvcpData : mvcpScroll;
  const indexByKey = state.indexByKey;
  console.log(
    `[MVCP] prepareMVCP called | dataChanged=${dataChanged} shouldMVCP=${shouldMVCP} (mvcpData=${mvcpData}, mvcpScroll=${mvcpScroll}) | hasInvalidationChanges=${state.hasInvalidationChanges} | scrollingTo=${scrollTarget !== void 0 ? `index ${scrollTarget}` : "none"} | idsInView=${idsInView.length} items`
  );
  if (shouldMVCP) {
    if (scrollTarget !== void 0) {
      targetId = getId(state, scrollTarget);
    } else if (idsInView.length > 0 && state.didContainersLayout) {
      if (dataChanged) {
        for (let i = 0; i < idsInView.length; i++) {
          const id = idsInView[i];
          const index = indexByKey.get(id);
          if (index !== void 0) {
            idsInViewWithPositions.push({ id, position: positions.get(id) });
          }
        }
      } else {
        targetId = idsInView.find((id) => indexByKey.get(id) !== void 0);
      }
    }
    if (targetId !== void 0) {
      prevPosition = positions.get(targetId);
      console.log(
        `[MVCP] Target selected | id=${targetId} index=${indexByKey.get(targetId)} prevPosition=${prevPosition}px | mode=${dataChanged ? "data-change" : "size-change"}`
      );
    } else if (dataChanged && idsInViewWithPositions.length > 0) {
      console.log(
        `[MVCP] No single target, collected ${idsInViewWithPositions.length} items for data-change mode`
      );
    }
    return () => {
      let positionDiff = 0;
      if (dataChanged && targetId === void 0 && mvcpData) {
        for (let i = 0; i < idsInViewWithPositions.length; i++) {
          const { id, position } = idsInViewWithPositions[i];
          const newPosition = positions.get(id);
          if (newPosition !== void 0) {
            positionDiff = newPosition - position;
            console.log(
              `[MVCP] Data-change mode found item | id=${id} index=${indexByKey.get(id)} prevPos=${position.toFixed(1)}px newPos=${newPosition.toFixed(1)}px diff=${positionDiff.toFixed(1)}px | hasInvalidationChanges=${state.hasInvalidationChanges}`
            );
            break;
          }
        }
      }
      if (targetId !== void 0 && prevPosition !== void 0) {
        const newPosition = positions.get(targetId);
        if (newPosition !== void 0) {
          const totalSize = getContentSize(ctx);
          let diff = newPosition - prevPosition;
          const originalDiff = diff;
          if (diff !== 0 && state.scroll + state.scrollLength > totalSize) {
            if (diff > 0) {
              diff = Math.max(0, totalSize - state.scroll - state.scrollLength);
            } else {
              diff = 0;
            }
            console.log(
              `[MVCP] Near end-of-list adjustment | originalDiff=${originalDiff.toFixed(1)}px adjustedDiff=${diff.toFixed(1)}px | scroll=${state.scroll.toFixed(1)} scrollLength=${state.scrollLength.toFixed(1)} totalSize=${totalSize.toFixed(1)}`
            );
          }
          positionDiff = diff;
          console.log(
            `[MVCP] Position calculation | targetId=${targetId} prevPos=${prevPosition.toFixed(1)}px newPos=${newPosition.toFixed(1)}px diff=${diff.toFixed(1)}px | hasInvalidationChanges=${state.hasInvalidationChanges}`
          );
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
        console.log(
          `[MVCP] Requesting scroll adjustment | adjustment=${positionDiff.toFixed(1)}px fromScroll=${state.scroll.toFixed(1)}px toScroll=${(state.scroll + positionDiff).toFixed(1)}px | dataChanged=${dataChanged} hasInvalidationChanges=${state.hasInvalidationChanges}`
        );
        requestAdjust(ctx, positionDiff);
      } else {
        console.log(
          `[MVCP] Adjustment too small (${positionDiff.toFixed(3)}px), skipping`
        );
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
    const prevRowHeight = calculateRowMaxSize(ctx, prevRowStart, prevIndex, useAverageSize);
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
    const size = getItemSize(ctx, id, i, data[i], useAverageSize);
    if (size > maxSize) {
      maxSize = size;
    }
  }
  return maxSize;
}

// src/core/updateTotalSize.ts
function updateTotalSize(ctx) {
  const state = ctx.state;
  const {
    positions,
    props: { data }
  } = state;
  if (data.length === 0) {
    addTotalSize(ctx, null, 0);
  } else {
    const lastId = getId(state, data.length - 1);
    if (lastId !== void 0) {
      const lastPosition = positions.get(lastId);
      if (lastPosition !== void 0) {
        const lastSize = getItemSize(ctx, lastId, data.length - 1, data[data.length - 1]);
        if (lastSize !== void 0) {
          const totalSize = lastPosition + lastSize;
          addTotalSize(ctx, null, totalSize);
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
    indexByKey,
    positions,
    idCache,
    sizesKnown,
    props: { data, getEstimatedItemSize, snapToIndices },
    scrollingTo
  } = state;
  const dataLength = data.length;
  const numColumns = peek$(ctx, "numColumns");
  const hasColumns = numColumns > 1;
  const indexByKeyForChecking = IS_DEV ? /* @__PURE__ */ new Map() : void 0;
  const shouldOptimize = !forceFullUpdate && !dataChanged && Math.abs(getScrollVelocity(state)) > 0;
  const maxVisibleArea = scrollBottomBuffered + 1e3;
  const useAverageSize = !getEstimatedItemSize;
  const preferCachedSize = !doMVCP || dataChanged || state.hasInvalidationChanges || state.scrollAdjustHandler.getAdjust() !== 0 || ((_a3 = peek$(ctx, "scrollAdjustPending")) != null ? _a3 : 0) !== 0;
  console.log(
    `[updateItemPositions] Size preference | preferCachedSize=${preferCachedSize} | doMVCP=${doMVCP} dataChanged=${dataChanged} hasInvalidationChanges=${state.hasInvalidationChanges} currentAdjust=${state.scrollAdjustHandler.getAdjust().toFixed(1)}px pendingAdjust=${((_b = peek$(ctx, "scrollAdjustPending")) != null ? _b : 0).toFixed(1)}px`
  );
  let currentRowTop = 0;
  let column = 1;
  let maxSizeInRow = 0;
  if (startIndex > 0) {
    if (hasColumns) {
      const { startIndex: processedStartIndex, currentRowTop: initialRowTop } = prepareColumnStartState(
        ctx,
        startIndex,
        useAverageSize
      );
      startIndex = processedStartIndex;
      currentRowTop = initialRowTop;
    } else if (startIndex < dataLength) {
      const prevIndex = startIndex - 1;
      const prevId = getId(state, prevIndex);
      const prevPosition = (_c = positions.get(prevId)) != null ? _c : 0;
      const prevSize = (_d = sizesKnown.get(prevId)) != null ? _d : getItemSize(ctx, prevId, prevIndex, data[prevIndex], useAverageSize, preferCachedSize);
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
    const size = (_f = sizesKnown.get(id)) != null ? _f : getItemSize(ctx, id, i, data[i], useAverageSize, preferCachedSize);
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
    if (hasColumns) {
      if (size > maxSizeInRow) {
        maxSizeInRow = size;
      }
      column++;
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
function scrollToIndex(ctx, { index, viewOffset = 0, animated = true, viewPosition }) {
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
  scrollTo(ctx, {
    animated,
    index,
    itemSize,
    offset: firstIndexOffset,
    viewOffset,
    viewPosition: viewPosition != null ? viewPosition : 0
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
  {
    setIt();
  }
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
function handleStickyActivation(ctx, stickyHeaderIndices, stickyArray, currentStickyIdx, needNewContainers, startBuffered, endBuffered) {
  var _a3;
  const state = ctx.state;
  const activeIndices = getActiveStickyIndices(ctx, stickyHeaderIndices);
  set$(ctx, "activeStickyIndex", currentStickyIdx >= 0 ? stickyArray[currentStickyIdx] : -1);
  for (let offset = 0; offset <= 1; offset++) {
    const idx = currentStickyIdx - offset;
    if (idx < 0 || activeIndices.has(stickyArray[idx])) continue;
    const stickyIndex = stickyArray[idx];
    const stickyId = (_a3 = state.idCache[stickyIndex]) != null ? _a3 : getId(state, stickyIndex);
    if (stickyId && !state.containerItemKeys.has(stickyId) && (stickyIndex < startBuffered || stickyIndex > endBuffered)) {
      needNewContainers.push(stickyIndex);
    }
  }
}
function handleStickyRecycling(ctx, stickyArray, scroll, scrollBuffer, currentStickyIdx, pendingRemoval) {
  var _a3, _b, _c;
  const state = ctx.state;
  for (const containerIndex of state.stickyContainerPool) {
    const itemKey = peek$(ctx, `containerItemKey${containerIndex}`);
    const itemIndex = itemKey ? state.indexByKey.get(itemKey) : void 0;
    if (itemIndex === void 0) continue;
    const arrayIdx = stickyArray.indexOf(itemIndex);
    if (arrayIdx === -1) {
      state.stickyContainerPool.delete(containerIndex);
      set$(ctx, `containerSticky${containerIndex}`, false);
      set$(ctx, `containerStickyOffset${containerIndex}`, void 0);
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
function calculateItemsInView(ctx, params = {}) {
  const state = ctx.state;
  const hadInvalidationChanges = state.hasInvalidationChanges;
  state.hasInvalidationChanges = false;
  if (hadInvalidationChanges) {
    console.log("[calculateItemsInView] Reset hasInvalidationChanges from true to false (new cycle starting)");
  }
  reactDom.unstable_batchedUpdates(() => {
    var _a3, _b, _c, _d, _e, _f, _g, _h, _i, _j;
    const {
      columns,
      containerItemKeys,
      enableScrollForNextCalculateItemsInView,
      idCache,
      indexByKey,
      initialScroll,
      minIndexSizeChanged,
      positions,
      props: { getItemType, itemsAreEqual, keyExtractor, onStickyHeaderChange, scrollBuffer },
      scrollForNextCalculateItemsInView,
      scrollLength,
      sizes,
      startBufferedId: startBufferedIdOrig,
      viewabilityConfigCallbackPairs
    } = state;
    const { data } = state.props;
    const stickyIndicesArr = state.props.stickyIndicesArr || [];
    const stickyIndicesSet = state.props.stickyIndicesSet || /* @__PURE__ */ new Set();
    const prevNumContainers = peek$(ctx, "numContainers");
    if (!data || scrollLength === 0 || !prevNumContainers) {
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
    const scrollAdjustPending = (_a3 = peek$(ctx, "scrollAdjustPending")) != null ? _a3 : 0;
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
    const scrollTopBuffered = scroll - scrollBufferTop;
    const scrollBottom = scroll + scrollLength + (scroll < 0 ? -scroll : 0);
    const scrollBottomBuffered = scrollBottom + scrollBufferBottom;
    if (!dataChanged && !forceFullItemPositions && scrollForNextCalculateItemsInView) {
      const { top, bottom } = scrollForNextCalculateItemsInView;
      if ((top === null || scrollTopBuffered > top) && (bottom === null || scrollBottomBuffered < bottom)) {
        return;
      }
    }
    const checkMVCP = doMVCP ? prepareMVCP(ctx, dataChanged) : void 0;
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
    let loopStart = !dataChanged && startBufferedIdOrig ? indexByKey.get(startBufferedIdOrig) || 0 : 0;
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
    const loopStartMod = loopStart % numColumns;
    if (loopStartMod > 0) {
      loopStart -= loopStartMod;
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
      const id = (_e = idCache[i]) != null ? _e : getId(state, i);
      const size = (_f = sizes.get(id)) != null ? _f : getItemSize(ctx, id, i, data[i]);
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
      const id = (_g = idCache[i]) != null ? _g : getId(state, i);
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
      state.scrollForNextCalculateItemsInView = nextTop !== void 0 && nextBottom !== void 0 ? {
        bottom: nextBottom,
        top: nextTop
      } : void 0;
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
      for (let i = startBuffered; i <= endBuffered; i++) {
        const id = (_h = idCache[i]) != null ? _h : getId(state, i);
        if (!containerItemKeys.has(id)) {
          needNewContainers.push(i);
        }
      }
      if (stickyIndicesArr.length > 0) {
        handleStickyActivation(
          ctx,
          stickyIndicesSet,
          stickyIndicesArr,
          currentStickyIdx,
          needNewContainers,
          startBuffered,
          endBuffered
        );
      } else if (previousStickyIndex !== -1) {
        set$(ctx, "activeStickyIndex", -1);
      }
      if (needNewContainers.length > 0) {
        const requiredItemTypes = getItemType ? needNewContainers.map((i) => {
          const itemType = getItemType(data[i], i);
          return itemType ? String(itemType) : "";
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
          const id = (_i = idCache[i]) != null ? _i : getId(state, i);
          const oldKey = peek$(ctx, `containerItemKey${containerIndex}`);
          if (oldKey && oldKey !== id) {
            containerItemKeys.delete(oldKey);
          }
          set$(ctx, `containerItemKey${containerIndex}`, id);
          set$(ctx, `containerItemData${containerIndex}`, data[i]);
          if (requiredItemTypes) {
            state.containerItemTypes.set(containerIndex, requiredItemTypes[idx]);
          }
          containerItemKeys.add(id);
          const containerSticky = `containerSticky${containerIndex}`;
          if (stickyIndicesSet.has(i)) {
            set$(ctx, containerSticky, true);
            const topPadding = (peek$(ctx, "stylePaddingTop") || 0) + (peek$(ctx, "headerSize") || 0);
            set$(ctx, `containerStickyOffset${containerIndex}`, topPadding);
            state.stickyContainerPool.add(containerIndex);
          } else if (peek$(ctx, containerSticky)) {
            set$(ctx, containerSticky, false);
            state.stickyContainerPool.delete(containerIndex);
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
    }
    if (stickyIndicesArr.length > 0) {
      handleStickyRecycling(ctx, stickyIndicesArr, scroll, scrollBuffer, currentStickyIdx, pendingRemoval);
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
          set$(ctx, `containerStickyOffset${i}`, void 0);
          state.stickyContainerPool.delete(i);
        }
        set$(ctx, `containerItemKey${i}`, void 0);
        set$(ctx, `containerItemData${i}`, void 0);
        set$(ctx, `containerPosition${i}`, POSITION_OUT_OF_VIEW);
        set$(ctx, `containerColumn${i}`, -1);
      } else {
        const itemIndex = indexByKey.get(itemKey);
        const item = data[itemIndex];
        if (item !== void 0) {
          const id = (_j = idCache[itemIndex]) != null ? _j : getId(state, itemIndex);
          const positionValue = positions.get(id);
          if (positionValue === void 0) {
            set$(ctx, `containerPosition${i}`, POSITION_OUT_OF_VIEW);
          } else {
            const position = (positionValue || 0) - scrollAdjustPending;
            const column = columns.get(id) || 1;
            const prevPos = peek$(ctx, `containerPosition${i}`);
            const prevColumn = peek$(ctx, `containerColumn${i}`);
            const prevData = peek$(ctx, `containerItemData${i}`);
            if (position > POSITION_OUT_OF_VIEW && position !== prevPos) {
              set$(ctx, `containerPosition${i}`, position);
              didChangePositions = true;
            }
            if (column >= 0 && column !== prevColumn) {
              set$(ctx, `containerColumn${i}`, column);
            }
            if (prevData !== item && (itemsAreEqual ? !itemsAreEqual(prevData, item, itemIndex, data) : true)) {
              set$(ctx, `containerItemData${i}`, item);
            }
          }
        }
      }
    }
    if (didChangePositions) {
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

// src/core/doMaintainScrollAtEnd.ts
function doMaintainScrollAtEnd(ctx, animated) {
  const state = ctx.state;
  const {
    didContainersLayout,
    isAtEnd,
    refScroller,
    props: { maintainScrollAtEnd }
  } = state;
  if (isAtEnd && maintainScrollAtEnd && didContainersLayout) {
    const paddingTop = peek$(ctx, "alignItemsPaddingTop");
    if (paddingTop > 0) {
      state.scroll = 0;
    }
    requestAnimationFrame(() => {
      var _a3;
      if (state.isAtEnd) {
        state.maintainingScrollAtEnd = true;
        (_a3 = refScroller.current) == null ? void 0 : _a3.scrollToEnd({
          animated
        });
        setTimeout(
          () => {
            state.maintainingScrollAtEnd = false;
          },
          0
        );
      }
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
  const didMaintainScrollAtEnd = shouldMaintainScrollAtEnd && doMaintainScrollAtEnd(ctx, false);
  if (!didMaintainScrollAtEnd && previousData && dataProp.length > previousData.length) {
    state.isEndReached = false;
  }
  if (!didMaintainScrollAtEnd) {
    checkAtTop(state);
    checkAtBottom(ctx);
  }
  delete state.previousData;
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
        const itemType = getItemType ? (_a3 = getItemType(item, i)) != null ? _a3 : "" : "";
        totalSize += (_c = (_b = getFixedItemSize == null ? void 0 : getFixedItemSize(i, item, itemType)) != null ? _b : getEstimatedItemSize == null ? void 0 : getEstimatedItemSize(i, item, itemType)) != null ? _c : estimatedItemSize;
      }
      averageItemSize = totalSize / num;
    } else {
      averageItemSize = estimatedItemSize;
    }
    const numContainers = Math.ceil((scrollLength + scrollBuffer * 2) / averageItemSize * numColumns);
    for (let i = 0; i < numContainers; i++) {
      set$(ctx, `containerPosition${i}`, POSITION_OUT_OF_VIEW);
      set$(ctx, `containerColumn${i}`, -1);
    }
    set$(ctx, "numContainers", numContainers);
    set$(ctx, "numContainersPooled", numContainers * state.props.initialContainerPoolRatio);
    if (state.lastLayout) {
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
    updateAlignItemsPaddingTop(ctx);
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
  var _a3, _b, _c;
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
  updateScroll(ctx, newScroll);
  if (state.scrollingTo) {
    checkFinishedScroll(ctx);
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
    if ((scrollingTo == null ? void 0 : scrollingTo.animated) && !scrollingTo.isInitialScroll) {
      this.pendingAdjust += add;
      set$(this.ctx, "scrollAdjustPending", this.pendingAdjust);
      console.log(
        `[ScrollAdjustHandler] Queued pending adjustment | add=${add.toFixed(1)}px totalPending=${this.pendingAdjust.toFixed(1)}px (waiting for animated scroll to finish)`
      );
    } else {
      this.appliedAdjust += add;
      set$(this.ctx, "scrollAdjust", this.appliedAdjust);
      console.log(
        `[ScrollAdjustHandler] Applied adjustment | add=${add.toFixed(1)}px totalApplied=${this.appliedAdjust.toFixed(1)}px`
      );
    }
    if (this.ctx.state.scrollingTo) {
      checkFinishedScroll(this.ctx);
    }
  }
  getAdjust() {
    return this.appliedAdjust;
  }
  commitPendingAdjust() {
    {
      const state = this.ctx.state;
      const pending = this.pendingAdjust;
      if (pending !== 0) {
        this.pendingAdjust = 0;
        this.appliedAdjust += pending;
        state.scroll += pending;
        state.scrollForNextCalculateItemsInView = void 0;
        set$(this.ctx, "scrollAdjustPending", 0);
        set$(this.ctx, "scrollAdjust", this.appliedAdjust);
        calculateItemsInView(this.ctx);
      }
    }
  }
};

// src/core/updateItemSize.ts
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
    const size2 = getFixedItemSize(index, itemData, type);
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
    if (!needsRecalculate) {
      const numContainers = ctx.values.get("numContainers");
      for (let i = 0; i < numContainers; i++) {
        if (peek$(ctx, `containerItemKey${i}`) === itemKey) {
          needsRecalculate = true;
          break;
        }
      }
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
        doMaintainScrollAtEnd(ctx, false);
      }
    }
  }
}
function updateOneItemSize(ctx, itemKey, sizeObj) {
  var _a3, _b;
  const state = ctx.state;
  const {
    indexByKey,
    sizesKnown,
    sizeInvalidationKeys,
    averageSizes,
    props: { data, horizontal, getEstimatedItemSize, getItemSizeInvalidationKey, getItemType, getFixedItemSize }
  } = state;
  if (!data) return 0;
  const index = indexByKey.get(itemKey);
  const prevSize = getItemSize(ctx, itemKey, index, data[index]);
  const rawSize = horizontal ? sizeObj.width : sizeObj.height;
  const size = Math.round(rawSize) ;
  const prevSizeKnown = sizesKnown.get(itemKey);
  sizesKnown.set(itemKey, size);
  if (getItemSizeInvalidationKey) {
    const itemType = getItemType ? (_a3 = getItemType(data[index], index)) != null ? _a3 : "" : "";
    const invalidationKey = getItemSizeInvalidationKey(index, data[index], itemType);
    if (invalidationKey !== void 0) {
      const prevKey = sizeInvalidationKeys.get(itemKey);
      sizeInvalidationKeys.set(itemKey, invalidationKey);
      console.log(
        `[updateOneItemSize] ${itemKey} measured at ${size}px, invalidationKey: ${prevKey != null ? prevKey : "none"} \u2192 ${invalidationKey}`
      );
    }
  }
  if (!getEstimatedItemSize && !getFixedItemSize && size > 0) {
    const itemType = getItemType ? (_b = getItemType(data[index], index)) != null ? _b : "" : "";
    let averages = averageSizes[itemType];
    if (!averages) {
      averages = averageSizes[itemType] = { avg: 0, num: 0 };
    }
    if (prevSizeKnown !== void 0 && prevSizeKnown > 0) {
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
var useCombinedRef = (...refs) => {
  const callback = React3.useCallback((element) => {
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

// src/platform/RefreshControl.tsx
function RefreshControl(_props) {
  return null;
}

// src/platform/useStickyScrollHandler.ts
function useStickyScrollHandler(_stickyHeaderIndices, _horizontal, _ctx, onScroll2) {
  return onScroll2;
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
      const { index, ...rest } = options;
      const { startNoBuffer, endNoBuffer } = state;
      if (index < startNoBuffer || index > endNoBuffer) {
        const viewPosition = index < startNoBuffer ? 0 : 1;
        scrollToIndex(ctx, {
          ...rest,
          index,
          viewPosition
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
      contentLength: state.totalSize,
      data: state.props.data,
      elementAtIndex: (index) => {
        var _a3;
        return (_a3 = ctx.viewRefs.get(findContainerId(ctx, getId(state, index)))) == null ? void 0 : _a3.current;
      },
      end: state.endNoBuffer,
      endBuffered: state.endBuffered,
      isAtEnd: state.isAtEnd,
      isAtStart: state.isAtStart,
      listen: (signalName, cb) => listen$(ctx, signalName, cb),
      listenToPosition: (key, cb) => listenPosition$(ctx, key, cb),
      positionAtIndex: (index) => state.positions.get(getId(state, index)),
      positions: state.positions,
      scroll: state.scroll,
      scrollLength: state.scrollLength,
      sizeAtIndex: (index) => state.sizesKnown.get(getId(state, index)),
      sizes: state.sizesKnown,
      start: state.startNoBuffer,
      startBuffered: state.startBuffered
    }),
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
          viewPosition: 1
        });
      }
    },
    scrollToIndex: (params) => scrollToIndex(ctx, params),
    scrollToItem: ({ item, ...props }) => {
      const data = state.props.data;
      const index = data.indexOf(item);
      if (index !== -1) {
        scrollToIndex(ctx, { index, ...props });
      }
    },
    scrollToOffset: (params) => scrollTo(ctx, params),
    setScrollProcessingEnabled: (enabled) => {
      state.scrollProcessingEnabled = enabled;
    },
    setVisibleContentAnchorOffset: (value) => {
      const val = isFunction(value) ? value(peek$(ctx, "scrollAdjustUserOffset") || 0) : value;
      set$(ctx, "scrollAdjustUserOffset", val);
    }
  };
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
    renderedItem = isFunction(renderItem) ? renderItem(itemProps) : React3__namespace.default.createElement(renderItem, itemProps);
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
      size: (_b = value.size) != null ? _b : true
    };
  }
  if (value === false) {
    return { data: false, size: false };
  }
  return { data: false, size: true };
}
function useThrottleDebounce(mode) {
  const timeoutRef = React3.useRef(null);
  const lastCallTimeRef = React3.useRef(0);
  const lastArgsRef = React3.useRef(null);
  const clearTimeoutRef = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };
  const execute = React3.useCallback(
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
      data: (isArray(children) ? children : React3__namespace.Children.toArray(children)).flat(1),
      renderItem: ({ item }) => item
    } : {
      ...restProps,
      data: dataProp || [],
      renderItem: renderItemProp
    };
    return /* @__PURE__ */ React3__namespace.createElement(StateProvider, null, /* @__PURE__ */ React3__namespace.createElement(LegendListInner, { ...processedProps, ref: forwardedRef }));
  })
);
var LegendListInner = typedForwardRef(function LegendListInner2(props, forwardedRef) {
  var _a3, _b;
  const {
    alignItemsAtEnd = false,
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
    getItemSizeInvalidationKey,
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
    onEndReached,
    onEndReachedThreshold = 0.5,
    onItemSizeChanged,
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
    stickyHeaderIndices: stickyHeaderIndicesProp,
    stickyIndices: stickyIndicesDeprecated,
    // TODOV3: Remove from v3 release
    style: styleProp,
    suggestEstimatedItemSize,
    viewabilityConfig,
    viewabilityConfigCallbackPairs,
    waitForInitialLayout = true,
    ...rest
  } = props;
  const animatedPropsInternal = props.animatedPropsInternal;
  const { childrenMode } = rest;
  const contentContainerStyle = { ...StyleSheet.flatten(contentContainerStyleProp) };
  const style = { ...StyleSheet.flatten(styleProp) };
  const stylePaddingTopState = extractPadding(style, contentContainerStyle, "Top");
  const stylePaddingBottomState = extractPadding(style, contentContainerStyle, "Bottom");
  const maintainVisibleContentPositionConfig = normalizeMaintainVisibleContentPosition(
    maintainVisibleContentPositionProp
  );
  const [renderNum, setRenderNum] = React3.useState(0);
  const initialScrollProp = initialScrollAtEnd ? { index: Math.max(0, dataProp.length - 1), viewOffset: -stylePaddingBottomState } : initialScrollIndexProp || initialScrollOffsetProp ? typeof initialScrollIndexProp === "object" ? { index: initialScrollIndexProp.index || 0, viewOffset: initialScrollIndexProp.viewOffset || 0 } : { index: initialScrollIndexProp || 0, viewOffset: initialScrollOffsetProp || 0 } : void 0;
  const [canRender, setCanRender] = React3__namespace.useState(!IsNewArchitecture);
  const ctx = useStateContext();
  ctx.columnWrapperStyle = columnWrapperStyle || (contentContainerStyle ? createColumnWrapperStyle(contentContainerStyle) : void 0);
  const refScroller = React3.useRef(null);
  const combinedRef = useCombinedRef(refScroller, refScrollView);
  const estimatedItemSize = estimatedItemSizeProp != null ? estimatedItemSizeProp : DEFAULT_ITEM_SIZE;
  const scrollBuffer = (drawDistance != null ? drawDistance : DEFAULT_DRAW_DISTANCE) || 1;
  const keyExtractor = keyExtractorProp != null ? keyExtractorProp : (_item, index) => index.toString();
  const stickyHeaderIndices = stickyHeaderIndicesProp != null ? stickyHeaderIndicesProp : stickyIndicesDeprecated;
  if (IS_DEV && stickyIndicesDeprecated && !stickyHeaderIndicesProp) {
    warnDevOnce(
      "stickyIndices",
      "stickyIndices has been renamed to stickyHeaderIndices. Please update your props to use stickyHeaderIndices."
    );
  }
  const refState = React3.useRef();
  if (!refState.current) {
    if (!ctx.state) {
      const initialScrollLength = (estimatedListSize != null ? estimatedListSize : { height: 0, width: 0 } )[horizontal ? "width" : "height"];
      ctx.state = {
        activeStickyIndex: -1,
        averageSizes: {},
        columns: /* @__PURE__ */ new Map(),
        containerItemKeys: /* @__PURE__ */ new Set(),
        containerItemTypes: /* @__PURE__ */ new Map(),
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
          viewOffset: (_a3 = initialScrollProp.viewOffset) != null ? _a3 : 0,
          viewPosition: initialScrollProp.viewPosition
        } : void 0,
        initialScroll: initialScrollProp,
        isAtEnd: false,
        isAtStart: false,
        isEndReached: null,
        isFirst: true,
        isStartReached: null,
        lastBatchingAction: Date.now(),
        lastLayout: void 0,
        loadStartTime: Date.now(),
        minIndexSizeChanged: 0,
        nativeMarginTop: 0,
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
        sizeInvalidationKeys: /* @__PURE__ */ new Map(),
        startBuffered: -1,
        startNoBuffer: -1,
        startReachedSnapshot: void 0,
        stickyContainerPool: /* @__PURE__ */ new Set(),
        stickyContainers: /* @__PURE__ */ new Map(),
        hasInvalidationChanges: false,
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
    animatedProps: animatedPropsInternal,
    contentInset,
    data: dataProp,
    dataVersion,
    estimatedItemSize,
    getEstimatedItemSize,
    getItemSizeInvalidationKey,
    getFixedItemSize,
    getItemType,
    horizontal: !!horizontal,
    initialContainerPoolRatio,
    itemsAreEqual,
    keyExtractor,
    maintainScrollAtEnd,
    maintainScrollAtEndThreshold,
    maintainVisibleContentPosition: maintainVisibleContentPositionConfig,
    numColumns: numColumnsProp,
    onEndReached,
    onEndReachedThreshold,
    onItemSizeChanged,
    onLoad,
    onScroll: throttleScrollFn,
    onStartReached,
    onStartReachedThreshold,
    onStickyHeaderChange,
    recycleItems: !!recycleItems,
    renderItem,
    scrollBuffer,
    snapToIndices,
    stickyIndicesArr: stickyHeaderIndices != null ? stickyHeaderIndices : [],
    stickyIndicesSet: React3.useMemo(() => new Set(stickyHeaderIndices != null ? stickyHeaderIndices : []), [stickyHeaderIndices == null ? void 0 : stickyHeaderIndices.join(",")]),
    stylePaddingBottom: stylePaddingBottomState,
    stylePaddingTop: stylePaddingTopState,
    suggestEstimatedItemSize: !!suggestEstimatedItemSize
  };
  state.refScroller = refScroller;
  const memoizedLastItemKeys = React3.useMemo(() => {
    if (!dataProp.length) return [];
    return Array.from(
      { length: Math.min(numColumnsProp, dataProp.length) },
      (_, i) => getId(state, dataProp.length - 1 - i)
    );
  }, [dataProp, dataVersion, numColumnsProp]);
  const initializeStateVars = () => {
    set$(ctx, "lastItemKeys", memoizedLastItemKeys);
    set$(ctx, "numColumns", numColumnsProp);
    const prevPaddingTop = peek$(ctx, "stylePaddingTop");
    setPaddingTop(ctx, { stylePaddingTop: stylePaddingTopState });
    refState.current.props.stylePaddingBottom = stylePaddingBottomState;
    let paddingDiff = stylePaddingTopState - prevPaddingTop;
    if (maintainVisibleContentPositionConfig.size && paddingDiff && prevPaddingTop !== void 0 && Platform.OS === "ios") {
      if (state.scroll < 0) {
        paddingDiff += state.scroll;
      }
      requestAdjust(ctx, paddingDiff);
    }
  };
  if (isFirstLocal) {
    initializeStateVars();
    updateItemPositions(
      ctx,
      /*dataChanged*/
      true
    );
  }
  const initialContentOffset = React3.useMemo(() => {
    let value;
    const { initialScroll, initialAnchor } = refState.current;
    if (initialScroll) {
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
      refState.current.sizeInvalidationKeys.clear();
      refState.current.positions.clear();
      refState.current.totalSize = 0;
      set$(ctx, "totalSize", 0);
    }
  }
  const onLayoutHeader = React3.useCallback((rect, fromLayoutEffect) => {
    const { initialScroll } = refState.current;
    const size = rect[horizontal ? "width" : "height"];
    set$(ctx, "headerSize", size);
    if ((initialScroll == null ? void 0 : initialScroll.index) !== void 0) {
      {
        if (fromLayoutEffect) {
          setRenderNum((v) => v + 1);
        }
      }
    }
  }, []);
  const doInitialScroll = React3.useCallback(() => {
    const initialScroll = state.initialScroll;
    if (initialScroll) {
      scrollTo(ctx, {
        animated: false,
        index: initialScroll == null ? void 0 : initialScroll.index,
        isInitialScroll: true,
        offset: initialContentOffset,
        precomputedWithViewOffset: true
      });
    }
  }, [initialContentOffset]);
  const onLayoutChange = React3.useCallback((layout) => {
    doInitialScroll();
    handleLayout(ctx, layout, setCanRender);
  }, []);
  const { onLayout } = useOnLayoutSync({
    onLayoutChange,
    onLayoutProp,
    ref: refScroller
    // the type of ScrollView doesn't include measure?
  });
  React3.useLayoutEffect(() => {
    if (snapToIndices) {
      updateSnapToOffsets(ctx);
    }
  }, [snapToIndices]);
  React3.useLayoutEffect(() => {
    const {
      didColumnsChange,
      didDataChange,
      isFirst,
      props: { data }
    } = state;
    const didAllocateContainers = data.length > 0 && doInitialAllocateContainers(ctx);
    if (!didAllocateContainers && !isFirst && (didDataChange || didColumnsChange)) {
      checkResetContainers(ctx, data);
    }
    state.didColumnsChange = false;
    state.didDataChange = false;
    state.isFirst = false;
  }, [dataProp, dataVersion, numColumnsProp]);
  React3.useLayoutEffect(() => {
    set$(ctx, "extraData", extraData);
  }, [extraData]);
  React3.useLayoutEffect(initializeStateVars, [
    dataVersion,
    memoizedLastItemKeys.join(","),
    numColumnsProp,
    stylePaddingBottomState,
    stylePaddingTopState
  ]);
  React3.useEffect(() => {
    const viewability = setupViewability({
      onViewableItemsChanged,
      viewabilityConfig,
      viewabilityConfigCallbackPairs
    });
    state.viewabilityConfigCallbackPairs = viewability;
    state.enableScrollForNextCalculateItemsInView = !viewability;
  }, [viewabilityConfig, viewabilityConfigCallbackPairs, onViewableItemsChanged]);
  React3.useImperativeHandle(forwardedRef, () => createImperativeHandle(ctx), []);
  {
    React3.useEffect(doInitialScroll, []);
  }
  const fns = React3.useMemo(
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
  return /* @__PURE__ */ React3__namespace.createElement(React3__namespace.Fragment, null, /* @__PURE__ */ React3__namespace.createElement(
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
      refreshControl: refreshControl ? stylePaddingTopState > 0 ? React3__namespace.cloneElement(refreshControl, {
        progressViewOffset: (refreshControl.props.progressViewOffset || 0) + stylePaddingTopState
      }) : refreshControl : onRefresh && /* @__PURE__ */ React3__namespace.createElement(
        RefreshControl,
        {
          onRefresh,
          progressViewOffset: (progressViewOffset || 0) + stylePaddingTopState,
          refreshing: !!refreshing
        }
      ),
      refScrollView: combinedRef,
      scrollAdjustHandler: (_b = refState.current) == null ? void 0 : _b.scrollAdjustHandler,
      scrollEventThrottle: 0,
      snapToIndices,
      stickyHeaderIndices,
      style,
      updateItemSize: fns.updateItemSize,
      waitForInitialLayout
    }
  ), IS_DEV && ENABLE_DEBUG_VIEW && /* @__PURE__ */ React3__namespace.createElement(DebugView, { state: refState.current }));
});

exports.LegendList = LegendList;
exports.useIsLastItem = useIsLastItem;
exports.useListScrollSize = useListScrollSize;
exports.useRecyclingEffect = useRecyclingEffect;
exports.useRecyclingState = useRecyclingState;
exports.useSyncLayout = useSyncLayout;
exports.useViewability = useViewability;
exports.useViewabilityAmount = useViewabilityAmount;

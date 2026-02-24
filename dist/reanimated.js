'use strict';

var React3 = require('react');
var reactNative = require('react-native');
var Reanimated = require('react-native-reanimated');
var reactNative$1 = require('@legendapp/list/react-native');
var shim = require('use-sync-external-store/shim');

function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

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
var Reanimated__default = /*#__PURE__*/_interopDefault(Reanimated);

// src/integrations/reanimated.tsx

// src/constants.ts
var POSITION_OUT_OF_VIEW = -1e7;

// src/constants-platform.native.ts
var f = global.nativeFabricUIManager;
var IsNewArchitecture = f !== void 0 && f != null;
var ContextState = React3__namespace.createContext(null);
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
function useArr$(signalNames) {
  const ctx = React3__namespace.useContext(ContextState);
  const { subscribe, get } = React3__namespace.useMemo(() => createSelectorFunctionsArr(ctx, signalNames), [ctx, signalNames]);
  const value = shim.useSyncExternalStore(subscribe, get);
  return value;
}

// src/utils/helpers.ts
function isFunction(obj) {
  return typeof obj === "function";
}

// src/hooks/useCombinedRef.ts
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
var getComponent = (Component) => {
  if (React3__namespace.isValidElement(Component)) {
    return Component;
  }
  if (Component) {
    return /* @__PURE__ */ React3__namespace.createElement(Component, null);
  }
  return null;
};

// src/integrations/reanimated.tsx
var typedMemo = React3.memo;
var ReanimatedScrollBridge = typedMemo(function ReanimatedScrollBridgeComponent({
  forwardedRef,
  scrollOffset,
  ...props
}) {
  const animatedScrollRef = Reanimated.useAnimatedRef();
  Reanimated.useScrollViewOffset(animatedScrollRef, scrollOffset);
  const combinedRef = useCombinedRef(animatedScrollRef, forwardedRef);
  return /* @__PURE__ */ React3__namespace.createElement(Reanimated__default.default.ScrollView, { ...props, ref: combinedRef });
});
var StickyOverlay = typedMemo(function StickyOverlayComponent({ stickyHeaderConfig }) {
  if (!(stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.backdropComponent)) {
    return null;
  }
  return /* @__PURE__ */ React3__namespace.createElement(
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
});
var ReanimatedPositionViewSticky = typedMemo(function ReanimatedPositionViewStickyComponent(props) {
  var _a;
  const { id, horizontal, style, refView, stickyScrollOffset, stickyHeaderConfig, index, children, ...rest } = props;
  const [position = POSITION_OUT_OF_VIEW, headerSize = 0, stylePaddingTop = 0] = useArr$([
    `containerPosition${id}`,
    "headerSize",
    "stylePaddingTop"
  ]);
  const stickyOffset = (_a = stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.offset) != null ? _a : 0;
  const stickyStart = position + headerSize + stylePaddingTop - stickyOffset;
  const transformStyle = Reanimated.useAnimatedStyle(() => {
    const delta = Math.max(0, stickyScrollOffset.value - stickyStart);
    return horizontal ? { transform: [{ translateX: position + delta }] } : { transform: [{ translateY: position + delta }] };
  }, [horizontal, position, stickyStart]);
  const viewStyle = React3__namespace.useMemo(
    () => [style, { zIndex: index + 1e3 }, transformStyle],
    [index, style, transformStyle]
  );
  return /* @__PURE__ */ React3__namespace.createElement(Reanimated__default.default.View, { ref: refView, style: viewStyle, ...rest }, /* @__PURE__ */ React3__namespace.createElement(StickyOverlay, { stickyHeaderConfig }), children);
});
var ReanimatedPositionView = typedMemo(function ReanimatedPositionViewComponent(props) {
  const { id, horizontal, style, refView, children, layoutTransition, ...rest } = props;
  const [positionValue = POSITION_OUT_OF_VIEW] = useArr$([`containerPosition${id}`]);
  const viewStyle = React3__namespace.useMemo(
    () => [style, horizontal ? { left: positionValue } : { top: positionValue }],
    [horizontal, positionValue, style]
  );
  return /* @__PURE__ */ React3__namespace.createElement(Reanimated__default.default.View, { layout: layoutTransition, ref: refView, style: viewStyle, ...rest }, children);
});
var LegendListForwardedRef = typedMemo(
  // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  React3__namespace.forwardRef(function LegendListForwardedRef2(props, ref) {
    const { itemLayoutAnimation, refLegendList, ...rest } = props;
    const refFn = React3.useCallback(
      (r) => {
        refLegendList(r);
      },
      [refLegendList]
    );
    const stickyScrollOffset = Reanimated.useSharedValue(0);
    const shouldUseReanimatedScrollView = IsNewArchitecture;
    const renderReanimatedScrollComponent = React3.useCallback(
      (scrollViewProps) => {
        const { ref: forwardedRef, ...restScrollViewProps } = scrollViewProps;
        return /* @__PURE__ */ React3__namespace.createElement(
          ReanimatedScrollBridge,
          {
            ...restScrollViewProps,
            forwardedRef,
            scrollOffset: stickyScrollOffset
          }
        );
      },
      [stickyScrollOffset]
    );
    const stickyPositionComponentInternal = React3__namespace.useMemo(
      () => function StickyPositionComponent(stickyProps) {
        return /* @__PURE__ */ React3__namespace.createElement(ReanimatedPositionViewSticky, { ...stickyProps, stickyScrollOffset });
      },
      [stickyScrollOffset]
    );
    const itemLayoutAnimationRef = React3__namespace.useRef(itemLayoutAnimation);
    itemLayoutAnimationRef.current = itemLayoutAnimation;
    const hasItemLayoutAnimation = !!itemLayoutAnimation;
    const positionComponentInternal = React3__namespace.useMemo(() => {
      if (!hasItemLayoutAnimation) {
        return void 0;
      }
      return function PositionComponent(positionProps) {
        return /* @__PURE__ */ React3__namespace.createElement(ReanimatedPositionView, { ...positionProps, layoutTransition: itemLayoutAnimationRef.current });
      };
    }, [hasItemLayoutAnimation]);
    const legendListProps = {
      ...rest,
      positionComponentInternal,
      ...shouldUseReanimatedScrollView ? {
        renderScrollComponent: renderReanimatedScrollComponent,
        stickyPositionComponentInternal
      } : {}
    };
    return /* @__PURE__ */ React3__namespace.createElement(reactNative$1.LegendList, { ref: refFn, refScrollView: ref, ...legendListProps });
  })
);
var AnimatedLegendListComponent = Reanimated__default.default.createAnimatedComponent(LegendListForwardedRef);
var AnimatedLegendList = typedMemo(
  // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  React3__namespace.forwardRef(function AnimatedLegendList2(props, ref) {
    const { refScrollView, ...rest } = props;
    const { animatedProps } = props;
    const refLegendList = React3__namespace.useRef(null);
    const combinedRef = useCombinedRef(refLegendList, ref);
    return /* @__PURE__ */ React3__namespace.createElement(
      AnimatedLegendListComponent,
      {
        animatedPropsInternal: animatedProps,
        ref: refScrollView,
        refLegendList: combinedRef,
        ...rest
      }
    );
  })
);

exports.AnimatedLegendList = AnimatedLegendList;

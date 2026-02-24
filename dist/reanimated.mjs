import * as React3 from 'react';
import { useCallback, memo } from 'react';
import { View } from 'react-native';
import Reanimated, { useAnimatedRef, useScrollViewOffset, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { LegendList } from '@legendapp/list/react-native';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

// src/integrations/reanimated.tsx

// src/constants.ts
var POSITION_OUT_OF_VIEW = -1e7;

// src/constants-platform.native.ts
var f = global.nativeFabricUIManager;
var IsNewArchitecture = f !== void 0 && f != null;
var ContextState = React3.createContext(null);
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
  const ctx = React3.useContext(ContextState);
  const { subscribe, get } = React3.useMemo(() => createSelectorFunctionsArr(ctx, signalNames), [ctx, signalNames]);
  const value = useSyncExternalStore(subscribe, get);
  return value;
}

// src/utils/helpers.ts
function isFunction(obj) {
  return typeof obj === "function";
}

// src/hooks/useCombinedRef.ts
var useCombinedRef = (...refs) => {
  const callback = useCallback((element) => {
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
  if (React3.isValidElement(Component)) {
    return Component;
  }
  if (Component) {
    return /* @__PURE__ */ React3.createElement(Component, null);
  }
  return null;
};

// src/integrations/reanimated.tsx
var typedMemo = memo;
var ReanimatedScrollBridge = typedMemo(function ReanimatedScrollBridgeComponent({
  forwardedRef,
  scrollOffset,
  ...props
}) {
  const animatedScrollRef = useAnimatedRef();
  useScrollViewOffset(animatedScrollRef, scrollOffset);
  const combinedRef = useCombinedRef(animatedScrollRef, forwardedRef);
  return /* @__PURE__ */ React3.createElement(Reanimated.ScrollView, { ...props, ref: combinedRef });
});
var StickyOverlay = typedMemo(function StickyOverlayComponent({ stickyHeaderConfig }) {
  if (!(stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.backdropComponent)) {
    return null;
  }
  return /* @__PURE__ */ React3.createElement(
    View,
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
  const transformStyle = useAnimatedStyle(() => {
    const delta = Math.max(0, stickyScrollOffset.value - stickyStart);
    return horizontal ? { transform: [{ translateX: position + delta }] } : { transform: [{ translateY: position + delta }] };
  }, [horizontal, position, stickyStart]);
  const viewStyle = React3.useMemo(
    () => [style, { zIndex: index + 1e3 }, transformStyle],
    [index, style, transformStyle]
  );
  return /* @__PURE__ */ React3.createElement(Reanimated.View, { ref: refView, style: viewStyle, ...rest }, /* @__PURE__ */ React3.createElement(StickyOverlay, { stickyHeaderConfig }), children);
});
var LegendListForwardedRef = typedMemo(
  // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  React3.forwardRef(function LegendListForwardedRef2(props, ref) {
    const { refLegendList, ...rest } = props;
    const refFn = useCallback(
      (r) => {
        refLegendList(r);
      },
      [refLegendList]
    );
    const stickyScrollOffset = useSharedValue(0);
    const shouldUseReanimatedScrollView = IsNewArchitecture;
    const renderReanimatedScrollComponent = useCallback(
      (scrollViewProps) => {
        const { ref: forwardedRef, ...restScrollViewProps } = scrollViewProps;
        return /* @__PURE__ */ React3.createElement(
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
    const stickyPositionComponentInternal = React3.useMemo(
      () => function StickyPositionComponent(stickyProps) {
        return /* @__PURE__ */ React3.createElement(ReanimatedPositionViewSticky, { ...stickyProps, stickyScrollOffset });
      },
      [stickyScrollOffset]
    );
    const legendListProps = shouldUseReanimatedScrollView ? {
      ...rest,
      renderScrollComponent: renderReanimatedScrollComponent,
      stickyPositionComponentInternal
    } : rest;
    return /* @__PURE__ */ React3.createElement(LegendList, { ref: refFn, refScrollView: ref, ...legendListProps });
  })
);
var AnimatedLegendListComponent = Reanimated.createAnimatedComponent(LegendListForwardedRef);
var AnimatedLegendList = typedMemo(
  // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  React3.forwardRef(function AnimatedLegendList2(props, ref) {
    const { refScrollView, ...rest } = props;
    const { animatedProps } = props;
    const refLegendList = React3.useRef(null);
    const combinedRef = useCombinedRef(refLegendList, ref);
    return /* @__PURE__ */ React3.createElement(
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

export { AnimatedLegendList };

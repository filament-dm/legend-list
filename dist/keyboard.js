'use strict';

var React = require('react');
var reactNative = require('react-native');
var reactNativeKeyboardController = require('react-native-keyboard-controller');
var reactNativeReanimated = require('react-native-reanimated');
var reanimated = require('@legendapp/list/reanimated');

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

var React__namespace = /*#__PURE__*/_interopNamespace(React);

// src/integrations/keyboard.tsx

// src/utils/helpers.ts
function isFunction(obj) {
  return typeof obj === "function";
}

// src/hooks/useCombinedRef.ts
var useCombinedRef = (...refs) => {
  const callback = React.useCallback((element) => {
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

// src/integrations/keyboard.tsx
var clampProgress = (progress) => {
  "worklet";
  return Math.min(1, Math.max(0, progress));
};
var calculateKeyboardInset = (height, safeAreaInsetBottom) => {
  "worklet";
  return Math.max(0, height - safeAreaInsetBottom);
};
var calculateEffectiveKeyboardHeight = (keyboardHeight, contentLength, scrollLength, alignItemsAtEnd) => {
  "worklet";
  if (alignItemsAtEnd) {
    return keyboardHeight;
  } else {
    const availableSpace = Math.max(0, scrollLength - contentLength);
    return Math.max(0, keyboardHeight - availableSpace);
  }
};
var calculateKeyboardTargetOffset = (startOffset, keyboardHeight, isOpening, progress) => {
  "worklet";
  const normalizedProgress = isOpening ? progress : 1 - progress;
  const delta = (isOpening ? keyboardHeight : -keyboardHeight) * normalizedProgress;
  return Math.max(0, startOffset + delta);
};
var KeyboardAvoidingLegendList = React.forwardRef(function KeyboardAvoidingLegendList2(props, forwardedRef) {
  const {
    contentContainerStyle: contentContainerStyleProp,
    contentInset: contentInsetProp,
    horizontal,
    onMetricsChange: onMetricsChangeProp,
    onScroll: onScrollProp,
    safeAreaInsetBottom = 0,
    style: styleProp,
    ...rest
  } = props;
  const { alignItemsAtEnd } = props;
  const styleFlattened = reactNative.StyleSheet.flatten(styleProp);
  const refLegendList = React.useRef(null);
  const combinedRef = useCombinedRef(forwardedRef, refLegendList);
  const isIos = reactNative.Platform.OS === "ios";
  const isAndroid = reactNative.Platform.OS === "android";
  const scrollViewRef = reactNativeReanimated.useAnimatedRef();
  const scrollOffsetY = reactNativeReanimated.useSharedValue(0);
  const animatedOffsetY = reactNativeReanimated.useSharedValue(null);
  const scrollOffsetAtKeyboardStart = reactNativeReanimated.useSharedValue(0);
  const mode = reactNativeReanimated.useSharedValue("idle");
  const keyboardInset = reactNativeReanimated.useSharedValue(0);
  const keyboardHeight = reactNativeReanimated.useSharedValue(0);
  const contentLength = reactNativeReanimated.useSharedValue(0);
  const scrollLength = reactNativeReanimated.useSharedValue(0);
  const isOpening = reactNativeReanimated.useSharedValue(false);
  const didInteractive = reactNativeReanimated.useSharedValue(false);
  const shouldUpdateAlignItemsAtEndMinSize = reactNativeReanimated.useSharedValue(false);
  const isKeyboardOpen = reactNativeReanimated.useSharedValue(false);
  const keyboardInsetRef = React.useRef(0);
  const [alignItemsAtEndMinSize, setAlignItemsAtEndMinSize] = React.useState(void 0);
  const scrollHandler = reactNativeReanimated.useAnimatedScrollHandler(
    (event) => {
      if (mode.get() !== "running" || didInteractive.get()) {
        scrollOffsetY.set(event.contentOffset[horizontal ? "x" : "y"]);
      }
      if (onScrollProp) {
        reactNativeReanimated.runOnJS(onScrollProp)(event);
      }
    },
    [onScrollProp, horizontal]
  );
  const setScrollProcessingEnabled = React.useCallback(
    (enabled) => {
      var _a;
      return (_a = refLegendList.current) == null ? void 0 : _a.setScrollProcessingEnabled(enabled);
    },
    [refLegendList]
  );
  const reportContentInset = React.useCallback(
    (bottom) => {
      var _a;
      return (_a = refLegendList.current) == null ? void 0 : _a.reportContentInset({ bottom });
    },
    [refLegendList]
  );
  const clearAlignItemsAtEndMinSize = React.useCallback(() => {
    setAlignItemsAtEndMinSize((prev) => prev === void 0 ? prev : void 0);
  }, []);
  const updateAlignItemsAtEndMinSize = React.useCallback(
    (nextKeyboardInset) => {
      var _a;
      if (isAndroid) {
        return;
      }
      if (nextKeyboardInset !== void 0) {
        keyboardInsetRef.current = nextKeyboardInset;
      }
      if (!alignItemsAtEnd || horizontal) {
        clearAlignItemsAtEndMinSize();
        return;
      }
      const state = (_a = refLegendList.current) == null ? void 0 : _a.getState();
      if (!state) {
        return;
      }
      const currentInset = keyboardInsetRef.current;
      if (currentInset <= 0) {
        clearAlignItemsAtEndMinSize();
        return;
      }
      if (state.scrollLength <= 0) {
        return;
      }
      const nextMinSize = Math.max(0, state.scrollLength - currentInset);
      setAlignItemsAtEndMinSize((prev) => prev === nextMinSize ? prev : nextMinSize);
    },
    [alignItemsAtEnd, clearAlignItemsAtEndMinSize, horizontal]
  );
  const updateScrollMetrics = React.useCallback(() => {
    var _a;
    const state = (_a = refLegendList.current) == null ? void 0 : _a.getState();
    if (!state) {
      return;
    }
    contentLength.set(state.contentLength);
    scrollLength.set(state.scrollLength);
    updateAlignItemsAtEndMinSize();
  }, [contentLength, scrollLength, updateAlignItemsAtEndMinSize]);
  const handleMetricsChange = React.useCallback(
    (metrics) => {
      updateScrollMetrics();
      onMetricsChangeProp == null ? void 0 : onMetricsChangeProp(metrics);
    },
    [onMetricsChangeProp, updateScrollMetrics]
  );
  React.useEffect(() => {
    updateAlignItemsAtEndMinSize();
  }, [updateAlignItemsAtEndMinSize]);
  reactNativeKeyboardController.useKeyboardHandler(
    // biome-ignore assist/source/useSortedKeys: prefer start/move/end
    {
      onStart: (event) => {
        "worklet";
        mode.set("running");
        const progress = clampProgress(event.progress);
        if (isKeyboardOpen.get() && progress >= 1 && event.height > 0) {
          return;
        }
        if (!didInteractive.get()) {
          if (event.height > 0) {
            keyboardHeight.set(event.height - safeAreaInsetBottom);
          }
          const vIsOpening = progress > 0;
          isOpening.set(vIsOpening);
          shouldUpdateAlignItemsAtEndMinSize.set(
            !!alignItemsAtEnd && !horizontal && contentLength.get() < scrollLength.get()
          );
          if (!shouldUpdateAlignItemsAtEndMinSize.get()) {
            reactNativeReanimated.runOnJS(clearAlignItemsAtEndMinSize)();
          }
          const vScrollOffset = scrollOffsetY.get();
          scrollOffsetAtKeyboardStart.set(vScrollOffset);
          if (isIos) {
            const vContentLength = contentLength.get();
            const vScrollLength = scrollLength.get();
            const vKeyboardHeight = keyboardHeight.get();
            const vEffectiveKeyboardHeight = calculateEffectiveKeyboardHeight(
              vKeyboardHeight,
              vContentLength,
              vScrollLength,
              alignItemsAtEnd
            );
            const targetOffset = Math.max(
              0,
              vIsOpening ? vScrollOffset + vEffectiveKeyboardHeight : vScrollOffset - vEffectiveKeyboardHeight
            );
            scrollOffsetY.set(targetOffset);
            animatedOffsetY.set(targetOffset);
            keyboardInset.set(vEffectiveKeyboardHeight);
            reactNativeReanimated.runOnJS(updateAlignItemsAtEndMinSize)(vEffectiveKeyboardHeight);
          } else if (isAndroid) {
            animatedOffsetY.set(vScrollOffset);
          }
          reactNativeReanimated.runOnJS(setScrollProcessingEnabled)(false);
        }
      },
      onInteractive: (event) => {
        "worklet";
        if (mode.get() !== "running") {
          reactNativeReanimated.runOnJS(setScrollProcessingEnabled)(false);
        }
        mode.set("running");
        if (!didInteractive.get()) {
          didInteractive.set(true);
        }
        if (isAndroid && !horizontal) {
          const newInset = calculateKeyboardInset(event.height, safeAreaInsetBottom);
          keyboardInset.set(newInset);
        }
        if (shouldUpdateAlignItemsAtEndMinSize.get() && !horizontal && alignItemsAtEnd) {
          const vKeyboardHeight = calculateKeyboardInset(event.height, safeAreaInsetBottom);
          const vEffectiveKeyboardHeight = calculateEffectiveKeyboardHeight(
            vKeyboardHeight,
            contentLength.get(),
            scrollLength.get(),
            alignItemsAtEnd
          );
          reactNativeReanimated.runOnJS(updateAlignItemsAtEndMinSize)(vEffectiveKeyboardHeight);
        }
      },
      onMove: (event) => {
        "worklet";
        const vIsOpening = isOpening.get();
        if (isAndroid) {
          if (!didInteractive.get()) {
            const progress = clampProgress(event.progress);
            const vKeyboardHeight = keyboardHeight.get();
            const vEffectiveKeyboardHeight = calculateEffectiveKeyboardHeight(
              vKeyboardHeight,
              contentLength.get(),
              scrollLength.get(),
              alignItemsAtEnd
            );
            const targetOffset = calculateKeyboardTargetOffset(
              scrollOffsetAtKeyboardStart.get(),
              vEffectiveKeyboardHeight,
              vIsOpening,
              progress
            );
            scrollOffsetY.set(targetOffset);
            animatedOffsetY.set(targetOffset);
          }
          if (!horizontal) {
            const newInset = calculateKeyboardInset(event.height, safeAreaInsetBottom);
            keyboardInset.set(newInset);
          }
        }
        if (!horizontal && alignItemsAtEnd && !vIsOpening && shouldUpdateAlignItemsAtEndMinSize.get()) {
          const vKeyboardHeight = calculateKeyboardInset(event.height, safeAreaInsetBottom);
          const vEffectiveKeyboardHeight = calculateEffectiveKeyboardHeight(
            vKeyboardHeight,
            contentLength.get(),
            scrollLength.get(),
            alignItemsAtEnd
          );
          reactNativeReanimated.runOnJS(updateAlignItemsAtEndMinSize)(vEffectiveKeyboardHeight);
        }
      },
      onEnd: (event) => {
        "worklet";
        const wasInteractive = didInteractive.get();
        const vMode = mode.get();
        mode.set("idle");
        if (vMode === "running") {
          const progress = clampProgress(event.progress);
          const vKeyboardHeight = keyboardHeight.get();
          const vEffectiveKeyboardHeight = calculateEffectiveKeyboardHeight(
            vKeyboardHeight,
            contentLength.get(),
            scrollLength.get(),
            alignItemsAtEnd
          );
          const vIsOpening = isOpening.get();
          if (!wasInteractive) {
            const targetOffset = calculateKeyboardTargetOffset(
              scrollOffsetAtKeyboardStart.get(),
              vEffectiveKeyboardHeight,
              vIsOpening,
              progress
            );
            scrollOffsetY.set(targetOffset);
            animatedOffsetY.set(targetOffset);
          }
          reactNativeReanimated.runOnJS(setScrollProcessingEnabled)(true);
          didInteractive.set(false);
          isKeyboardOpen.set(event.height > 0);
          if (!horizontal) {
            const newInset = calculateKeyboardInset(event.height, safeAreaInsetBottom);
            keyboardInset.set(newInset);
            reactNativeReanimated.runOnJS(reportContentInset)(newInset);
            if (!vIsOpening) {
              reactNativeReanimated.runOnJS(updateAlignItemsAtEndMinSize)(newInset);
            }
            if (newInset <= 0) {
              animatedOffsetY.set(scrollOffsetY.get());
            }
          }
        }
      }
    },
    [alignItemsAtEnd, horizontal, safeAreaInsetBottom, scrollViewRef]
  );
  const animatedProps = reactNativeReanimated.useAnimatedProps(() => {
    "worklet";
    var _a, _b, _c, _d;
    const vAnimatedOffsetY = animatedOffsetY.get();
    const baseProps = {
      contentOffset: vAnimatedOffsetY === null ? void 0 : {
        x: 0,
        y: vAnimatedOffsetY
      }
    };
    if (isIos) {
      const keyboardInsetBottom = keyboardInset.get();
      const contentInset = {
        bottom: ((_a = contentInsetProp == null ? void 0 : contentInsetProp.bottom) != null ? _a : 0) + (horizontal ? 0 : keyboardInsetBottom),
        left: (_b = contentInsetProp == null ? void 0 : contentInsetProp.left) != null ? _b : 0,
        right: (_c = contentInsetProp == null ? void 0 : contentInsetProp.right) != null ? _c : 0,
        top: (_d = contentInsetProp == null ? void 0 : contentInsetProp.top) != null ? _d : 0
      };
      return Object.assign(baseProps, {
        contentInset
      });
    } else {
      return baseProps;
    }
  });
  const style = isAndroid ? reactNativeReanimated.useAnimatedStyle(
    () => ({
      ...styleFlattened || {},
      marginBottom: keyboardInset.get()
    }),
    [styleProp, keyboardInset]
  ) : void 0;
  const contentContainerStyle = React.useMemo(() => {
    if (alignItemsAtEndMinSize === void 0) {
      return contentContainerStyleProp;
    }
    const minSizeStyle = horizontal ? { minWidth: alignItemsAtEndMinSize } : { minHeight: alignItemsAtEndMinSize };
    return contentContainerStyleProp ? [contentContainerStyleProp, minSizeStyle] : minSizeStyle;
  }, [alignItemsAtEndMinSize, contentContainerStyleProp, horizontal]);
  return /* @__PURE__ */ React__namespace.createElement(
    reanimated.AnimatedLegendList,
    {
      ...rest,
      animatedProps,
      automaticallyAdjustContentInsets: false,
      contentContainerStyle,
      keyboardDismissMode: "interactive",
      onMetricsChange: handleMetricsChange,
      onScroll: scrollHandler,
      ref: combinedRef,
      refScrollView: scrollViewRef,
      scrollIndicatorInsets: { bottom: 0, top: 0 },
      style
    }
  );
});

exports.KeyboardAvoidingLegendList = KeyboardAvoidingLegendList;
exports.LegendList = KeyboardAvoidingLegendList;

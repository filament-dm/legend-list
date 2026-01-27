import * as React from 'react';
import { forwardRef, useRef, useCallback } from 'react';
import { StyleSheet, Platform } from 'react-native';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
import { useAnimatedRef, useSharedValue, useAnimatedScrollHandler, runOnJS, useAnimatedProps, useAnimatedStyle } from 'react-native-reanimated';
import { AnimatedLegendList } from '@legendapp/list/reanimated';

// src/integrations/keyboard.tsx

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
var KeyboardAvoidingLegendList = forwardRef(function KeyboardAvoidingLegendList2(props, forwardedRef) {
  const {
    contentInset: contentInsetProp,
    horizontal,
    onMetricsChange: onMetricsChangeProp,
    onScroll: onScrollProp,
    safeAreaInsetBottom = 0,
    style: styleProp,
    ...rest
  } = props;
  const { alignItemsAtEnd } = props;
  const styleFlattened = StyleSheet.flatten(styleProp);
  const refLegendList = useRef(null);
  const combinedRef = useCombinedRef(forwardedRef, refLegendList);
  const isIos = Platform.OS === "ios";
  const isAndroid = Platform.OS === "android";
  const scrollViewRef = useAnimatedRef();
  const scrollOffsetY = useSharedValue(0);
  const animatedOffsetY = useSharedValue(null);
  const scrollOffsetAtKeyboardStart = useSharedValue(0);
  const mode = useSharedValue("idle");
  const keyboardInset = useSharedValue(0);
  const keyboardHeight = useSharedValue(0);
  const contentLength = useSharedValue(0);
  const scrollLength = useSharedValue(0);
  const alignItemsAtEndPadding = useSharedValue(0);
  const isOpening = useSharedValue(false);
  const didInteractive = useSharedValue(false);
  const isKeyboardOpen = useSharedValue(false);
  const scrollHandler = useAnimatedScrollHandler(
    (event) => {
      if (mode.get() !== "running" || didInteractive.get()) {
        scrollOffsetY.set(event.contentOffset[horizontal ? "x" : "y"]);
      }
      if (onScrollProp) {
        runOnJS(onScrollProp)(event);
      }
    },
    [onScrollProp, horizontal]
  );
  const setScrollProcessingEnabled = useCallback(
    (enabled) => {
      var _a;
      return (_a = refLegendList.current) == null ? void 0 : _a.setScrollProcessingEnabled(enabled);
    },
    [refLegendList]
  );
  const reportContentInset = useCallback(
    (bottom) => {
      var _a;
      return (_a = refLegendList.current) == null ? void 0 : _a.reportContentInset({ bottom });
    },
    [refLegendList]
  );
  const updateScrollMetrics = useCallback(() => {
    var _a;
    const state = (_a = refLegendList.current) == null ? void 0 : _a.getState();
    if (!state) {
      return;
    }
    contentLength.set(state.contentLength);
    scrollLength.set(state.scrollLength);
  }, [contentLength, scrollLength]);
  const handleMetricsChange = useCallback(
    (metrics) => {
      updateScrollMetrics();
      const nextPadding = metrics.alignItemsAtEndPadding || 0;
      alignItemsAtEndPadding.set(nextPadding);
      onMetricsChangeProp == null ? void 0 : onMetricsChangeProp(metrics);
    },
    [alignItemsAtEndPadding, onMetricsChangeProp, updateScrollMetrics]
  );
  useKeyboardHandler(
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
          } else if (isAndroid) {
            animatedOffsetY.set(vScrollOffset);
          }
          runOnJS(setScrollProcessingEnabled)(false);
        }
      },
      onInteractive: (event) => {
        "worklet";
        if (mode.get() !== "running") {
          runOnJS(setScrollProcessingEnabled)(false);
        }
        mode.set("running");
        if (!didInteractive.get()) {
          didInteractive.set(true);
        }
        if (isAndroid && !horizontal) {
          const newInset = calculateKeyboardInset(event.height, safeAreaInsetBottom);
          keyboardInset.set(newInset);
        }
      },
      onMove: isAndroid ? (event) => {
        "worklet";
        if (!didInteractive.get()) {
          const progress = clampProgress(event.progress);
          const vIsOpening = isOpening.get();
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
          if (isAndroid && !horizontal) {
            const newInset = calculateKeyboardInset(event.height, safeAreaInsetBottom);
            keyboardInset.set(newInset);
          }
        }
      } : void 0,
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
          runOnJS(setScrollProcessingEnabled)(true);
          didInteractive.set(false);
          isKeyboardOpen.set(event.height > 0);
          if (!horizontal) {
            const newInset = calculateKeyboardInset(event.height, safeAreaInsetBottom);
            keyboardInset.set(newInset);
            runOnJS(reportContentInset)(newInset);
            if (newInset <= 0) {
              animatedOffsetY.set(scrollOffsetY.get());
            }
          }
        }
      }
    },
    [alignItemsAtEnd, safeAreaInsetBottom, scrollViewRef]
  );
  const animatedProps = useAnimatedProps(() => {
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
  const style = isAndroid ? useAnimatedStyle(
    () => ({
      ...styleFlattened || {},
      marginBottom: keyboardInset.get()
    }),
    [styleProp, keyboardInset]
  ) : void 0;
  return /* @__PURE__ */ React.createElement(
    AnimatedLegendList,
    {
      ...rest,
      animatedProps,
      automaticallyAdjustContentInsets: false,
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

export { KeyboardAvoidingLegendList, KeyboardAvoidingLegendList as LegendList };

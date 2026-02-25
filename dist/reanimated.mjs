import * as React from 'react';
import { useCallback, memo } from 'react';
import { View } from 'react-native';
import Reanimated, { useAnimatedRef, useScrollViewOffset, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { LegendList, internal } from '@legendapp/list/react-native';

// src/integrations/reanimated.tsx
var { POSITION_OUT_OF_VIEW, IsNewArchitecture, useArr$, useCombinedRef, getComponent } = internal;
var typedMemo = memo;
var ReanimatedScrollBridge = typedMemo(function ReanimatedScrollBridgeComponent({
  forwardedRef,
  scrollOffset,
  ...props
}) {
  const animatedScrollRef = useAnimatedRef();
  useScrollViewOffset(animatedScrollRef, scrollOffset);
  const combinedRef = useCombinedRef(animatedScrollRef, forwardedRef);
  return /* @__PURE__ */ React.createElement(Reanimated.ScrollView, { ...props, ref: combinedRef });
});
var StickyOverlay = typedMemo(function StickyOverlayComponent({ stickyHeaderConfig }) {
  if (!(stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.backdropComponent)) {
    return null;
  }
  return /* @__PURE__ */ React.createElement(
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
  const viewStyle = React.useMemo(
    () => [style, { zIndex: index + 1e3 }, transformStyle],
    [index, style, transformStyle]
  );
  return /* @__PURE__ */ React.createElement(Reanimated.View, { ref: refView, style: viewStyle, ...rest }, /* @__PURE__ */ React.createElement(StickyOverlay, { stickyHeaderConfig }), children);
});
var ReanimatedPositionView = typedMemo(function ReanimatedPositionViewComponent(props) {
  const { id, horizontal, style, refView, children, recycleItems, layoutTransition, ...rest } = props;
  const [positionValue = POSITION_OUT_OF_VIEW, itemKey] = useArr$([
    `containerPosition${id}`,
    `containerItemKey${id}`
  ]);
  const prevItemKeyRef = React.useRef(void 0);
  const shouldSkipTransitionForRecycleReuse = !!recycleItems && itemKey !== void 0 && prevItemKeyRef.current !== void 0 && prevItemKeyRef.current !== itemKey;
  React.useEffect(() => {
    if (itemKey !== void 0) {
      prevItemKeyRef.current = itemKey;
    }
  }, [itemKey]);
  const viewStyle = React.useMemo(
    () => [style, horizontal ? { left: positionValue } : { top: positionValue }],
    [horizontal, positionValue, style]
  );
  return /* @__PURE__ */ React.createElement(
    Reanimated.View,
    {
      layout: shouldSkipTransitionForRecycleReuse ? void 0 : layoutTransition,
      ref: refView,
      style: viewStyle,
      ...rest
    },
    children
  );
});
var LegendListForwardedRef = typedMemo(
  // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  React.forwardRef(function LegendListForwardedRef2(props, ref) {
    const { itemLayoutAnimation, recycleItems, refLegendList, ...rest } = props;
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
        return /* @__PURE__ */ React.createElement(
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
    const stickyPositionComponentInternal = React.useMemo(
      () => function StickyPositionComponent(stickyProps) {
        return /* @__PURE__ */ React.createElement(ReanimatedPositionViewSticky, { ...stickyProps, stickyScrollOffset });
      },
      [stickyScrollOffset]
    );
    const itemLayoutAnimationRef = React.useRef(itemLayoutAnimation);
    itemLayoutAnimationRef.current = itemLayoutAnimation;
    const hasItemLayoutAnimation = !!itemLayoutAnimation;
    const positionComponentInternal = React.useMemo(() => {
      if (!hasItemLayoutAnimation) {
        return void 0;
      }
      return function PositionComponent(positionProps) {
        return /* @__PURE__ */ React.createElement(
          ReanimatedPositionView,
          {
            ...positionProps,
            layoutTransition: itemLayoutAnimationRef.current,
            recycleItems
          }
        );
      };
    }, [hasItemLayoutAnimation, recycleItems]);
    const legendListProps = {
      ...rest,
      positionComponentInternal,
      ...shouldUseReanimatedScrollView ? {
        renderScrollComponent: renderReanimatedScrollComponent,
        stickyPositionComponentInternal
      } : {}
    };
    return /* @__PURE__ */ React.createElement(LegendList, { ref: refFn, refScrollView: ref, ...legendListProps });
  })
);
var AnimatedLegendListComponent = Reanimated.createAnimatedComponent(LegendListForwardedRef);
var AnimatedLegendList = typedMemo(
  // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  React.forwardRef(function AnimatedLegendList2(props, ref) {
    const { refScrollView, ...rest } = props;
    const { animatedProps } = props;
    const refLegendList = React.useRef(null);
    const combinedRef = useCombinedRef(refLegendList, ref);
    return /* @__PURE__ */ React.createElement(
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

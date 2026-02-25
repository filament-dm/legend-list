'use strict';

var React = require('react');
var reactNative = require('react-native');
var Reanimated = require('react-native-reanimated');
var reactNative$1 = require('@legendapp/list/react-native');

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

var React__namespace = /*#__PURE__*/_interopNamespace(React);
var Reanimated__default = /*#__PURE__*/_interopDefault(Reanimated);

// src/integrations/reanimated.tsx
var { POSITION_OUT_OF_VIEW, IsNewArchitecture, useArr$, useCombinedRef, getComponent } = reactNative$1.internal;
var typedMemo = React.memo;
var ReanimatedScrollBridge = typedMemo(function ReanimatedScrollBridgeComponent({
  forwardedRef,
  scrollOffset,
  ...props
}) {
  const animatedScrollRef = Reanimated.useAnimatedRef();
  Reanimated.useScrollViewOffset(animatedScrollRef, scrollOffset);
  const combinedRef = useCombinedRef(animatedScrollRef, forwardedRef);
  return /* @__PURE__ */ React__namespace.createElement(Reanimated__default.default.ScrollView, { ...props, ref: combinedRef });
});
var StickyOverlay = typedMemo(function StickyOverlayComponent({ stickyHeaderConfig }) {
  if (!(stickyHeaderConfig == null ? void 0 : stickyHeaderConfig.backdropComponent)) {
    return null;
  }
  return /* @__PURE__ */ React__namespace.createElement(
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
  const viewStyle = React__namespace.useMemo(
    () => [style, { zIndex: index + 1e3 }, transformStyle],
    [index, style, transformStyle]
  );
  return /* @__PURE__ */ React__namespace.createElement(Reanimated__default.default.View, { ref: refView, style: viewStyle, ...rest }, /* @__PURE__ */ React__namespace.createElement(StickyOverlay, { stickyHeaderConfig }), children);
});
var ReanimatedPositionView = typedMemo(function ReanimatedPositionViewComponent(props) {
  const { id, horizontal, style, refView, children, recycleItems, layoutTransition, ...rest } = props;
  const [positionValue = POSITION_OUT_OF_VIEW, itemKey] = useArr$([
    `containerPosition${id}`,
    `containerItemKey${id}`
  ]);
  const prevItemKeyRef = React__namespace.useRef(void 0);
  const shouldSkipTransitionForRecycleReuse = !!recycleItems && itemKey !== void 0 && prevItemKeyRef.current !== void 0 && prevItemKeyRef.current !== itemKey;
  React__namespace.useEffect(() => {
    if (itemKey !== void 0) {
      prevItemKeyRef.current = itemKey;
    }
  }, [itemKey]);
  const viewStyle = React__namespace.useMemo(
    () => [style, horizontal ? { left: positionValue } : { top: positionValue }],
    [horizontal, positionValue, style]
  );
  return /* @__PURE__ */ React__namespace.createElement(
    Reanimated__default.default.View,
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
  React__namespace.forwardRef(function LegendListForwardedRef2(props, ref) {
    const { itemLayoutAnimation, recycleItems, refLegendList, ...rest } = props;
    const refFn = React.useCallback(
      (r) => {
        refLegendList(r);
      },
      [refLegendList]
    );
    const stickyScrollOffset = Reanimated.useSharedValue(0);
    const shouldUseReanimatedScrollView = IsNewArchitecture;
    const renderReanimatedScrollComponent = React.useCallback(
      (scrollViewProps) => {
        const { ref: forwardedRef, ...restScrollViewProps } = scrollViewProps;
        return /* @__PURE__ */ React__namespace.createElement(
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
    const stickyPositionComponentInternal = React__namespace.useMemo(
      () => function StickyPositionComponent(stickyProps) {
        return /* @__PURE__ */ React__namespace.createElement(ReanimatedPositionViewSticky, { ...stickyProps, stickyScrollOffset });
      },
      [stickyScrollOffset]
    );
    const itemLayoutAnimationRef = React__namespace.useRef(itemLayoutAnimation);
    itemLayoutAnimationRef.current = itemLayoutAnimation;
    const hasItemLayoutAnimation = !!itemLayoutAnimation;
    const positionComponentInternal = React__namespace.useMemo(() => {
      if (!hasItemLayoutAnimation) {
        return void 0;
      }
      return function PositionComponent(positionProps) {
        return /* @__PURE__ */ React__namespace.createElement(
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
    return /* @__PURE__ */ React__namespace.createElement(reactNative$1.LegendList, { ref: refFn, refScrollView: ref, ...legendListProps });
  })
);
var AnimatedLegendListComponent = Reanimated__default.default.createAnimatedComponent(LegendListForwardedRef);
var AnimatedLegendList = typedMemo(
  // biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
  React__namespace.forwardRef(function AnimatedLegendList2(props, ref) {
    const { refScrollView, ...rest } = props;
    const { animatedProps } = props;
    const refLegendList = React__namespace.useRef(null);
    const combinedRef = useCombinedRef(refLegendList, ref);
    return /* @__PURE__ */ React__namespace.createElement(
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

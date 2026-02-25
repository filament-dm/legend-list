// biome-ignore lint/correctness/noUnusedImports: Leaving this out makes it crash in some environments
import * as React from "react";
import { type ForwardedRef, forwardRef, useCallback, useRef } from "react";
import { type Insets, Platform, type ScrollViewProps, StyleSheet, ViewProps } from "react-native";
import { useKeyboardHandler } from "react-native-keyboard-controller";
import type Animated from "react-native-reanimated";
import {
    runOnJS,
    useAnimatedProps,
    useAnimatedRef,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import type { ReanimatedScrollEvent } from "react-native-reanimated/lib/typescript/hook/commonTypes";

import type { LegendListRef, TypedForwardRef } from "@legendapp/list";
import { AnimatedLegendList, type AnimatedLegendListProps } from "@legendapp/list/reanimated";
import { useCombinedRef } from "@/hooks/useCombinedRef";

type KeyboardControllerLegendListProps<ItemT> = Omit<AnimatedLegendListProps<ItemT>, "onScroll" | "contentInset"> & {
    onScroll?: (event: ReanimatedScrollEvent) => void;
    contentInset?: Insets | undefined;
    safeAreaInsetBottom?: number;
};

// biome-ignore lint/nursery/noShadow: const function name shadowing is intentional
export const KeyboardAvoidingLegendList = (forwardRef as TypedForwardRef)(function KeyboardAvoidingLegendList<ItemT>(
    props: KeyboardControllerLegendListProps<ItemT>,
    forwardedRef: ForwardedRef<LegendListRef>,
) {
    const {
        alignItemsAtEnd,
        contentInset: contentInsetProp,
        horizontal,
        onScroll: onScrollProp,
        safeAreaInsetBottom = 0,
        style: styleProp,
        ...rest
    } = props;

    const styleFlattened = StyleSheet.flatten(styleProp) as ScrollViewProps;
    const refLegendList = useRef<LegendListRef | null>(null);
    const combinedRef = useCombinedRef(forwardedRef, refLegendList);

    const isIos = Platform.OS === "ios";
    const isAndroid = Platform.OS === "android";
    const scrollViewRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffsetY = useSharedValue(0);
    const animatedOffsetY = useSharedValue<number | null>(null);
    const scrollOffsetAtKeyboardStart = useSharedValue(0);
    const mode = useSharedValue<"idle" | "running">("idle");
    const keyboardInset = useSharedValue(0);
    const keyboardHeight = useSharedValue(0);
    const isOpening = useSharedValue(false);
    const didInteractive = useSharedValue(false);
    // Track keyboard open state to ignore spurious iOS keyboard events
    const isKeyboardOpen = useSharedValue(false);
    // Track alignItemsPaddingTop at keyboard start to adjust scroll animation
    const alignPaddingAtKeyboardStart = useSharedValue(0);

    const scrollHandler = useAnimatedScrollHandler(
        (event) => {
            scrollOffsetY.set(event.contentOffset[horizontal ? "x" : "y"]);

            if (onScrollProp) {
                runOnJS(onScrollProp)(event);
            }
        },
        [onScrollProp, horizontal],
    );

    const setScrollProcessingEnabled = useCallback(
        (enabled: boolean) => {
            refLegendList.current?.setScrollProcessingEnabled(enabled);
        },
        [refLegendList],
    );

    // Capture alignItemsPaddingTop from the list state so the keyboard scroll
    // animation can account for padding that will be absorbed by layout changes.
    const captureAlignPadding = useCallback(() => {
        const state = refLegendList.current?.getState();
        alignPaddingAtKeyboardStart.set(state?.alignItemsPaddingTop ?? 0);
    }, []);

    useKeyboardHandler(
        // biome-ignore assist/source/useSortedKeys: prefer start/move/end
        {
            onStart: (event) => {
                "worklet";

                mode.set("running");

                // Ignore spurious events when keyboard is already open
                if (isKeyboardOpen.get() && event.progress === 1 && event.height > 0) {
                    return;
                }

                if (!didInteractive.get()) {
                    if (event.height > 0) {
                        keyboardHeight.set(event.height - safeAreaInsetBottom);
                    }

                    isOpening.set(event.progress > 0);

                    scrollOffsetAtKeyboardStart.set(scrollOffsetY.get());
                    animatedOffsetY.set(scrollOffsetY.get());
                    runOnJS(setScrollProcessingEnabled)(false);

                    if (alignItemsAtEnd) {
                        runOnJS(captureAlignPadding)();
                    }
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
                    keyboardInset.set(Math.max(0, event.height - safeAreaInsetBottom));
                }
            },
            onMove: (event) => {
                "worklet";

                if (!didInteractive.get()) {
                    const vIsOpening = isOpening.get();
                    const vKeyboardHeight = keyboardHeight.get();
                    const vProgress = vIsOpening ? event.progress : 1 - event.progress;

                    // When alignItemsAtEnd is active and content doesn't fill the screen,
                    // the align padding will shrink as the scroll view shrinks, already
                    // keeping items at the bottom. Reduce the scroll amount by the padding
                    // that will be absorbed by this layout change.
                    const vEffectiveKeyboardHeight = alignItemsAtEnd
                        ? Math.max(0, vKeyboardHeight - alignPaddingAtKeyboardStart.get())
                        : vKeyboardHeight;

                    const targetOffset = Math.max(
                        0,
                        scrollOffsetAtKeyboardStart.get() +
                            (vIsOpening ? vEffectiveKeyboardHeight : -vEffectiveKeyboardHeight) * vProgress,
                    );
                    scrollOffsetY.set(targetOffset);
                    animatedOffsetY.set(targetOffset);

                    if (!horizontal) {
                        keyboardInset.set(Math.max(0, event.height - safeAreaInsetBottom));
                    }
                }
            },
            onEnd: (event) => {
                "worklet";

                const wasInteractive = didInteractive.get();

                const vMode = mode.get();
                mode.set("idle");

                if (vMode === "running") {
                    if (!wasInteractive) {
                        const vIsOpening = isOpening.get();
                        const vKeyboardHeight = keyboardHeight.get();

                        const vEffectiveKeyboardHeight = alignItemsAtEnd
                            ? Math.max(0, vKeyboardHeight - alignPaddingAtKeyboardStart.get())
                            : vKeyboardHeight;

                        const targetOffset = Math.max(
                            0,
                            scrollOffsetAtKeyboardStart.get() +
                                (vIsOpening ? vEffectiveKeyboardHeight : -vEffectiveKeyboardHeight) *
                                    (vIsOpening ? event.progress : 1 - event.progress),
                        );

                        // Set both scrollOffsetY and animatedOffsetY so that it sets the new scroll position
                        // and also makes sure scrollOffsetY is up to date
                        scrollOffsetY.set(targetOffset);
                        animatedOffsetY.set(targetOffset);
                    }

                    runOnJS(setScrollProcessingEnabled)(true);

                    didInteractive.set(false);

                    isKeyboardOpen.set(event.height > 0);

                    if (!horizontal) {
                        const newInset = Math.max(0, event.height - safeAreaInsetBottom);
                        if (newInset > 0) {
                            keyboardInset.set(newInset);
                        } else {
                            keyboardInset.set(newInset);
                            animatedOffsetY.set(scrollOffsetY.get());
                        }
                    }
                }
            },
        },
        [scrollViewRef, safeAreaInsetBottom, alignItemsAtEnd],
    );

    const animatedProps = useAnimatedProps<ScrollViewProps>(() => {
        "worklet";

        const vAnimatedOffsetY = animatedOffsetY.get() as number | null;

        // Setting contentOffset animates the scroll with the keyboard
        const baseProps: ScrollViewProps = {
            contentOffset:
                vAnimatedOffsetY === null
                    ? undefined
                    : {
                          x: 0,
                          y: vAnimatedOffsetY,
                      },
        };

        // On iOS we can use contentInset to pad from the bottom
        return isIos
            ? Object.assign(baseProps, {
                  contentInset: {
                      bottom: (contentInsetProp?.bottom ?? 0) + (horizontal ? 0 : keyboardInset.get()),
                      left: contentInsetProp?.left ?? 0,
                      right: contentInsetProp?.right ?? 0,
                      top: contentInsetProp?.top ?? 0,
                  },
              })
            : baseProps;
    });

    // contentInset is not supported on Android so we have to use marginBottom instead
    const style = isAndroid
        ? useAnimatedStyle(
              () => ({
                  ...(styleFlattened || {}),
                  marginBottom: keyboardInset.get() ?? 0,
              }),
              [styleProp, keyboardInset],
          )
        : undefined;

    return (
        <AnimatedLegendList
            {...rest}
            alignItemsAtEnd={alignItemsAtEnd}
            animatedProps={animatedProps}
            keyboardDismissMode="interactive"
            onScroll={scrollHandler as unknown as AnimatedLegendListProps<ItemT>["onScroll"]}
            ref={combinedRef}
            refScrollView={scrollViewRef}
            scrollIndicatorInsets={{ bottom: 0, top: 0 }}
            style={style}
        />
    );
});

export { KeyboardAvoidingLegendList as LegendList };

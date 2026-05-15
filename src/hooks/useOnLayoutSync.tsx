// biome-ignore lint/style/useImportType: Leaving this out makes it crash in some environments
import * as React from "react";
import { useCallback, useLayoutEffect, useRef } from "react";
import { type LayoutChangeEvent, type LayoutRectangle, Platform, type View } from "react-native";

import { IsNewArchitecture } from "@/constants";

export function useOnLayoutSync<T extends View = View>(
    {
        ref,
        onLayoutProp,
        onLayoutChange,
    }: {
        ref: React.RefObject<T>;
        onLayoutProp?: (event: LayoutChangeEvent) => void;
        onLayoutChange: (rectangle: LayoutRectangle, fromLayoutEffect: boolean) => void;
    },
    deps: any[] = [],
) {
    const initialMeasureFrameRef = useRef<number | undefined>(undefined);

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            if (initialMeasureFrameRef.current !== undefined) {
                cancelAnimationFrame(initialMeasureFrameRef.current);
                initialMeasureFrameRef.current = undefined;
            }
            onLayoutChange(event.nativeEvent.layout, false);
            onLayoutProp?.(event);
        },
        [onLayoutChange],
    );

    if (IsNewArchitecture) {
        useLayoutEffect(() => {
            if (ref.current) {
                if (Platform.OS === "web") {
                    initialMeasureFrameRef.current = requestAnimationFrame(() => {
                        initialMeasureFrameRef.current = undefined;
                        ref.current?.measure((x, y, width, height) => {
                            onLayoutChange({ height, width, x, y }, true);
                        });
                    });
                } else {
                    ref.current.measure((x, y, width, height) => {
                        onLayoutChange({ height, width, x, y }, true);
                    });
                }
            }

            return () => {
                if (initialMeasureFrameRef.current !== undefined) {
                    cancelAnimationFrame(initialMeasureFrameRef.current);
                    initialMeasureFrameRef.current = undefined;
                }
            };
        }, deps);
    }

    return { onLayout };
}

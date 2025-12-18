import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import { L as LegendListProps, a as LegendListRef, V as ViewabilityCallback, b as ViewabilityAmountCallback, c as LegendListRecyclingState } from './types-CdqSrGnu.mjs';
export { C as ColumnWrapperStyle, w as GetRenderedItem, G as GetRenderedItemResult, v as InitialScrollAnchor, I as InternalState, d as LegendListPropsBase, h as LegendListRenderItemProps, i as LegendListState, f as MaintainScrollAtEndOptions, M as MaintainVisibleContentPositionConfig, e as MaintainVisibleContentPositionNormalized, O as OnViewableItemsChanged, r as ScrollIndexWithOffset, u as ScrollIndexWithOffsetAndContentOffset, s as ScrollIndexWithOffsetPosition, S as ScrollTarget, T as ThresholdSnapshot, o as TypedForwardRef, p as TypedMemo, k as ViewAmountToken, j as ViewToken, n as ViewabilityConfig, l as ViewabilityConfigCallbackPair, m as ViewabilityConfigCallbackPairs, g as ViewableRange, t as typedForwardRef, q as typedMemo } from './types-CdqSrGnu.mjs';
import 'react-native';
import 'react-native-reanimated';

declare const LegendList: (<T>(props: LegendListProps<T> & React.RefAttributes<LegendListRef>) => React.ReactNode) & {
    displayName?: string;
};

declare function useViewability<ItemT = any>(callback: ViewabilityCallback<ItemT>, configId?: string): void;
declare function useViewabilityAmount<ItemT = any>(callback: ViewabilityAmountCallback<ItemT>): void;
declare function useRecyclingEffect(effect: (info: LegendListRecyclingState<unknown>) => void | (() => void)): void;
declare function useRecyclingState<ItemT>(valueOrFun: ((info: LegendListRecyclingState<ItemT>) => ItemT) | ItemT): readonly [ItemT, Dispatch<SetStateAction<ItemT>>];
declare function useIsLastItem(): boolean;
declare function useListScrollSize(): {
    width: number;
    height: number;
};
declare function useSyncLayout(): () => void;

export { LegendList, LegendListProps, LegendListRecyclingState, LegendListRef, ViewabilityAmountCallback, ViewabilityCallback, useIsLastItem, useListScrollSize, useRecyclingEffect, useRecyclingState, useSyncLayout, useViewability, useViewabilityAmount };

import * as react_native from 'react-native';
import { SectionListData, SectionBase, SectionListRenderItemInfo, SectionListScrollParams } from 'react-native';
import * as React from 'react';
import { a as LegendListRef, L as LegendListProps } from './types-BlvUxaRT.js';
import 'react-native-reanimated';

type SectionListSeparatorProps<ItemT, SectionT> = {
    leadingItem?: ItemT;
    leadingSection?: SectionListData<ItemT, SectionT>;
    section: SectionListData<ItemT, SectionT>;
    trailingItem?: ItemT;
    trailingSection?: SectionListData<ItemT, SectionT>;
};
type SectionHeaderItem<SectionT> = {
    kind: "header";
    key: string;
    section: SectionT;
    sectionIndex: number;
};
type SectionFooterItem<SectionT> = {
    kind: "footer";
    key: string;
    section: SectionT;
    sectionIndex: number;
};
type SectionBodyItem<ItemT, SectionT> = {
    kind: "item";
    key: string;
    section: SectionT;
    sectionIndex: number;
    item: ItemT;
    itemIndex: number;
    absoluteItemIndex: number;
};
type SectionItemSeparator<ItemT, SectionT> = {
    kind: "item-separator";
    key: string;
    section: SectionT;
    sectionIndex: number;
    leadingItem: ItemT;
    leadingItemIndex: number;
    trailingItem?: ItemT;
};
type SectionSeparator<SectionT> = {
    kind: "section-separator";
    key: string;
    leadingSection: SectionT;
    leadingSectionIndex: number;
    trailingSection?: SectionT;
};
type FlatSectionListItem<ItemT, SectionT> = SectionHeaderItem<SectionT> | SectionFooterItem<SectionT> | SectionBodyItem<ItemT, SectionT> | SectionItemSeparator<ItemT, SectionT> | SectionSeparator<SectionT>;
type SectionMeta = {
    header?: number;
    footer?: number;
    items: number[];
};
type BuildSectionListDataResult<ItemT, SectionT> = {
    data: Array<FlatSectionListItem<ItemT, SectionT>>;
    sectionMeta: SectionMeta[];
    stickyHeaderIndices: number[];
};

type SectionListViewToken<ItemT, SectionT> = {
    item: ItemT;
    key: string;
    index: number;
    isViewable: boolean;
    section: SectionListData<ItemT, SectionT>;
};
type SectionListOnViewableItemsChanged<ItemT, SectionT> = ((info: {
    viewableItems: Array<SectionListViewToken<ItemT, SectionT>>;
    changed: Array<SectionListViewToken<ItemT, SectionT>>;
}) => void) | null;
type SectionListLegendProps<ItemT, SectionT> = Omit<LegendListProps<FlatSectionListItem<ItemT, SectionT>>, "data" | "children" | "renderItem" | "keyExtractor" | "ItemSeparatorComponent" | "getItemType" | "getFixedItemSize" | "stickyHeaderIndices" | "numColumns" | "columnWrapperStyle" | "onViewableItemsChanged">;
type SectionListProps<ItemT, SectionT extends SectionBase<ItemT> = SectionBase<ItemT>> = SectionListLegendProps<ItemT, SectionT> & {
    sections: ReadonlyArray<SectionListData<ItemT, SectionT>>;
    extraData?: any;
    renderItem?: (info: SectionListRenderItemInfo<ItemT, SectionT>) => React.ReactElement | null;
    renderSectionHeader?: (info: {
        section: SectionListData<ItemT, SectionT>;
    }) => React.ReactElement | null;
    renderSectionFooter?: (info: {
        section: SectionListData<ItemT, SectionT>;
    }) => React.ReactElement | null;
    ItemSeparatorComponent?: React.ComponentType<SectionListSeparatorProps<ItemT, SectionT>> | null;
    SectionSeparatorComponent?: React.ComponentType<SectionListSeparatorProps<ItemT, SectionT>> | React.ReactElement | null;
    keyExtractor?: (item: ItemT, index: number) => string;
    stickySectionHeadersEnabled?: boolean;
    onViewableItemsChanged?: SectionListOnViewableItemsChanged<ItemT, SectionT>;
};
type SectionListRef = LegendListRef & {
    scrollToLocation(params: SectionListScrollParams): void;
};
declare const SectionList: (<ItemT, SectionT extends SectionBase<ItemT, react_native.DefaultSectionT>>(props: SectionListLegendProps<ItemT, SectionT> & {
    sections: readonly SectionListData<ItemT, SectionT>[];
    extraData?: any;
    renderItem?: ((info: SectionListRenderItemInfo<ItemT, SectionT>) => React.ReactElement | null) | undefined;
    renderSectionHeader?: ((info: {
        section: SectionListData<ItemT, SectionT>;
    }) => React.ReactElement | null) | undefined;
    renderSectionFooter?: ((info: {
        section: SectionListData<ItemT, SectionT>;
    }) => React.ReactElement | null) | undefined;
    ItemSeparatorComponent?: React.ComponentType<SectionListSeparatorProps<ItemT, SectionT>> | null | undefined;
    SectionSeparatorComponent?: React.ReactElement<any, string | React.JSXElementConstructor<any>> | React.ComponentType<SectionListSeparatorProps<ItemT, SectionT>> | null | undefined;
    keyExtractor?: ((item: ItemT, index: number) => string) | undefined;
    stickySectionHeadersEnabled?: boolean;
    onViewableItemsChanged?: SectionListOnViewableItemsChanged<ItemT, SectionT> | undefined;
} & React.RefAttributes<SectionListRef>) => React.ReactNode) & {
    displayName?: string;
};

export { type BuildSectionListDataResult, type FlatSectionListItem, SectionList, type SectionListOnViewableItemsChanged, type SectionListProps, type SectionListRef, type SectionListSeparatorProps, type SectionListViewToken, type SectionMeta };

'use strict';

var React = require('react');
var reactNative = require('react-native');
var list = require('@legendapp/list');

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

// src/section-list/SectionList.tsx

// src/section-list/flattenSections.ts
var defaultKeyExtractor = (item, index) => {
  var _a;
  const key = (_a = item == null ? void 0 : item.key) != null ? _a : item == null ? void 0 : item.id;
  return key != null ? String(key) : String(index);
};
var getSectionKey = (section, sectionIndex) => {
  var _a;
  return (_a = section.key) != null ? _a : `section-${sectionIndex}`;
};
function buildSectionListData({
  sections,
  renderSectionHeader,
  renderSectionFooter,
  ItemSeparatorComponent,
  SectionSeparatorComponent,
  stickySectionHeadersEnabled,
  keyExtractor = defaultKeyExtractor
}) {
  var _a, _b;
  const data = [];
  const sectionMeta = [];
  const stickyHeaderIndices = [];
  let absoluteItemIndex = 0;
  for (let sectionIndex = 0; sectionIndex < sections.length; sectionIndex++) {
    const section = sections[sectionIndex];
    const items = (_a = section.data) != null ? _a : [];
    const meta = { items: [] };
    const sectionKey = getSectionKey(section, sectionIndex);
    const hasHeader = typeof renderSectionHeader === "function";
    const hasFooter = typeof renderSectionFooter === "function";
    const hasItemSeparator = Boolean(ItemSeparatorComponent || section.ItemSeparatorComponent);
    const hasSectionSeparator = Boolean(SectionSeparatorComponent);
    if (hasHeader) {
      const headerIndex = data.length;
      data.push({
        key: `${sectionKey}:header`,
        kind: "header",
        section,
        sectionIndex
      });
      meta.header = headerIndex;
      if (stickySectionHeadersEnabled) {
        stickyHeaderIndices.push(headerIndex);
      }
    }
    for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
      const item = items[itemIndex];
      const itemKeyExtractor = (_b = section.keyExtractor) != null ? _b : keyExtractor;
      const itemKey = itemKeyExtractor(item, itemIndex);
      data.push({
        absoluteItemIndex: absoluteItemIndex++,
        item,
        itemIndex,
        key: `${sectionKey}:item:${itemKey}`,
        kind: "item",
        section,
        sectionIndex
      });
      meta.items.push(data.length - 1);
      if (hasItemSeparator && itemIndex < items.length - 1) {
        data.push({
          key: `${sectionKey}:separator:${itemIndex}`,
          kind: "item-separator",
          leadingItem: item,
          leadingItemIndex: itemIndex,
          section,
          sectionIndex,
          trailingItem: items[itemIndex + 1]
        });
      }
    }
    if (hasFooter) {
      data.push({
        key: `${sectionKey}:footer`,
        kind: "footer",
        section,
        sectionIndex
      });
      meta.footer = data.length - 1;
    }
    const isLastSection = sectionIndex === sections.length - 1;
    if (hasSectionSeparator && !isLastSection) {
      data.push({
        key: `${sectionKey}:section-separator`,
        kind: "section-separator",
        leadingSection: section,
        leadingSectionIndex: sectionIndex,
        trailingSection: sections[sectionIndex + 1]
      });
    }
    sectionMeta.push(meta);
  }
  return { data, sectionMeta, stickyHeaderIndices };
}

// src/section-list/SectionList.tsx
var defaultSeparators = {
  highlight: () => {
  },
  unhighlight: () => {
  },
  updateProps: () => {
  }
};
function resolveSeparatorComponent(component, props) {
  if (!component) return null;
  if (React__namespace.isValidElement(component)) {
    return component;
  }
  const Component = component;
  return /* @__PURE__ */ React__namespace.createElement(Component, { ...props });
}
var SectionList = list.typedMemo(
  list.typedForwardRef(function SectionListInner(props, ref) {
    const {
      sections,
      renderItem: renderItemProp,
      renderSectionHeader,
      renderSectionFooter,
      ItemSeparatorComponent,
      SectionSeparatorComponent,
      stickySectionHeadersEnabled = reactNative.Platform.OS === "ios",
      keyExtractor,
      extraData,
      onViewableItemsChanged,
      horizontal,
      ...restProps
    } = props;
    const legendListRef = React__namespace.useRef(null);
    const flattened = React__namespace.useMemo(
      () => buildSectionListData({
        ItemSeparatorComponent,
        keyExtractor,
        renderSectionFooter,
        renderSectionHeader,
        SectionSeparatorComponent,
        sections,
        stickySectionHeadersEnabled: !horizontal && stickySectionHeadersEnabled
      }),
      [
        sections,
        extraData,
        renderSectionHeader,
        renderSectionFooter,
        ItemSeparatorComponent,
        SectionSeparatorComponent,
        stickySectionHeadersEnabled,
        keyExtractor,
        horizontal
      ]
    );
    const { data, sectionMeta, stickyHeaderIndices } = flattened;
    const handleViewableItemsChanged = React__namespace.useMemo(() => {
      if (!onViewableItemsChanged) return void 0;
      return ({
        viewableItems,
        changed
      }) => {
        const mapToken = (token) => {
          if (token.item.kind !== "item") return null;
          return {
            index: token.item.itemIndex,
            isViewable: token.isViewable,
            item: token.item.item,
            key: token.key,
            section: token.item.section
          };
        };
        const mappedViewable = viewableItems.map(mapToken).filter(Boolean);
        const mappedChanged = changed.map(mapToken).filter(Boolean);
        onViewableItemsChanged({ changed: mappedChanged, viewableItems: mappedViewable });
      };
    }, [onViewableItemsChanged]);
    const renderItem = React__namespace.useCallback(
      ({ item }) => {
        var _a, _b;
        switch (item.kind) {
          case "header":
            return renderSectionHeader ? renderSectionHeader({ section: item.section }) : null;
          case "footer":
            return renderSectionFooter ? renderSectionFooter({ section: item.section }) : null;
          case "item": {
            const render = (_a = item.section.renderItem) != null ? _a : renderItemProp;
            if (!render) return null;
            return render({
              index: item.itemIndex,
              item: item.item,
              section: item.section,
              separators: defaultSeparators
            });
          }
          case "item-separator": {
            const SeparatorComponent = (_b = item.section.ItemSeparatorComponent) != null ? _b : ItemSeparatorComponent;
            return resolveSeparatorComponent(SeparatorComponent, {
              leadingItem: item.leadingItem,
              leadingSection: item.section,
              section: item.section,
              trailingItem: item.trailingItem,
              trailingSection: item.section
            });
          }
          case "section-separator":
            return resolveSeparatorComponent(SectionSeparatorComponent, {
              leadingItem: void 0,
              leadingSection: item.leadingSection,
              section: item.leadingSection,
              trailingItem: void 0,
              trailingSection: item.trailingSection
            });
          default:
            return null;
        }
      },
      [
        ItemSeparatorComponent,
        SectionSeparatorComponent,
        renderItemProp,
        renderSectionFooter,
        renderSectionHeader
      ]
    );
    const scrollToLocation = React__namespace.useCallback(
      ({ sectionIndex, itemIndex, viewOffset, viewPosition, animated }) => {
        var _a, _b, _c;
        const meta = sectionMeta[sectionIndex];
        if (!meta) return;
        const target = itemIndex === -1 ? (_b = (_a = meta.header) != null ? _a : meta.items[0]) != null ? _b : meta.footer : meta.items[itemIndex];
        if (target === void 0) return;
        (_c = legendListRef.current) == null ? void 0 : _c.scrollToIndex({
          animated,
          index: target,
          viewOffset,
          viewPosition
        });
      },
      [sectionMeta]
    );
    React__namespace.useImperativeHandle(
      ref,
      () => ({
        ...legendListRef.current,
        scrollToLocation
      }),
      [scrollToLocation]
    );
    return /* @__PURE__ */ React__namespace.createElement(
      list.LegendList,
      {
        ...restProps,
        columnWrapperStyle: void 0,
        data,
        getItemType: (item) => item.kind,
        keyExtractor: (item) => item.key,
        numColumns: 1,
        onViewableItemsChanged: handleViewableItemsChanged,
        ref: legendListRef,
        renderItem,
        stickyHeaderIndices: !horizontal ? stickyHeaderIndices : void 0
      }
    );
  })
);

exports.SectionList = SectionList;

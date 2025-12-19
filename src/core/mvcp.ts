import { IsNewArchitecture } from "@/constants-platform";
import { getContentSize } from "@/state/getContentSize";
import type { StateContext } from "@/state/state";
import { getId } from "@/utils/getId";
import { getItemSize } from "@/utils/getItemSize";
import { requestAdjust } from "@/utils/requestAdjust";

export function prepareMVCP(ctx: StateContext, dataChanged?: boolean): (() => void) | undefined {
    const state = ctx.state;
    const { idsInView, positions, props } = state;
    const {
        maintainVisibleContentPosition: { data: mvcpData, size: mvcpScroll },
    } = props;
    const scrollingTo = state.scrollingTo;

    let prevPosition: number | undefined;
    let targetId: string | undefined;
    const idsInViewWithPositions: { id: string; position: number }[] = [];
    const scrollTarget = scrollingTo?.index;
    const scrollingToViewPosition = scrollingTo?.viewPosition;

    const shouldMVCP = dataChanged ? mvcpData : mvcpScroll;
    const indexByKey = state.indexByKey;

    console.log(
        `[MVCP] prepareMVCP called | ` +
        `dataChanged=${dataChanged} ` +
        `shouldMVCP=${shouldMVCP} ` +
        `(mvcpData=${mvcpData}, mvcpScroll=${mvcpScroll}) | ` +
        `hasInvalidationChanges=${state.hasInvalidationChanges} | ` +
        `scrollingTo=${scrollTarget !== undefined ? `index ${scrollTarget}` : 'none'} | ` +
        `idsInView=${idsInView.length} items`
    );

    if (shouldMVCP) {
        if (scrollTarget !== undefined) {
            if (!IsNewArchitecture && scrollingTo?.isInitialScroll) {
                // In old architecture, we don't want to do MVCP for the initial scroll
                // because it can cause inaccuracy
                return undefined;
            }
            // If we're currently scrolling to a target index, do MVCP for its position
            targetId = getId(state, scrollTarget);
        } else if (idsInView.length > 0 && state.didContainersLayout) {
            if (dataChanged) {
                // Do MVCP for the first item fully in view
                for (let i = 0; i < idsInView.length; i++) {
                    const id = idsInView[i];
                    const index = indexByKey.get(id);
                    if (index !== undefined) {
                        idsInViewWithPositions.push({ id, position: positions.get(id)! });
                    }
                }
            } else {
                // Do MVCP for the first item fully in view
                targetId = idsInView.find((id) => indexByKey.get(id) !== undefined);
            }
        }

        if (targetId !== undefined) {
            prevPosition = positions.get(targetId)!;
            console.log(
                `[MVCP] Target selected | ` +
                `id=${targetId} ` +
                `index=${indexByKey.get(targetId)} ` +
                `prevPosition=${prevPosition}px | ` +
                `mode=${dataChanged ? 'data-change' : 'size-change'}`
            );
        } else if (dataChanged && idsInViewWithPositions.length > 0) {
            console.log(
                `[MVCP] No single target, collected ${idsInViewWithPositions.length} items for data-change mode`
            );
        }

        // Return a function to do MVCP based on the prepared values
        return () => {
            let positionDiff = 0;

            // If data changed then we need to find the first item fully in view
            // which was exists in the new data
            if (dataChanged && targetId === undefined && mvcpData) {
                for (let i = 0; i < idsInViewWithPositions.length; i++) {
                    const { id, position } = idsInViewWithPositions[i];
                    const newPosition = positions.get(id);
                    if (newPosition !== undefined) {
                        positionDiff = newPosition - position;
                        console.log(
                            `[MVCP] Data-change mode found item | ` +
                            `id=${id} ` +
                            `index=${indexByKey.get(id)} ` +
                            `prevPos=${position.toFixed(1)}px ` +
                            `newPos=${newPosition.toFixed(1)}px ` +
                            `diff=${positionDiff.toFixed(1)}px | ` +
                            `hasInvalidationChanges=${state.hasInvalidationChanges}`
                        );
                        break;
                    }
                }
            }

            // If we have a targetId, then we can use the previous position of that item
            if (targetId !== undefined && prevPosition !== undefined) {
                const newPosition = positions.get(targetId);

                if (newPosition !== undefined) {
                    const totalSize = getContentSize(ctx);
                    let diff = newPosition - prevPosition;
                    const originalDiff = diff;

                    if (diff !== 0 && state.scroll + state.scrollLength > totalSize) {
                        // If we're scrolling to the end of the list, then there's two potential issues we workaround:
                        // 1. List items above the scroll target may be in view so we don't want to take too much adjusting
                        // 2. Adjusting too much could cause the list to scroll back up
                        if (diff > 0) {
                            diff = Math.max(0, totalSize - state.scroll - state.scrollLength);
                        } else {
                            diff = 0;
                        }
                        console.log(
                            `[MVCP] Near end-of-list adjustment | ` +
                            `originalDiff=${originalDiff.toFixed(1)}px ` +
                            `adjustedDiff=${diff.toFixed(1)}px | ` +
                            `scroll=${state.scroll.toFixed(1)} ` +
                            `scrollLength=${state.scrollLength.toFixed(1)} ` +
                            `totalSize=${totalSize.toFixed(1)}`
                        );
                    }

                    positionDiff = diff;

                    console.log(
                        `[MVCP] Position calculation | ` +
                        `targetId=${targetId} ` +
                        `prevPos=${prevPosition.toFixed(1)}px ` +
                        `newPos=${newPosition.toFixed(1)}px ` +
                        `diff=${diff.toFixed(1)}px | ` +
                        `hasInvalidationChanges=${state.hasInvalidationChanges}`
                    );
                }
            }

            if (scrollingToViewPosition && scrollingToViewPosition > 0) {
                const newSize = getItemSize(ctx, targetId!, scrollTarget!, state.props.data[scrollTarget!]);
                const prevSize = scrollingTo?.itemSize;
                if (newSize !== undefined && prevSize !== undefined && newSize !== scrollingTo?.itemSize) {
                    const diff = newSize - prevSize;
                    if (diff !== 0) {
                        positionDiff += (newSize - prevSize) * scrollingToViewPosition!;
                        scrollingTo.itemSize = newSize;
                    }
                }
            }

            if (Math.abs(positionDiff) > 0.1) {
                console.log(
                    `[MVCP] Requesting scroll adjustment | ` +
                    `adjustment=${positionDiff.toFixed(1)}px ` +
                    `fromScroll=${state.scroll.toFixed(1)}px ` +
                    `toScroll=${(state.scroll + positionDiff).toFixed(1)}px | ` +
                    `dataChanged=${dataChanged} ` +
                    `hasInvalidationChanges=${state.hasInvalidationChanges}`
                );
                requestAdjust(ctx, positionDiff, dataChanged && mvcpData);
            } else {
                console.log(
                    `[MVCP] Adjustment too small (${positionDiff.toFixed(3)}px), skipping`
                );
            }
        };
    }
}

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
        `[legend-list] prepareMVCP called: dataChanged=${dataChanged}, shouldMVCP=${shouldMVCP}, scrollTarget=${scrollTarget}, isExplicitAnchor=${(scrollingTo as any)?.isExplicitAnchor ?? false}`,
    );

    if (shouldMVCP) {
        if (scrollTarget !== undefined) {
            if (!IsNewArchitecture && scrollingTo?.isInitialScroll) {
                // In old architecture, we don't want to do MVCP for the initial scroll
                // because it can cause inaccuracy
                console.log("[legend-list] prepareMVCP: skipping, old arch initial scroll");
                return undefined;
            }
            // If we're currently scrolling to a target index, do MVCP for its position
            targetId = getId(state, scrollTarget);
            console.log(
                `[legend-list] prepareMVCP: using scrollTarget as anchor (index: ${scrollTarget}, id: ${targetId})`,
            );
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
                console.log(
                    `[legend-list] prepareMVCP: captured ${idsInViewWithPositions.length} items in view for data change MVCP`,
                );
            } else {
                // Do MVCP for the first item fully in view
                targetId = idsInView.find((id) => indexByKey.get(id) !== undefined);
                const targetIndex = targetId ? indexByKey.get(targetId) : undefined;
                console.log(
                    `[legend-list] prepareMVCP: using first visible item as anchor (index: ${targetIndex}, id: ${targetId})`,
                );
            }
        }

        if (targetId !== undefined) {
            prevPosition = positions.get(targetId)!;
            console.log(
                `[legend-list] prepareMVCP: anchor position captured (id: ${targetId}, prevPosition: ${prevPosition}px)`,
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
                            `[legend-list] MVCP: data change adjustment calculated (id: ${id}, prevPos: ${position}px, newPos: ${newPosition}px, diff: ${positionDiff}px)`,
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
                    console.log(
                        `[legend-list] MVCP: position adjustment calculated (id: ${targetId}, prevPos: ${prevPosition}px, newPos: ${newPosition}px, rawDiff: ${diff}px)`,
                    );

                    if (diff !== 0 && state.scroll + state.scrollLength > totalSize) {
                        // If we're scrolling to the end of the list, then there's two potential issues we workaround:
                        // 1. List items above the scroll target may be in view so we don't want to take too much adjusting
                        // 2. Adjusting too much could cause the list to scroll back up
                        const originalDiff = diff;
                        if (diff > 0) {
                            diff = Math.max(0, totalSize - state.scroll - state.scrollLength);
                        } else {
                            diff = 0;
                        }
                        console.log(
                            `[legend-list] MVCP: adjustment clamped for end-of-list (originalDiff: ${originalDiff}px, clampedDiff: ${diff}px)`,
                        );
                    }

                    positionDiff = diff;
                }
            }

            if (scrollingToViewPosition && scrollingToViewPosition > 0) {
                const newSize = getItemSize(ctx, targetId!, scrollTarget!, state.props.data[scrollTarget!]);
                const prevSize = scrollingTo?.itemSize;
                if (newSize !== undefined && prevSize !== undefined && newSize !== scrollingTo?.itemSize) {
                    const diff = newSize - prevSize;
                    if (diff !== 0) {
                        const viewPosAdjustment = (newSize - prevSize) * scrollingToViewPosition!;
                        console.log(
                            `[legend-list] MVCP: viewPosition adjustment (prevSize: ${prevSize}px, newSize: ${newSize}px, diff: ${diff}px, viewPos: ${scrollingToViewPosition}, adjustment: ${viewPosAdjustment}px)`,
                        );
                        positionDiff += viewPosAdjustment;
                        scrollingTo.itemSize = newSize;
                    }
                }
            }

            if (Math.abs(positionDiff) > 0.1) {
                console.log(
                    `[legend-list] MVCP: requesting scroll adjustment (positionDiff: ${positionDiff}px, threshold: 0.1px)`,
                );
                requestAdjust(ctx, positionDiff, dataChanged && mvcpData);
            } else {
                console.log(
                    `[legend-list] MVCP: no adjustment needed (positionDiff: ${positionDiff}px below threshold 0.1px)`,
                );
            }
        };
    }
}

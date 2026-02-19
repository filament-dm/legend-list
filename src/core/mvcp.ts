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
        maintainVisibleContentPosition: { data: mvcpData, size: mvcpScroll, shouldRestorePosition },
        alignItemsAtEnd,
    } = props;
    const scrollingTo = state.scrollingTo;

    let prevPosition: number | undefined;
    let targetId: string | undefined;
    const idsInViewWithPositions: { id: string; position: number }[] = [];
    const scrollTarget = scrollingTo?.index;
    const scrollingToViewPosition = scrollingTo?.viewPosition;

    const shouldMVCP = dataChanged ? mvcpData : mvcpScroll;
    const indexByKey = state.indexByKey;

    // console.log("prepareMVCP", ctx.contextNum, shouldMVCP, dataChanged, mvcpdataChanged, mvcpScroll);

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
                // Do MVCP for the first (or last if alignItemsAtEnd) item fully in view
                if (alignItemsAtEnd) {
                    // For chat UIs, anchor to bottom-most visible item
                    for (let i = idsInView.length - 1; i >= 0; i--) {
                        const id = idsInView[i];
                        const index = indexByKey.get(id);
                        if (index !== undefined) {
                            idsInViewWithPositions.push({ id, position: positions.get(id)! });
                        }
                    }
                } else {
                    // For normal lists, anchor to top-most visible item
                    for (let i = 0; i < idsInView.length; i++) {
                        const id = idsInView[i];
                        const index = indexByKey.get(id);
                        if (index !== undefined) {
                            idsInViewWithPositions.push({ id, position: positions.get(id)! });
                        }
                    }
                }
            } else {
                // Do MVCP for the first (or last if alignItemsAtEnd) item fully in view
                if (alignItemsAtEnd) {
                    // For chat UIs, anchor to bottom-most visible item
                    for (let i = idsInView.length - 1; i >= 0; i--) {
                        const id = idsInView[i];
                        const index = indexByKey.get(id);
                        if (index !== undefined) {
                            targetId = id;
                            break;
                        }
                    }
                } else {
                    // For normal lists, anchor to top-most visible item
                    targetId = idsInView.find((id) => indexByKey.get(id) !== undefined);
                }
            }
        }

        if (targetId !== undefined) {
            prevPosition = positions.get(targetId)!;
        }

        // Return a function to do MVCP based on the prepared values
        return () => {
            let positionDiff = 0;

            // If data changed then we need to find the first item fully in view
            // which was exists in the new data
            if (dataChanged && targetId === undefined && mvcpData) {
                const data = state.props.data;
                for (let i = 0; i < idsInViewWithPositions.length; i++) {
                    const { id, position } = idsInViewWithPositions[i];
                    const index = indexByKey.get(id);
                    if (index !== undefined && shouldRestorePosition) {
                        const item = data[index];
                        if (item === undefined || !shouldRestorePosition(item, index, data)) {
                            continue;
                        }
                    }
                    const newPosition = positions.get(id);
                    if (newPosition !== undefined) {
                        positionDiff = newPosition - position;
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

                    // Only apply the end-of-list guard when all items have been measured,
                    // so totalSize is accurate. When unmeasured items exist (e.g. after
                    // pagination prepends estimated items), totalSize is unreliable and
                    // the guard would incorrectly zero legitimate diffs, causing drift.
                    const allMeasured = state.sizesKnown.size >= (state.props.data?.length ?? 0);
                    if (allMeasured && diff !== 0 && state.scroll + state.scrollLength > totalSize) {
                        if (diff > 0) {
                            diff = Math.max(0, totalSize - state.scroll - state.scrollLength);
                        } else {
                            // Negative diffs (anchor moved up / content shrunk) pass through
                            // even at the end of the list — we need to scroll up to follow
                            // the anchor and prevent visual drift (Bug 3 fix).
                        }
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
                        positionDiff += (newSize - prevSize) * scrollingToViewPosition!;
                        scrollingTo.itemSize = newSize;
                    }
                }
            }

            if (Math.abs(positionDiff) > 0.1) {
                requestAdjust(ctx, positionDiff, dataChanged && mvcpData);
            }
        };
    }
}

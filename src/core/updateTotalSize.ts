import { addTotalSize } from "@/core/addTotalSize";
import { peek$, type StateContext } from "@/state/state";
import { getId } from "@/utils/getId";
import { getItemSize } from "@/utils/getItemSize";

export function updateTotalSize(ctx: StateContext) {
    const state = ctx.state;
    const {
        positions,
        sizesKnown,
        props: { data, debugSizing },
    } = state;
    const numColumns = peek$(ctx, "numColumns") ?? 1;

    if (data.length === 0) {
        addTotalSize(ctx, null, 0);
    } else {
        const lastIndex = data.length - 1;
        const lastId = getId(state, lastIndex);
        const lastPosition = positions[lastIndex];
        if (lastId !== undefined && lastPosition !== undefined) {
            if (numColumns > 1) {
                let rowStart = lastIndex;
                while (rowStart > 0) {
                    const column = state.columns[rowStart];
                    if (column === 1 || column === undefined) {
                        break;
                    }
                    rowStart -= 1;
                }

                let maxSize = 0;
                for (let i = rowStart; i <= lastIndex; i++) {
                    const rowId = state.idCache[i] ?? getId(state, i);
                    const size = getItemSize(ctx, rowId, i, data[i]);
                    if (size > maxSize) {
                        maxSize = size;
                    }
                }

                const totalSize = lastPosition + maxSize;
                if (debugSizing) {
                    console.log("[DRIFT DEBUG] Total size updated (multi-column):", {
                        allMeasured: sizesKnown.size >= data.length,
                        dataLength: data.length,
                        lastId,
                        lastIndex: data.length - 1,
                        lastPosition,
                        maxSize,
                        measuredCount: sizesKnown.size,
                        timestamp: Date.now(),
                        totalSize,
                    });
                }
                addTotalSize(ctx, null, totalSize);
            } else {
                const lastSize = getItemSize(ctx, lastId, lastIndex, data[lastIndex]);
                if (lastSize !== undefined) {
                    const totalSize = lastPosition + lastSize;
                    const lastSizeKnown = sizesKnown.get(lastId);
                    if (debugSizing) {
                        console.log("[DRIFT DEBUG] Total size updated:", {
                            allMeasured: sizesKnown.size >= data.length,
                            dataLength: data.length,
                            lastId,
                            lastIndex: data.length - 1,
                            lastPosition,
                            lastSize,
                            lastSizeIsEstimate: lastSizeKnown === undefined,
                            lastSizeKnown,
                            measuredCount: sizesKnown.size,
                            timestamp: Date.now(),
                            totalSize,
                        });
                    }
                    addTotalSize(ctx, null, totalSize);
                }
            }
        }
    }
}

import { LegendList as LegendListImpl } from "@/components/LegendList";
import type { LegendListComponent } from "@/types.web";

export const LegendList = LegendListImpl as LegendListComponent;

export {
    useIsLastItem,
    useListScrollSize,
    useRecyclingEffect,
    useRecyclingState,
    useSyncLayout,
    useViewability,
    useViewabilityAmount,
} from "@/state/ContextContainer";
export {
    InitializationCompletionType,
    InitializationMode,
    InitializationPhase,
} from "@/core/initialization/types";
export type { InitializationCompletionInfo } from "@/core/initialization/types";
export * from "@/types.web";

import "../setup"; // Import global test setup

import { InitializationManager } from "../../src/core/initialization/InitializationManager";
import type { StateContext } from "../../src/state/state";
import type { InternalState } from "../../src/types.base";
import { createMockState, DEFAULT_CONTENT_INSET } from "./createMockState";

// Create a properly typed mock context
export function createMockContext(
    initialValues: Record<string, any> = {},
    stateOverrides?: Parameters<typeof createMockState>[0],
): StateContext {
    const defaults: Record<string, any> = {
        contentInset: DEFAULT_CONTENT_INSET,
        mvcpMode: "regular",
        scrollAdjust: 0,
        scrollAdjustPending: 0,
        scrollAdjustUserOffset: 0,
        scrollingTo: undefined,
    };
    const values = new Map(Object.entries({ ...defaults, ...initialValues })) as StateContext["values"];
    const listeners = new Map() as StateContext["listeners"];
    const animatedScrollY = { setValue: () => undefined } as unknown as StateContext["animatedScrollY"];

    const ctx: StateContext = {
        animatedScrollY,
        columnWrapperStyle: undefined,
        contextNum: 0,
        initializationManager: null as any, // Will be set after state is created
        listeners,
        mapViewabilityAmountCallbacks: new Map() as StateContext["mapViewabilityAmountCallbacks"],
        mapViewabilityAmountValues: new Map() as StateContext["mapViewabilityAmountValues"],
        mapViewabilityCallbacks: new Map() as StateContext["mapViewabilityCallbacks"],
        mapViewabilityConfigStates: new Map() as StateContext["mapViewabilityConfigStates"],
        mapViewabilityValues: new Map() as StateContext["mapViewabilityValues"],
        positionListeners: new Map(),
        state: createMockState(stateOverrides) as InternalState,
        values,
        viewRefs: new Map() as StateContext["viewRefs"],
    };

    // Create InitializationManager with the context
    ctx.initializationManager = new InitializationManager(ctx);

    return ctx;
}

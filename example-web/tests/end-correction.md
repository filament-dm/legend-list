# End correction reproduction

This fixture runs against this checkout's LegendList source in the stock web example. It isolates a remaining scroll-position jump when a chat-like list receives older, mixed-height rows above the newest message. It has no Filament dependency.

## Run

```sh
bun install
cd example-web
bun install
bun run dev:fixtures
```

Open `/end-correction` on the Vite URL. The list starts with seven recent messages at the bottom of a 560px viewport and reserves 119px below them for a composer. After 600ms, 42 older message, membership, and date rows prepend. Those older rows first render at an 80px estimated height and settle to mixed heights 40ms later. The outlined **Newest message** row is the visual anchor; the trace beside it records its viewport Y coordinate, scroll offset, and maximum offset on every data commit, animation frame, and scroll event.

**Expected:** The newest original message remains at its initial viewport position (about Y=343px) while the older rows arrive and resize; the list stays pinned to the end, with no final gap.

**Observed on source main at `36773762`:** In Chromium, the newest row moved from Y=343px to Y=451px in repeated runs, even though the scroll offset briefly equaled its maximum. In that frame the newest row began below the reserved footer's start, indicating a temporary disagreement between row positioning and the tail position. One run also ended 40px short of the end. The source already includes the immediate item-measurement end-follow change from `1dd5b492db`, so this fixture captures a remaining issue.

Use **Reset** to repeat without a page reload. Query parameters isolate the conditions:

- `?lateHeight=0` disables the delayed row height changes.
- `?footer=0` removes the reserved composer space.
- `?auto=0` disables automatic prepending; use **Load older now** instead.
- `?bootstrap=1` starts with an empty list, then inserts the seven recent rows before the prepend.
- `?initial=all` starts with all rows already present.

**Append membership update** tests live additions. Scroll away from the end first to check that an update does not pull the reader back down. The controls and trace are diagnostic only; the list uses the ordinary `alignItemsAtEnd`, `initialScrollAtEnd`, `maintainScrollAtEnd`, `maintainVisibleContentPosition`, and `recycleItems` options.

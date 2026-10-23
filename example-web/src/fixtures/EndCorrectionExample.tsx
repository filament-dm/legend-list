import "./EndCorrectionExample.css";

import { memo, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

import { LegendList, useRecyclingState } from "@legendapp/list/react";

type Row = {
    id: string;
    kind: "message" | "membership" | "date";
    text: string;
    height: number;
};
type Sample = {
    ms: number;
    phase: string;
    top: number;
    max: number;
    newestY: number | null;
    rows: number;
};

const initialRows: Row[] = Array.from({ length: 7 }, (_, i) => ({
    height: i % 2 ? 62 : 96,
    id: `new-${i}`,
    kind: "message",
    text: i === 6 ? "Newest message — track this row" : `Recent message ${i + 1}`,
}));

const olderRows: Row[] = Array.from({ length: 42 }, (_, i) => ({
    height: i % 3 === 0 ? 28 : i % 3 === 1 ? 40 : i % 2 ? 120 : 64,
    id: `old-${i}`,
    kind: i % 3 === 0 ? "date" : i % 3 === 1 ? "membership" : "message",
    text: i % 3 === 0 ? `Day ${Math.floor(i / 3) + 1}` : i % 3 === 1 ? `Member ${i} joined` : `Earlier message ${i}`,
}));

const query = new URLSearchParams(location.search);
const delayMs = Math.max(0, Number(query.get("delay") ?? 600));
const auto = query.get("auto") !== "0";
const bootstrap = query.get("bootstrap") === "1";
const lateHeightMs = Math.max(0, Number(query.get("lateHeight") ?? 40));
const initialAll = query.get("initial") === "all";
const footer = query.get("footer") !== "0";
const startingRows = initialAll ? [...olderRows, ...initialRows] : bootstrap ? [] : initialRows;
const prependOlder = (current: Row[]) =>
    current.some((row) => row.id === "old-0") ? current : [...olderRows, ...current];
const appendRecent = (current: Row[]) =>
    current.some((row) => row.id === "new-0") ? current : [...current, ...initialRows];

function ReproRow({ item }: { item: Row }) {
    const [height, setHeight] = useRecyclingState(() =>
        lateHeightMs && item.id.startsWith("old-") ? 80 : item.height,
    );
    useEffect(() => {
        if (!lateHeightMs || !item.id.startsWith("old-")) return;
        const timeout = setTimeout(() => setHeight(item.height), lateHeightMs);
        return () => clearTimeout(timeout);
    }, [item, setHeight]);
    return (
        <div style={{ height }}>
            <div className={`row ${item.kind}`} data-row-id={item.id}>
                {item.text}
            </div>
        </div>
    );
}

const renderRow = ({ item }: { item: Row }) => <ReproRow item={item} />;
const getItemType = (item: Row) => item.kind;
const Footer = () => <div className="footer">Reserved composer space</div>;

const ReproList = memo(({ rows, run }: { rows: Row[]; run: number }) => (
    <LegendList<Row>
        alignItemsAtEnd
        data={rows}
        drawDistance={800}
        estimatedItemSize={80}
        getItemType={getItemType}
        initialScrollAtEnd
        key={run}
        keyExtractor={(item) => item.id}
        ListFooterComponent={footer ? Footer : undefined}
        maintainScrollAtEnd
        maintainScrollAtEndThreshold={0.2}
        maintainVisibleContentPosition={{ data: true, size: true }}
        recycleItems
        renderItem={renderRow}
        style={{ height: "100%" }}
    />
));

export default function EndCorrectionExample() {
    const [rows, setRows] = useState<Row[]>(startingRows);
    const [run, setRun] = useState(0);
    const [liveCount, setLiveCount] = useState(0);
    const listHost = useRef<HTMLDivElement>(null);
    const traceBody = useRef<HTMLTableSectionElement>(null);
    const started = useRef(performance.now());
    const rowCount = useRef(rows.length);
    rowCount.current = rows.length;

    const sample = useCallback((phase: string) => {
        const scroller = listHost.current?.firstElementChild as HTMLElement | null;
        const newest = listHost.current?.querySelector<HTMLElement>('[data-row-id="new-6"]');
        const next: Sample = {
            max: Math.round((scroller?.scrollHeight ?? 0) - (scroller?.clientHeight ?? 0)),
            ms: Math.round(performance.now() - started.current),
            newestY:
                newest && scroller
                    ? Math.round(newest.getBoundingClientRect().top - scroller.getBoundingClientRect().top)
                    : null,
            phase,
            rows: rowCount.current,
            top: Math.round(scroller?.scrollTop ?? 0),
        };
        const body = traceBody.current;
        if (!body) return;
        const row = document.createElement("tr");
        if (next.newestY !== null && next.newestY > 560) row.className = "shifted";
        for (const value of [next.ms, next.phase, next.rows, next.top, next.max, next.newestY ?? "—"]) {
            const cell = document.createElement("td");
            cell.textContent = String(value);
            row.append(cell);
        }
        body.prepend(row);
        if (body.children.length > 200) body.lastElementChild?.remove();
    }, []);

    useEffect(() => {
        if (!auto || initialAll) return;
        const first = bootstrap ? setTimeout(() => setRows(appendRecent), 100) : undefined;
        const timeout = setTimeout(() => setRows(prependOlder), delayMs);
        return () => {
            if (first) clearTimeout(first);
            clearTimeout(timeout);
        };
    }, [run]);

    useLayoutEffect(() => {
        sample("data commit");
        let frames = 0;
        let frameId = 0;
        const sampleFrame = () => {
            sample("frame");
            if (++frames < 30) frameId = requestAnimationFrame(sampleFrame);
        };
        frameId = requestAnimationFrame(sampleFrame);
        const later = setTimeout(() => sample("settled"), 120);
        return () => {
            clearTimeout(later);
            cancelAnimationFrame(frameId);
        };
    }, [rows, sample]);

    useEffect(() => {
        const scroller = listHost.current?.firstElementChild as HTMLElement | null;
        if (!scroller) return;
        const onScroll = () => sample("scroll");
        scroller.addEventListener("scroll", onScroll);
        return () => scroller.removeEventListener("scroll", onScroll);
    }, [run, sample]);

    const reset = () => {
        started.current = performance.now();
        traceBody.current?.replaceChildren();
        setRows(startingRows);
        setLiveCount(0);
        setRun((n) => n + 1);
    };

    const appendMembership = () => {
        setRows((current) => [
            ...current,
            {
                height: 40,
                id: `live-${liveCount}`,
                kind: "membership",
                text: `Live member ${liveCount + 1} joined`,
            },
        ]);
        setLiveCount((n) => n + 1);
    };

    return (
        <main className="end-correction-repro">
            <header>
                <h1>LegendList end correction reproduction</h1>
                <p>
                    Stock web source · {bootstrap ? "empty mount, then " : ""}seven recent messages, then 42 older
                    mixed-height rows prepend after {delayMs} ms. Older rows resize {lateHeightMs} ms after mounting.
                </p>
                <div className="controls">
                    <button onClick={reset} type="button">
                        Reset
                    </button>
                    <button onClick={() => setRows(prependOlder)} type="button">
                        Load older now
                    </button>
                    <button onClick={appendMembership} type="button">
                        Append membership update
                    </button>
                </div>
            </header>
            <section className="columns">
                <div className="list-host" ref={listHost}>
                    <ReproList rows={rows} run={run} />
                </div>
                <div className="trace">
                    <h2>Scroll trace</h2>
                    <p>
                        Newest Y is relative to the 560px list viewport. Recent samples are first; red means the newest
                        row has moved below it.
                    </p>
                    <table>
                        <thead>
                            <tr>
                                <th>ms</th>
                                <th>phase</th>
                                <th>rows</th>
                                <th>top</th>
                                <th>max</th>
                                <th>newest Y</th>
                            </tr>
                        </thead>
                        <tbody ref={traceBody} />
                    </table>
                </div>
            </section>
        </main>
    );
}

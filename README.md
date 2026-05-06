# HyperLiquid Order Book

A real-time order book UI for **Hyperliquid** (BTC/ETH), built with Next.js. Connects to the exchange WebSocket API, displays live bids/asks with configurable precision, and persists symbol/precision in localStorage.

---

## Tech Stack

- **Next.js 16** (App Router) with React 19
- **TypeScript**
- **Tailwind CSS v4** for styling
- **Hyperliquid** public WebSocket API for L2 order book data

---

## Approaches

### 1. **SSR-safe UI with localStorage**

Symbol and precision are stored in localStorage so user choices persist across reloads. Reading localStorage during SSR would cause a **hydration mismatch** (server has no `window`, so it always sees the default; the client sees the stored value).

**Approach:** Defer using stored values until after the first client paint.

- **`hasMounted`** — A boolean state set to `true` only inside `useEffect`, so it stays `false` on the server and on the first client render.
- **Display values** — `displaySymbol` and `displayPrecisionRaw` use the stored symbol/precision only when `hasMounted` is true; otherwise they use the same defaults as the server (`SYMBOLS[0]`, `1`).
- All UI that depends on symbol/precision (header selects, column headers, order book subscription) uses these display values. Result: server HTML and first client render match, then one update after mount applies the saved preferences.

Used in: `OrderBookWidget`.

### 2. **Custom localStorage hook with cross-tab sync**

`useCustomLocalStorage` wraps `useState` and syncs with `localStorage`. When the setter is called, it writes to storage and dispatches a synthetic `StorageEvent` so **other tabs** listening for `storage` see the change (native `storage` only fires in other tabs, not the one that wrote).

- **Getter:** On first run, if `window` exists, read from localStorage (or fall back to `initialValue` and persist it).
- **Setter:** Update state, write to localStorage, and dispatch a `StorageEvent` with the new value.
- **Listener:** `useEffect` subscribes to `window.addEventListener('storage', ...)` and updates state when another tab changes the same key.

Used for: `ORDER_BOOK_SYMBOL`, `ORDER_BOOK_PRECISION`.

### 3. **WebSocket order book subscription**

`useHyperliquidOrderBook` keeps a single WebSocket connection and subscribes to the L2 book for the current symbol and precision (`nSigFigs`, optional `mantissa`).

- **Subscribe/unsubscribe:** When symbol or precision changes, the hook sends `unsubscribe` for the previous params and `subscribe` for the new ones over the same connection (no reconnect).
- **Reconnect:** On close or error, it schedules a reconnect with backoff, then re-subscribes with the latest params held in a ref.
- **State:** Bids, asks, spread, and connection/error state are stored in React state and updated from WebSocket messages.

Used in: `OrderBookWidget`; data flows into `OrderBookSide` for rendering.

### 4. **Order book row computation and depth bars**

Order book levels are transformed in `helpers.ts` before rendering:

- **Slice by visibility** — Only the top N bids and last N asks are taken; N is derived from container height and fixed row height (`ROW_HEIGHT_PX`).
- **Cumulative depth** — For each side, cumulative size and notional are computed; depth percentage is `cumulative / max` so the rightmost row is 100%. This drives the colored depth bar width per row.
- **Row count** — A `ResizeObserver` in `OrderBookSide` watches the scroll container and updates `containerHeight`; `rowCount = floor(containerHeight / ROW_HEIGHT_PX)` so the number of visible rows adapts to layout.

Used in: `computeRows`, `OrderBookSide` (ResizeObserver), `OrderBookRow` (depth bar width).

### 5. **Portal for hover summary tooltip**

The “Size / Total” summary tooltip on row hover is rendered with **`createPortal`** into `document.body` so it isn’t clipped by overflow/stacking context.

- **Conditional portal** — The portal is only rendered when `hasMounted && typeof document !== 'undefined'`. That way the server and first client render don’t include the portal node, avoiding a hydration mismatch (server never has the portal; client would otherwise mount it immediately).
- **Positioning** — Helpers (`showSummaryBox`, `updateSummaryBoxPosition`, `hideSummaryBox`) show/hide the tooltip and position it from mouse coordinates.

Used in: `OrderBookSide` (portal + refs), `helpers.ts` (position/visibility).

### 6. **Row highlight and summary from mouse position**

Hover state is driven by **mouse position**, not by which row is under the pointer at render time (so it stays correct when the list scrolls or updates).

- **Data attributes** — Each row wrapper has `data-row-index`; the container has a ref. On `mouseEnter` we read the index from the target and apply highlight/summary from that index.
- **Highlight** — `applyHighlightFromIndex` / `clearRowHighlight` set `backgroundColor` on row DOM nodes from the container ref (no per-row highlight state in React).
- **Mouse leave** — On container `mouseLeave`, highlight and tooltip are cleared. While the mouse is inside the container, `mouseMove` updates the tooltip position.

Used in: `OrderBookSide` (handlers, refs), `helpers.ts` (DOM helpers).

### 7. **Row flash on data change (ref-only)**

When a row’s level data (e.g. size/total) changes, that row can show a short flash. To avoid extra re-renders, the flash is done with **refs only** (no `useState`).

- **Detection** — A ref holds the previous `{ sz, total }` (or `px` if flashing only on price-level change). In `useEffect`, if the ref is already set and the current level differs, we trigger a flash.
- **Animation** — A ref points to the row’s root DOM node. We add a class (e.g. `order-book-row-flash`) that runs a short keyframe animation (e.g. background fade), then remove the class after a timeout. Cleanup clears the timeout on unmount or dependency change.
- **Single flash** — The previous-value ref is updated as soon as we decide to flash, so rapid effect re-runs (e.g. Strict Mode or back-to-back updates) don’t trigger multiple flashes for the same logical change.

Used in: `OrderBookRow` (refs + `useEffect`), `globals.css` (keyframes + class).

### 8. **Symbol-specific precision options**

Precision (tick size / rounding) is per symbol: e.g. BTC might use 1, 2, 5, 10, 100, 1000; ETH 0.1, 0.2, 0.5, 1, 10, 100. A static map defines allowed precision values and the corresponding Hyperliquid subscription params (`nSigFigs`, `mantissa`). When the user switches symbol, precision is reset to the first option for the new symbol and the WebSocket subscription is updated.

Used in: `OrderBookWidget` (`PRECISION_MAP`, `PRECISION_OPTIONS`, `getValidPrecision`, `handleSymbolChange`).

---

## Running the project

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The order book connects to Hyperliquid’s public WebSocket; no API keys are required for read-only L2 data.

**Build:**

```bash
npm run build
npm start
```

**Deploy (e.g. Vercel):** Push to a Git provider and import the repo in Vercel, or use `npx vercel` after `npx vercel login`.

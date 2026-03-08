import { WsLevel } from '@/lib/hyperliquid/ws-types';

const HIGHLIGHT_BG_BID = 'rgba(63, 182, 139, 0.25)';
const HIGHLIGHT_BG_ASK = 'rgba(255, 83, 83, 0.25)';

export const ROW_HEIGHT_PX = 24;
export const ROW_INDEX_ATTR = 'data-row-index';
export const MAX_VISIBLE_ROWS = 20;
export const SUMMARY_OFFSET_PX = 12;
export const SUMMARY_SIZE_ATTR = 'data-summary-size';
export const SUMMARY_TOTAL_ATTR = 'data-summary-total';

export type RowData = {
  level: WsLevel;
  depthPercent: number;
  total: number;
};

export const computeRows = (
  levels: WsLevel[],
  isBid: boolean,
  rowCount: number
): RowData[] => {
  const slice = isBid ? levels.slice(0, rowCount) : levels.slice(-rowCount);
  const levelsForCum = isBid ? slice : [...slice].reverse();

  let cum = 0;

  const withCumulative = levelsForCum.map((level) => {
    const size = Number(level.sz);
    const price = Number(level.px);
    cum += size;
    return { level, cumulative: cum, totalPrice: size * price };
  });

  const max = cum || 1;

  const final = isBid ? withCumulative : withCumulative.reverse();

  return final.map(({ level, cumulative, totalPrice }) => ({
    level,
    depthPercent: (cumulative / max) * 100,
    total: totalPrice,
  }));
};

export const getRowIndexUnderPoint = (
  container: HTMLDivElement,
  x: number,
  y: number
): number | null => {
  const el = document.elementFromPoint(x, y);
  const rowEl = el?.closest<HTMLElement>(`[${ROW_INDEX_ATTR}]`);

  if (!rowEl || !container.contains(rowEl)) return null;

  const index = Number(rowEl.getAttribute(ROW_INDEX_ATTR));
  return Number.isNaN(index) ? null : index;
};

export const applyHighlightFromIndex = (
  container: HTMLDivElement,
  index: number,
  rows: RowData[],
  isBid: boolean
): void => {
  const highlightBg = isBid ? HIGHLIGHT_BG_BID : HIGHLIGHT_BG_ASK;
  const rowEls = container.querySelectorAll<HTMLElement>(`[${ROW_INDEX_ATTR}]`);
  rowEls.forEach((el) => {
    const i = Number(el.getAttribute(ROW_INDEX_ATTR));
    if (!Number.isNaN(i))
      el.style.backgroundColor = i >= index ? highlightBg : '';
  });
};

export const getOrderSummaryFromIndex = (
  rows: RowData[],
  index: number
): { sumSize: number; sumNotional: number } => {
  const slice = rows.slice(index);
  const sumSize = slice.reduce((acc, r) => acc + Number(r.level.sz), 0);
  const sumNotional = slice.reduce((acc, r) => acc + r.total, 0);
  return { sumSize, sumNotional };
};

export const clearRowHighlight = (container: HTMLDivElement | null): void => {
  if (!container) return;
  container
    .querySelectorAll<HTMLElement>(`[${ROW_INDEX_ATTR}]`)
    .forEach((el) => {
      el.style.backgroundColor = '';
    });
};

export const showSummaryBox = (
  box: HTMLDivElement | null,
  x: number,
  y: number,
  sumSize: number,
  sumNotional: number
): void => {
  if (!box) return;
  const sizeEl = box.querySelector<HTMLElement>(`[${SUMMARY_SIZE_ATTR}]`);
  const totalEl = box.querySelector<HTMLElement>(`[${SUMMARY_TOTAL_ATTR}]`);

  if (sizeEl) {
    const sizeValue = new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(sumSize);

    sizeEl.textContent = sizeValue;
  }

  if (totalEl) {
    totalEl.textContent = new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(sumNotional);
  }

  box.style.display = 'block';
  box.style.left = `${x + SUMMARY_OFFSET_PX}px`;
  box.style.top = `${y}px`;
  box.style.transform = 'translateY(-50%)';
};

export const hideSummaryBox = (box: HTMLDivElement | null): void => {
  if (box) box.style.display = 'none';
};

export const updateSummaryBoxPosition = (
  box: HTMLDivElement | null,
  x: number,
  y: number
): void => {
  if (!box || box.style.display !== 'block') return;
  box.style.left = `${x + SUMMARY_OFFSET_PX}px`;
  box.style.top = `${y}px`;
};

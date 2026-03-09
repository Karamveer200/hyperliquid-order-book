import { WsLevel } from '@/lib/hyperliquid/ws-types';
import {
  HIGHLIGHT_BG_BID,
  HIGHLIGHT_BG_ASK,
  ROW_INDEX_ATTR,
} from './constants';

export type RowData = {
  level: WsLevel;
  depthPercent: number;
  total: number;
};

export const isMobileScreenSize = () => {
  return typeof window !== 'undefined' && window.innerWidth < 740;
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
    depthPercent: Math.round((cumulative / max) * 100),
    total: totalPrice,
  }));
};

export const getRowIndexUnderPoint = (
  container: HTMLDivElement,
  x: number,
  y: number
): number | null => {
  if (isMobileScreenSize()) return null;

  const el = document.elementFromPoint(x, y);
  const rowEl = el?.closest<HTMLElement>(`[${ROW_INDEX_ATTR}]`);

  if (!rowEl || !container.contains(rowEl)) return null;

  const index = Number(rowEl.getAttribute(ROW_INDEX_ATTR));
  return Number.isNaN(index) ? null : index;
};

export const applyHighlightFromIndex = (
  container: HTMLDivElement,
  index: number,
  isBid: boolean
): void => {
  if (isMobileScreenSize()) return;

  const highlightBg = isBid ? HIGHLIGHT_BG_BID : HIGHLIGHT_BG_ASK;
  const rowEls = container.querySelectorAll<HTMLElement>(`[${ROW_INDEX_ATTR}]`);
  rowEls.forEach((el) => {
    const i = Number(el.getAttribute(ROW_INDEX_ATTR));
    if (Number.isNaN(i)) return;
    const inRange = isBid ? i <= index : i >= index;
    el.style.backgroundColor = inRange ? highlightBg : '';
  });
};

export const getOrderSummaryFromIndex = (
  rows: RowData[],
  index: number,
  isBid: boolean
): { sumSize: number; sumNotional: number } => {
  if (isMobileScreenSize()) return { sumSize: 0, sumNotional: 0 };

  const slice = isBid ? rows.slice(0, index + 1) : rows.slice(index);
  const sumSize = slice.reduce((acc, r) => acc + Number(r.level.sz), 0);
  const sumNotional = slice.reduce((acc, r) => acc + r.total, 0);
  return { sumSize, sumNotional };
};

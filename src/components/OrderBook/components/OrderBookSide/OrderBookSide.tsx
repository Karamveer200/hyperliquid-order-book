import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { WsLevel } from '@/lib/hyperliquid/ws-types';
import { OrderBookRow } from './OrderBookRow/OrderBookRow';
import {
  type RowData,
  computeRows,
  applyHighlightFromIndex,
  getRowIndexUnderPoint,
  getOrderSummaryFromIndex,
  clearRowHighlight,
  showSummaryBox,
  hideSummaryBox,
  updateSummaryBoxPosition,
  ROW_INDEX_ATTR,
  ROW_HEIGHT_PX,
  MAX_VISIBLE_ROWS,
  SUMMARY_SIZE_ATTR,
  SUMMARY_TOTAL_ATTR,
} from '../../utils/helpers';
import { Skeleton } from '@mui/material';
import CustomSkeleton from '@/components/shared/CustomSkeleton';

interface OrderBookSideProps {
  symbol: string;
  levels: WsLevel[];
  isBid?: boolean;
}

const OrderBookSideComponent = ({
  symbol,
  levels,
  isBid = false,
}: OrderBookSideProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const summaryBoxRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);
  const [containerHeight, setContainerHeight] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => setHasMounted(true), []);

  const clearHighlight = () => {
    clearRowHighlight(containerRef.current);
    hideSummaryBox(summaryBoxRef.current);
  };

  const showSummaryAtMouse = (index: number, rows: RowData[]) => {
    const pos = mousePositionRef.current;
    const box = summaryBoxRef.current;
    if (!pos || !box) return;
    const { sumSize, sumNotional } = getOrderSummaryFromIndex(
      rows,
      index,
      isBid
    );
    showSummaryBox(box, pos.x, pos.y, sumSize, sumNotional);
  };

  const handleRowMouseEnter = (
    e: React.MouseEvent<HTMLDivElement>,
    rows: RowData[]
  ) => {
    const index = Number(e.currentTarget.getAttribute(ROW_INDEX_ATTR));
    if (Number.isNaN(index)) return;
    const container = containerRef.current;
    if (!container) return;
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
    applyHighlightFromIndex(container, index, rows, isBid);
    showSummaryAtMouse(index, rows);
  };

  const handleContainerMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    mousePositionRef.current = { x: e.clientX, y: e.clientY };
    updateSummaryBoxPosition(summaryBoxRef.current, e.clientX, e.clientY);
  };

  const handleContainerMouseLeave = () => {
    mousePositionRef.current = null;
    clearHighlight();
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { height } = entries[0]?.contentRect ?? { height: 0 };
      setContainerHeight(height);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rowCount = Math.max(
    0,
    Math.min(MAX_VISIBLE_ROWS, Math.floor(containerHeight / ROW_HEIGHT_PX))
  );

  const rows = useMemo(
    () => computeRows(levels, isBid, rowCount),
    [levels, isBid, rowCount]
  );

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const pos = mousePositionRef.current;
    if (pos) {
      const index = getRowIndexUnderPoint(container, pos.x, pos.y);
      if (index !== null) {
        applyHighlightFromIndex(container, index, rowsRef.current, isBid);
        showSummaryAtMouse(index, rowsRef.current);
        return;
      }
    }
    mousePositionRef.current = null;
    clearHighlight();
  }, [rows, isBid]);

  const summaryPortal =
    hasMounted &&
    typeof document !== 'undefined' &&
    createPortal(
      <div
        ref={summaryBoxRef}
        className="fixed z-9999 min-w-[120px] rounded-xs border border-sys-border bg-sys-surface px-3 py-2 shadow-lg"
        style={{ display: 'none' }}
      >
        <div className="space-y-1 text-xs">
          <div className="flex justify-between gap-4">
            <span className="text-sys-text-muted">Size ({symbol})</span>
            <span
              {...{ [SUMMARY_SIZE_ATTR]: true }}
              className="tabular-nums text-white"
            />
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-sys-text-muted">Total ($)</span>
            <span
              {...{ [SUMMARY_TOTAL_ATTR]: true }}
              className="tabular-nums text-white"
            />
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <>
      <div
        ref={containerRef}
        className="flex h-full min-h-0 flex-col"
        onMouseMove={handleContainerMouseMove}
        onMouseLeave={handleContainerMouseLeave}
      >
        {rows?.length > 0 ? (
          <>
            {rows.map((row, index) => (
              <div
                key={index}
                {...{ [ROW_INDEX_ATTR]: index }}
                onMouseEnter={(e) => handleRowMouseEnter(e, rows)}
                className="transition-colors duration-150 fade-in"
              >
                <OrderBookRow
                  level={row.level}
                  depthPercent={row.depthPercent}
                  total={row.total}
                  isBid={isBid}
                />
              </div>
            ))}
          </>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <CustomSkeleton sx={{ width: '100%', flex: 1 }} />
          </div>
        )}
      </div>
      {summaryPortal}
    </>
  );
};

export const OrderBookSide = memo(OrderBookSideComponent);

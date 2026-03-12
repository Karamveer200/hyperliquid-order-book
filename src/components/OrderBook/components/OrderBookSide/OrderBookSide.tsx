import { memo, useMemo, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { WsLevel } from '@/lib/hyperliquid/ws-types';
import { OrderBookRow } from '@/components/OrderBook/components/OrderBookSide/OrderBookRow/OrderBookRow';
import {
  type RowData,
  computeRows,
  applyHighlightFromIndex,
  getRowIndexUnderPoint,
  getOrderSummaryFromIndex,
} from '@/components/OrderBook/utils/helpers';
import {
  ROW_INDEX_ATTR,
  ROW_HEIGHT_PX,
  MAX_VISIBLE_ROWS,
} from '@/components/OrderBook/utils/constants';
import { useOrderSummaryPortal } from '@/components/OrderBook/hooks/useOrderSummaryPortal';
import CustomSkeleton from '@/components/shared/CustomSkeleton';
import SummaryPortal from '@/components/OrderBook/components/OrderBookSide/SummaryPortal/SummaryPortal';

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
  const [containerHeight, setContainerHeight] = useState(0);
  const [hasMounted, setHasMounted] = useState(false);
  const prevRowsRef = useRef<RowData[]>([]);

  const rowsRef = useRef<RowData[]>([]);

  const {
    summaryBoxRef,
    mousePositionRef,
    showSummary,
    hideSummary,
    onMouseMove,
    onMouseLeave,
    clearRowHighlight,
  } = useOrderSummaryPortal(containerRef);

  const maxVisibleRowsCount = Math.max(
    0,
    Math.min(MAX_VISIBLE_ROWS, Math.floor(containerHeight / ROW_HEIGHT_PX))
  );

  const rows = useMemo(() => {
    const rows = computeRows(levels, isBid, maxVisibleRowsCount);
    return rows;
  }, [levels, isBid, maxVisibleRowsCount]);

  useEffect(() => setHasMounted(true), []);

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

  useEffect(() => {
    if (!prevRowsRef.current) {
      prevRowsRef.current = rows;
    } else {
      prevRowsRef.current = rowsRef.current;
    }

    rowsRef.current = rows;
  }, [rows]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const pos = mousePositionRef.current;

    if (pos) {
      const index = getRowIndexUnderPoint(container, pos.x, pos.y);
      if (index !== null) {
        applyHighlightFromIndex(container, index, isBid);
        showSummaryAtMouse(index, rowsRef.current);
        return;
      }
    }
    mousePositionRef.current = null;
    clearHighlight();
  }, [rows, isBid]);

  const clearHighlight = () => {
    clearRowHighlight(containerRef.current);
    hideSummary();
  };

  const showSummaryAtMouse = (index: number, rows: RowData[]) => {
    const pos = mousePositionRef.current;
    const container = containerRef.current;

    if (!pos || !container) return;
    const containerRight = container.getBoundingClientRect().right;

    const { sumSize, sumNotional } = getOrderSummaryFromIndex(
      rows,
      index,
      isBid
    );

    showSummary(containerRight, pos.y, sumSize, sumNotional);
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
    applyHighlightFromIndex(container, index, isBid);

    showSummaryAtMouse(index, rows);
  };

  const findNewPriceLevels = useMemo(() => {
    return rowsRef.current.filter(
      (row) =>
        !prevRowsRef.current.some(
          (prevRow) => prevRow.level.px === row.level.px
        )
    );
  }, [prevRowsRef.current, rowsRef.current]);

  const findRemovedPriceLevels = useMemo(() => {
    return prevRowsRef.current
      .map((oldRow, oldIndex) => {
        const isRowRemoved = !rowsRef.current.some(
          (newRow) => newRow.level.px === oldRow.level.px
        );

        if (isRowRemoved) return oldIndex;
      })
      .filter((index) => index !== undefined);
  }, [prevRowsRef.current, rowsRef.current]);

  const summaryPortal =
    hasMounted &&
    typeof document !== 'undefined' &&
    createPortal(
      <SummaryPortal summaryBoxRef={summaryBoxRef} symbol={symbol} />,
      document.body
    );

  return (
    <>
      <div
        ref={containerRef}
        className={`flex h-full min-h-0 sm:justify-start sm:flex-col ${isBid ? 'flex-col' : 'flex-col-reverse justify-end'}`}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
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
                  isNew={findNewPriceLevels.some(
                    (newRow) => newRow.level.px === row.level.px
                  )}
                  isSwapped={findRemovedPriceLevels.includes(index)}
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

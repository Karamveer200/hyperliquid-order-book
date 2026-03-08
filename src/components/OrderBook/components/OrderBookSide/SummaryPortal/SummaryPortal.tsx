import {
  SUMMARY_SIZE_ATTR,
  SUMMARY_TOTAL_ATTR,
} from '@/components/OrderBook/utils/constants';
import { RefObject } from 'react';

const SummaryPortal = ({
  summaryBoxRef,
  symbol,
}: {
  summaryBoxRef: RefObject<HTMLDivElement | null>;
  symbol: string;
}) => {
  return (
    <div
      ref={summaryBoxRef}
      className="fixed z-9999 min-w-[140px] rounded-xs border border-sys-border bg-sys-surface px-3 py-2 shadow-lg"
      style={{ display: 'none' }}
    >
      <div className="space-y-1 text-xs">
        <div className="flex justify-between gap-4">
          <span className="text-sys-text-muted font-semibold">
            Size ({symbol})
          </span>
          <span
            {...{ [SUMMARY_SIZE_ATTR]: true }}
            className="tabular-nums text-white"
          />
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-sys-text-muted font-semibold">Total ($)</span>
          <span
            {...{ [SUMMARY_TOTAL_ATTR]: true }}
            className="tabular-nums text-white font-light"
          />
        </div>
      </div>
    </div>
  );
};

export default SummaryPortal;

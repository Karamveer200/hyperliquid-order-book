'use client';

import { useRef } from 'react';
import type { RefObject } from 'react';
import {
  ROW_INDEX_ATTR,
  SUMMARY_OFFSET_PX,
  SUMMARY_SIZE_ATTR,
  SUMMARY_TOTAL_ATTR,
} from '@/components/OrderBook/utils/constants';
import { isMobileScreenSize } from '@/components/OrderBook/utils/helpers';

export interface UseOrderSummaryPortalReturn {
  summaryBoxRef: RefObject<HTMLDivElement | null>;
  mousePositionRef: RefObject<{ x: number; y: number } | null>;
  showSummary: (
    containerRight: number,
    mouseY: number,
    sumSize: number,
    sumNotional: number
  ) => void;
  hideSummary: () => void;
  onMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMouseLeave: () => void;
  clearRowHighlight: (container: HTMLDivElement | null) => void;
}

const showSummaryBox = (
  box: HTMLDivElement | null,
  x: number,
  y: number,
  sumSize: number,
  sumNotional: number
): void => {
  if (isMobileScreenSize() || !box) return;

  const sizeEl = box.querySelector<HTMLElement>(`[${SUMMARY_SIZE_ATTR}]`);
  const totalEl = box.querySelector<HTMLElement>(`[${SUMMARY_TOTAL_ATTR}]`);

  if (sizeEl) {
    const sizeValue = new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 3,
    }).format(sumSize);

    sizeEl.textContent = sizeValue;
  }

  if (totalEl) {
    totalEl.textContent = new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 3,
    }).format(sumNotional);
  }

  box.style.display = 'block';
  box.style.left = `${x + SUMMARY_OFFSET_PX}px`;
  box.style.top = `${y}px`;
  box.style.transform = 'translateY(-50%)';
};

const hideSummaryBox = (box: HTMLDivElement | null): void => {
  if (box) box.style.display = 'none';
};

const updateSummaryBoxPosition = (
  box: HTMLDivElement | null,
  x: number,
  y: number
): void => {
  if (!box || box.style.display !== 'block') return;
  box.style.left = `${x + SUMMARY_OFFSET_PX}px`;
  box.style.top = `${y}px`;
};

export function useOrderSummaryPortal(
  containerRef: RefObject<HTMLDivElement | null>
): UseOrderSummaryPortalReturn {
  const summaryBoxRef = useRef<HTMLDivElement>(null);
  const mousePositionRef = useRef<{ x: number; y: number } | null>(null);

  const showSummary = (
    containerRight: number,
    mouseY: number,
    sumSize: number,
    sumNotional: number
  ) => {
    showSummaryBox(
      summaryBoxRef.current,
      containerRight,
      mouseY,
      sumSize,
      sumNotional
    );
  };

  const hideSummary = () => {
    hideSummaryBox(summaryBoxRef.current);
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobileScreenSize()) return;
    mousePositionRef.current = { x: e.clientX, y: e.clientY };

    const container = containerRef.current;
    if (container) {
      const containerRight = container.getBoundingClientRect().right;

      updateSummaryBoxPosition(
        summaryBoxRef.current,
        containerRight,
        e.clientY
      );
    }
  };

  const clearRowHighlight = (container: HTMLDivElement | null): void => {
    if (!container) return;
    container
      .querySelectorAll<HTMLElement>(`[${ROW_INDEX_ATTR}]`)
      .forEach((el) => {
        el.style.backgroundColor = '';
      });
  };

  const onMouseLeave = () => {
    mousePositionRef.current = null;
    hideSummary();
    clearRowHighlight(containerRef.current);
  };

  return {
    summaryBoxRef,
    mousePositionRef,
    showSummary,
    hideSummary,
    onMouseMove,
    onMouseLeave,
    clearRowHighlight,
  };
}

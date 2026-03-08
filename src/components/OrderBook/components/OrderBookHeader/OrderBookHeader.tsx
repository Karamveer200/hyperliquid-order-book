import { SelectMenu } from '@/components/shared/SelectMenu/SelectMenu';
import type { CustomSelectOption } from '@/components/shared/SelectMenu/SelectMenu';

interface OrderBookHeaderProps {
  symbolOptions: CustomSelectOption[];
  symbolOption: CustomSelectOption | null;
  precisionOptions: CustomSelectOption[];
  precisionOption: CustomSelectOption | null;
  onSymbolChange: (option: CustomSelectOption) => void;
  onPrecisionChange: (option: CustomSelectOption) => void;
  isConnected: boolean;
}

export function OrderBookHeader({
  symbolOptions,
  symbolOption,
  precisionOptions,
  precisionOption,
  onSymbolChange,
  onPrecisionChange,
  isConnected,
}: OrderBookHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between border-b border-sys-border px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm text-sys-text-muted">Symbol</span>
        <div className="min-w-[70px]">
          <SelectMenu
            options={symbolOptions}
            value={symbolOption}
            onChange={(value) => onSymbolChange(value as CustomSelectOption)}
            isSearchable={false}
          />
        </div>

        <span className="ml-2 text-sm text-sys-text-muted">Precision</span>
        <div className="min-w-[60px]">
          <SelectMenu
            options={precisionOptions}
            value={precisionOption}
            onChange={(value) => onPrecisionChange(value as CustomSelectOption)}
            isSearchable={false}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`h-2 w-2 rounded-full ${isConnected ? 'bg-sys-bid' : 'bg-amber-400'}`}
          title={isConnected ? 'Live' : 'Connecting'}
        />
        <span className="text-xs text-sys-text-muted">
          {isConnected ? 'Live' : 'Connecting'}
        </span>
      </div>
    </header>
  );
}

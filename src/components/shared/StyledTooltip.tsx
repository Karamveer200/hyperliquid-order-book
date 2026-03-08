import { Tooltip as MuiTooltip, TooltipProps } from '@mui/material';
import { theme } from '@/lib/theme/theme';
import { Roboto_Mono } from 'next/font/google';

interface StyledTooltipProps extends TooltipProps {
  bodyPadding?: string;
}

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

const StyledTooltip = ({
  bodyPadding = '4px 8px',
  ...props
}: StyledTooltipProps) => {
  return (
    <MuiTooltip
      {...props}
      className={robotoMono.className}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: theme.colors.systemBlack800,
            color: theme.colors.light,
            fontSize: '14px',
            fontWeight: 400,
            borderRadius: '2px',
            padding: bodyPadding,
            border: `1px solid ${theme.colors.coolGray}`,
            maxWidth: '400px',
            fontFamily: 'Roboto Mono',
            '& .MuiTooltip-arrow': {
              color: theme.colors.systemBlack200,
            },
            "&[data-popper-placement*='right'] .MuiTooltip-arrow::before": {
              transformOrigin: '110% 110%',
            },
            '& .MuiTooltip-arrow::before': {
              border: `1px solid ${theme.colors.coolGray}`,
              borderRadius: '2px',
              transform: 'rotate(47deg)',
            },
          },
        },
      }}
    />
  );
};

export default StyledTooltip;

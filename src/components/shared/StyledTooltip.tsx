import { Tooltip as MuiTooltip, TooltipProps } from '@mui/material';
import { Roboto_Mono } from 'next/font/google';

interface StyledTooltipProps extends TooltipProps {
  bodyPadding?: string;
}

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export const StyledTooltip = ({
  bodyPadding = '4px 8px',
  ...props
}: StyledTooltipProps) => {
  return (
    <MuiTooltip
      {...props}
      arrow
      className={robotoMono.className}
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: '#1E1E1E',
            color: '#E5E7EB',
            fontSize: '14px',
            fontWeight: 400,
            borderRadius: '2px',
            padding: bodyPadding,
            border: '1px solid #3A3A3A',
            maxWidth: '400px',
            fontFamily: 'Roboto Mono',
          },
        },
        arrow: {
          sx: {
            color: '#1E1E1E',
            '&::before': {
              border: '1px solid #3A3A3A',
            },
          },
        },
      }}
    />
  );
};

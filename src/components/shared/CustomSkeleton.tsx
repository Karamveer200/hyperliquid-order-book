import { Skeleton, SkeletonProps } from '@mui/material';

const CustomSkeleton = ({ sx, ...props }: SkeletonProps) => {
  return (
    <Skeleton
      variant="rectangular"
      height={90}
      animation="wave"
      sx={{
        borderRadius: '2px',
        bgcolor: '#000000',
        '&::after': {
          background:
            'linear-gradient(90deg, transparent, rgb(255 255 255 / 14%), transparent)',
        },

        ...sx,
      }}
      {...props}
    />
  );
};

export default CustomSkeleton;

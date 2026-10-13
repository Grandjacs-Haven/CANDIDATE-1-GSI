import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// ==============================|| AUTH BACKGROUND ||============================== //

export default function AuthBackground() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: -1,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #fffdfb 0%, #fff7f4 48%, #f6e9e6 100%)'
      }}
    >
      <Box
        component="img"
        src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070"
        alt=""
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center',
          opacity: 0.13,
          filter: 'grayscale(100%) contrast(110%)'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(90deg, rgba(255,253,251,0.98) 0%, rgba(255,253,251,0.9) 38%, rgba(255,247,244,0.58) 67%, rgba(246,233,230,0.74) 100%)'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          top: -140,
          right: -80,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${theme.palette.primary.light} 0%, transparent 70%)`,
          opacity: 0.22,
          filter: 'blur(70px)'
        }}
      />

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          lineHeight: 0,
          opacity: 0.07
        }}
      >
        <svg width="100%" viewBox="0 0 1000 300" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice">
          <path
            d="M0 300H1000V250H950V100H850V250H820V150H720V250H680V50H550V250H500V120H400V250H350V80H220V250H180V180H80V300H0Z"
            fill={theme.palette.primary.main}
          />
        </svg>
      </Box>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '18vh',
          background: `linear-gradient(to top, ${theme.palette.background.default}, transparent)`
        }}
      />
    </Box>
  );
}

// material-ui
import Box from '@mui/material/Box';

// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon() {
  return (
    <Box
      sx={{
        width: 35,
        height: 35,
        borderRadius: 1.5,
        display: 'grid',
        placeItems: 'center',
        background: 'linear-gradient(135deg, #7f1d1d 0%, #c62828 60%, #ef4444 100%)',
        boxShadow: '0 10px 24px rgba(198, 40, 40, 0.28)',
        position: 'relative'
      }}
    >
      <Box
        sx={{
          width: 16,
          height: 16,
          position: 'relative',
          '&::before, &::after': {
            content: '""',
            position: 'absolute',
            bgcolor: 'common.white',
            borderRadius: 999
          },
          '&::before': {
            inset: '6px 0'
          },
          '&::after': {
            inset: '0 6px'
          }
        }}
      />
    </Box>
  );
}

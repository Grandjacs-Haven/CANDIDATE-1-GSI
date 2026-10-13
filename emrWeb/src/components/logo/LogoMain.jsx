// material-ui
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

// ==============================|| LOGO WORDMARK ||============================== //

export default function LogoMain() {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: 1.5,
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, #7f1d1d 0%, #c62828 60%, #ef4444 100%)',
          boxShadow: '0 10px 24px rgba(198, 40, 40, 0.24)',
          position: 'relative'
        }}
      >
        <Box
          sx={{
            width: 15,
            height: 15,
            position: 'relative',
            '&::before, &::after': {
              content: '""',
              position: 'absolute',
              bgcolor: 'common.white',
              borderRadius: 999
            },
            '&::before': {
              inset: '5px 0'
            },
            '&::after': {
              inset: '0 5px'
            }
          }}
        />
      </Box>
      <Box>
        <Typography
          variant="h3"
          sx={{
            color: theme.vars.palette.common.black,
            fontWeight: 800,
            letterSpacing: -0.2,
            lineHeight: 1
          }}
        >
          Hospus
        </Typography>
        <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Hospital Operations
        </Typography>
      </Box>
    </Box>
  );
}

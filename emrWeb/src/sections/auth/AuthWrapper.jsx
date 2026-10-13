import PropTypes from 'prop-types';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

// project imports
import AuthFooter from 'components/cards/AuthFooter';
import Logo from 'components/logo';
import AuthCard from './AuthCard';

// assets
import AuthBackground from './AuthBackground';

// ==============================|| AUTHENTICATION - WRAPPER ||============================== //

export default function AuthWrapper({ children }) {
  return (
    <Box sx={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <AuthBackground />
      <Stack sx={{ minHeight: '100vh', position: 'relative', zIndex: 1 }}>
        <Box sx={{ width: '100%', maxWidth: 1280, mx: 'auto', px: { xs: 2.5, sm: 4, lg: 6 }, pt: { xs: 2.5, sm: 4 } }}>
          <Logo to="/" />
        </Box>

        <Grid
          container
          alignItems="center"
          sx={{
            width: '100%',
            maxWidth: 1280,
            flexGrow: 1,
            mx: 'auto',
            px: { xs: 2.5, sm: 4, lg: 6 },
            py: { xs: 4, md: 6 }
          }}
        >
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: { xs: 'none', md: 'block' }, pr: { md: 7, lg: 12 } }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                px: 1.5,
                py: 0.75,
                mb: 3,
                borderRadius: 999,
                bgcolor: 'rgba(198, 40, 40, 0.09)',
                border: '1px solid rgba(198, 40, 40, 0.16)'
              }}
            >
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: 'primary.main' }} />
              <Typography variant="caption" sx={{ color: 'primary.dark', fontWeight: 700, letterSpacing: '0.06em' }}>
                HOSPITAL OPERATIONS
              </Typography>
            </Box>

            <Typography
              component="h1"
              sx={{
                maxWidth: 560,
                color: 'grey.900',
                fontSize: { md: '3.25rem', lg: '4rem' },
                fontWeight: 800,
                lineHeight: 1.05,
                letterSpacing: '-0.045em'
              }}
            >
              Care coordination, without the chaos.
            </Typography>

            <Typography sx={{ maxWidth: 510, mt: 3, color: 'grey.600', fontSize: '1.05rem', lineHeight: 1.8 }}>
              Monitor emergency alerts, hospital capacity, bed admissions, and care teams from one secure workspace.
            </Typography>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', justifyContent: { xs: 'center', md: 'flex-end' } }}>
            <AuthCard>{children}</AuthCard>
          </Grid>
        </Grid>

        <AuthFooter />
      </Stack>
    </Box>
  );
}

AuthWrapper.propTypes = { children: PropTypes.node };

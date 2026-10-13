// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import AuthLogin from 'sections/auth/AuthLogin';

// ================================|| JWT - LOGIN ||================================ //

export default function Login() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 0.75, mb: { xs: -0.5, sm: 0.5 } }}>
            <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em' }}>
              Welcome back
            </Typography>
            <Typography color="text.secondary">Sign in to continue to your Hospus workspace.</Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <AuthLogin />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}

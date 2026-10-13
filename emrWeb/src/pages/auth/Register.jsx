import { Link } from 'react-router-dom';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

// project imports
import AuthWrapper from 'sections/auth/AuthWrapper';
import FirebaseRegister from 'sections/auth/AuthRegister';

// ================================|| JWT - REGISTER ||================================ //

export default function Register() {
  return (
    <AuthWrapper>
      <Grid container spacing={3}>
        <Grid size={12}>
          <Stack sx={{ gap: 0.75, mb: { xs: -0.5, sm: 0.5 } }}>
            <Stack direction="row" sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
              <Typography variant="h3">Patient Sign Up</Typography>
              <Typography component={Link} to="/login" variant="body1" sx={{ textDecoration: 'none' }} color="primary">
                Back to sign in
              </Typography>
            </Stack>
            <Typography color="text.secondary">
              This registration form is only for patients creating access to the Hospus patient experience.
            </Typography>
          </Stack>
        </Grid>
        <Grid size={12}>
          <FirebaseRegister />
        </Grid>
      </Grid>
    </AuthWrapper>
  );
}

import PropTypes from 'prop-types';
import React from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

import * as Yup from 'yup';
import { Formik } from 'formik';

import IconButton from 'components/@extended/IconButton';
import AnimateButton from 'components/@extended/AnimateButton';
import { APP_DEFAULT_PATH } from 'config';
import useAuth from 'hooks/useAuth';
import { clearLogoutReason, readLogoutReason } from 'contexts/AuthContext';
import { getDefaultPathForRole } from 'utils/roles';

import EyeOutlined from '@ant-design/icons/EyeOutlined';
import EyeInvisibleOutlined from '@ant-design/icons/EyeInvisibleOutlined';

export default function AuthLogin({ isDemo = false }) {
  const [checked, setChecked] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const logoutReason = React.useMemo(() => new URLSearchParams(location.search).get('reason') || readLogoutReason(), [location.search]);

  const redirectTo = location.state?.from?.pathname || APP_DEFAULT_PATH;

  const handleClickShowPassword = () => {
    setShowPassword((previous) => !previous);
  };

  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Formik
      initialValues={{
        email: '',
        password: '',
        submit: null
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string().email('Must be a valid email').max(255).required('Email is required'),
        password: Yup.string()
          .required('Password is required')
          .test('no-leading-trailing-whitespace', 'Password cannot start or end with spaces', (value) => value === value?.trim())
      })}
      onSubmit={async (values, { setErrors, setSubmitting }) => {
        try {
          clearLogoutReason();

          // No role selection. The backend determines the role.
          const session = await login({
            email: values.email,
            password: values.password
          });

          const destination = location.state?.from?.pathname || getDefaultPathForRole(session.role) || APP_DEFAULT_PATH;

          navigate('/auth/loading', {
            replace: true,
            state: { redirectTo: destination }
          });
        } catch (error) {
          setErrors({
            submit: error instanceof Error ? error.message : 'Unable to sign in. Please try again.'
          });
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {logoutReason === 'session-expired' && (
              <Grid size={12}>
                <Alert severity="warning">Your session expired for security reasons. Sign in again to continue.</Alert>
              </Grid>
            )}

            <Grid size={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="email-login">Email Address</InputLabel>

                <OutlinedInput
                  id="email-login"
                  type="email"
                  name="email"
                  value={values.email}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Enter email address"
                  fullWidth
                  autoComplete="username"
                  error={Boolean(touched.email && errors.email)}
                />
              </Stack>

              {touched.email && errors.email && <FormHelperText error>{errors.email}</FormHelperText>}
            </Grid>

            <Grid size={12}>
              <Stack spacing={1}>
                <InputLabel htmlFor="password-login">Password</InputLabel>

                <OutlinedInput
                  id="password-login"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={values.password}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  placeholder="Enter password"
                  fullWidth
                  autoComplete="current-password"
                  error={Boolean(touched.password && errors.password)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        color="secondary"
                      >
                        {showPassword ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </Stack>

              {touched.password && errors.password && <FormHelperText error>{errors.password}</FormHelperText>}
            </Grid>

            <Grid size={12} sx={{ mt: -1 }}>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={checked}
                      onChange={(event) => setChecked(event.target.checked)}
                      name="checked"
                      color="primary"
                      size="small"
                    />
                  }
                  label={<Typography variant="h6">Keep me signed in</Typography>}
                />

                <Link component={RouterLink} to="/forgot-password" color="text.primary" underline="hover" variant="h6">
                  Forgot Password?
                </Link>
              </Stack>
            </Grid>

            {errors.submit && (
              <Grid size={12}>
                <Alert severity="error">{errors.submit}</Alert>
              </Grid>
            )}

            <Grid size={12}>
              <AnimateButton>
                <Button disabled={isSubmitting} fullWidth size="large" type="submit" variant="contained" color="primary">
                  {isSubmitting ? 'Signing in...' : 'Login'}
                </Button>
              </AnimateButton>
            </Grid>
          </Grid>
        </form>
      )}
    </Formik>
  );
}

AuthLogin.propTypes = {
  isDemo: PropTypes.bool
};

import { Outlet } from 'react-router-dom';

// material-ui
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';

// project imports
import PatientHeader from './PatientHeader';
import PatientBottomNav from './PatientBottomNav';

// ==============================|| PATIENT MOBILE LAYOUT ||============================== //

export default function PatientLayout() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <PatientHeader />

      <Container
        maxWidth="sm"
        sx={{
          flex: 1,
          px: 2,
          pt: 2,
          pb: 10
        }}
      >
        <Stack spacing={2.5}>
          <Outlet />
        </Stack>
      </Container>

      <PatientBottomNav />
    </Box>
  );
}

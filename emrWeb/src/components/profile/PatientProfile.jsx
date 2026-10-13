// =========================================
// FILE: components/profile/sections/PatientProfileSection.jsx
// =========================================

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import MainCard from 'components/MainCard';

import useAuth from 'hooks/useAuth';
import { useAlertsByPatient } from 'hooks/useEmergencyAlerts';
import { usePatient } from 'hooks/usePatients';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export default function PatientProfileSection() {
  const { userId } = useAuth();
  const { data: patient } = usePatient(userId);
  const { data: alertsData } = useAlertsByPatient(userId);
  const alerts = extractList(alertsData);
  const activeAlerts = alerts.filter((alert) => !['CANCELLED', 'COMPLETED', 'DISCHARGED'].includes(alert.status)).length;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Patient Record">
          <Stack spacing={1}>
            <Typography variant="h4">{patient?.fullName || patient?.name || patient?.user?.fullName || 'Patient profile'}</Typography>

            <Typography color="text.secondary">
              {patient?.patientNumber || patient?.medicalRecordNumber || patient?.email || 'Medical account'}
            </Typography>

            <Chip label={patient?.status || 'ACTIVE'} color={patient?.status === 'INACTIVE' ? 'default' : 'success'} />
          </Stack>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Emergency Alerts">
          <Typography variant="h2">{alerts.length}</Typography>
          <Typography color="text.secondary">Total alerts submitted</Typography>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Active Alerts">
          <Typography variant="h3">{activeAlerts}</Typography>
        </MainCard>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <MainCard title="Blood Group">
          <Typography variant="h3">{patient?.bloodGroup || patient?.bloodType || 'Not recorded'}</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}

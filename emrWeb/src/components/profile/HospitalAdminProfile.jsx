// =========================================
// FILE: components/profile/sections/HospitalAdminProfileSection.jsx
// =========================================

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

import useAuth from 'hooks/useAuth';
import { useAlertsByHospital } from 'hooks/useEmergencyAlerts';
import { useHospitalAdmin } from 'hooks/useHospitalAdmins';
import { useHospitalBedOccupancy } from 'hooks/useHospitals';

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function AnalyticsCard({ title, value }) {
  return (
    <MainCard>
      <Typography variant="caption" color="text.secondary">
        {title}
      </Typography>

      <Typography variant="h3">{value}</Typography>
    </MainCard>
  );
}

export default function HospitalAdminProfileSection() {
  const { userId } = useAuth();
  const { data: admin } = useHospitalAdmin(userId);
  const hospital = admin?.hospital || admin?.hospitals?.[0];
  const hospitalId = hospital?.id || admin?.hospitalId;
  const { beds = [] } = useHospitalBedOccupancy(hospitalId);
  const { data: alertsData } = useAlertsByHospital(hospitalId);
  const alerts = extractList(alertsData);
  const availableBeds = beds.filter((bed) => bed.status === 'AVAILABLE').length;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Hospital" value={hospital?.name || hospital?.hospitalName || 'Not linked'} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Available Beds" value={availableBeds} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Emergency Alerts" value={alerts.length} />
      </Grid>

      <Grid size={12}>
        <MainCard title="Hospital Administration">
          <Typography color="text.secondary">Manage hospital operations, beds, admissions, and emergency alerts.</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}

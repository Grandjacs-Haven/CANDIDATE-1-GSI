// =========================================
// FILE: components/profile/sections/AdminProfileSection.jsx
// =========================================

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';

import { useAlerts } from 'hooks/useEmergencyAlerts';
import { useHospitals } from 'hooks/useHospitals';
import { useUsers } from 'hooks/useUsers';

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

export default function AdminProfileSection() {
  const { data: usersData } = useUsers({ size: 500 });
  const { hospitals = [] } = useHospitals({ size: 500 });
  const { data: alertsData } = useAlerts({ size: 500 });

  const users = extractList(usersData);
  const alerts = extractList(alertsData);
  const activeAlerts = alerts.filter((alert) => !['CANCELLED', 'COMPLETED', 'DISCHARGED'].includes(alert.status)).length;

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Total Users" value={users.length} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Hospitals" value={hospitals.length} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Emergency Alerts" value={alerts.length} />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <AnalyticsCard title="Active Alerts" value={activeAlerts} />
      </Grid>

      <Grid size={12}>
        <MainCard title="Administrator Access">
          <Typography color="text.secondary">Access hospital analytics, emergency alert monitoring, and user administration.</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}

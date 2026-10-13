// =========================================
// FILE: pages/profile/ProfilePage.jsx
// =========================================

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import useAuth from 'hooks/useAuth';

import ProfileHeader from 'components/profile/ProfileHeader';
import PersonalInformationCard from 'components/profile/PersonalCard';
import SecurityCard from 'components/profile/SecurityCard';

import PatientProfileSection from 'components/profile/PatientProfile';
import HospitalAdminProfileSection from 'components/profile/HospitalAdminProfile';
import AdminProfileSection from 'components/profile/AdminProfile';

import { USER_ROLES } from 'utils/roles';

export default function ProfilePage() {
  const { role } = useAuth();

  return (
    <Grid container spacing={3}>
      <Grid size={12}>
        <ProfileHeader />
      </Grid>

      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={3}>
          <PersonalInformationCard />

          <SecurityCard />
        </Stack>
      </Grid>

      <Grid size={{ xs: 12, md: 8 }}>
        {role === USER_ROLES.PATIENT && <PatientProfileSection />}

        {role === USER_ROLES.HOSPITAL_ADMIN && <HospitalAdminProfileSection />}

        {[USER_ROLES.ADMIN, USER_ROLES.DOCTOR, USER_ROLES.NURSE].includes(role) && <AdminProfileSection />}
      </Grid>
    </Grid>
  );
}

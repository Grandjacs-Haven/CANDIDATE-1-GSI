import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

import HomeOutlined from '@ant-design/icons/HomeOutlined';

export default function PatientHomePage() {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <PageHeader title="Patient Home" description="Review your account, activity, and next steps." icon={HomeOutlined} />
      </Grid>
      <Grid size={12}>
        <MainCard title="Welcome">
          <Typography color="text.secondary">Your patient workspace is available and ready to load account-specific data.</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}

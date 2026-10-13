import PropTypes from 'prop-types';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import MainCard from 'components/MainCard';
import PageHeader from 'components/PageHeader';

import ToolOutlined from '@ant-design/icons/ToolOutlined';

export default function FeaturePlaceholder({ title, description, body }) {
  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid size={12}>
        <PageHeader title={title} description={description} icon={ToolOutlined} />
      </Grid>
      <Grid size={12}>
        <MainCard title="Workspace Status">
          <Typography color="text.secondary">{body}</Typography>
        </MainCard>
      </Grid>
    </Grid>
  );
}

FeaturePlaceholder.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  body: PropTypes.string.isRequired
};

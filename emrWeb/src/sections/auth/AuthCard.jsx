import PropTypes from 'prop-types';

// material-ui
import { useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';

// project imports
import MainCard from 'components/MainCard';

// ==============================|| AUTHENTICATION - CARD WRAPPER ||============================== //

export default function AuthCard({ children, ...other }) {
  const theme = useTheme();

  return (
    <MainCard
      sx={{
        width: '100%',
        maxWidth: 480,
        borderRadius: 3,
        bgcolor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 28px 80px rgba(74, 22, 22, 0.16)',
        '& > *': { flexGrow: 1, flexBasis: '50%' }
      }}
      content={false}
      {...other}
      border={false}
      boxShadow
      shadow={theme.vars.customShadows.z1}
    >
      <Box sx={{ p: { xs: 3, sm: 4.5, md: 5 } }}>{children}</Box>
    </MainCard>
  );
}

AuthCard.propTypes = { children: PropTypes.any, other: PropTypes.any };

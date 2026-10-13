import { useLocation, useNavigate } from 'react-router-dom';

// material-ui
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';

// icons
import HomeOutlined from '@ant-design/icons/HomeOutlined';
import WalletOutlined from '@ant-design/icons/WalletOutlined';
import ApartmentOutlined from '@ant-design/icons/ApartmentOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';

// ==============================|| PATIENT BOTTOM NAV ||============================== //

const navItems = [
  {
    label: 'Home',
    value: '/patient/home',
    icon: <HomeOutlined />
  },
  {
    label: 'Billing',
    value: '/patient/billing',
    icon: <WalletOutlined />
  },
  {
    label: 'Ward',
    value: '/patient/ward',
    icon: <ApartmentOutlined />
  },
  {
    label: 'Profile',
    value: '/patient/profile',
    icon: <UserOutlined />
  }
];

export default function PatientBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const currentValue = navItems.find((item) => location.pathname.startsWith(item.value))?.value || '/patient/home';

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 20,
        borderTop: '1px solid',
        borderColor: 'divider'
      }}
    >
      <BottomNavigation
        showLabels
        value={currentValue}
        onChange={(_, value) => navigate(value)}
        sx={{
          height: 68
        }}
      >
        {navItems.map((item) => (
          <BottomNavigationAction key={item.value} label={item.label} value={item.value} icon={item.icon} />
        ))}
      </BottomNavigation>
    </Paper>
  );
}

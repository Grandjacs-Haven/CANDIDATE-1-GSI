import { BellOutlined, DashboardOutlined } from '@ant-design/icons';

const dashboard = {
  id: 'group-dashboard',
  title: 'Dashboard',
  type: 'group',
  icon: DashboardOutlined,
  roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'],
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: DashboardOutlined,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'],
      breadcrumbs: false
    },
    {
      id: 'alert-dashboard',
      title: 'Alert Dashboard',
      type: 'item',
      url: '/dashboard/alerts',
      icon: BellOutlined,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']
    }
  ]
};

export default dashboard;

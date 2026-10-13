import AlertOutlined from '@ant-design/icons/AlertOutlined';

const alerts = {
  id: 'group-alerts',
  title: 'Emergency Alerts',
  type: 'group',
  icon: AlertOutlined,
  roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'],
  children: [
    {
      id: 'emergency-alerts',
      title: 'Emergency Alerts',
      type: 'item',
      url: '/alerts',
      icon: AlertOutlined,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']
    }
  ]
};

export default alerts;

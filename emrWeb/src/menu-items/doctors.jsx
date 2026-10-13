import UserOutlined from '@ant-design/icons/UserOutlined';

const doctors = {
  id: 'group-doctors',
  title: 'Doctors',
  type: 'group',
  icon: UserOutlined,
  roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'],
  children: [
    {
      id: 'doctors',
      title: 'Doctors',
      type: 'item',
      url: '/doctors',
      icon: UserOutlined,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']
    }
  ]
};

export default doctors;

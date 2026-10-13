import UserOutlined from '@ant-design/icons/UserOutlined';

const profile = {
  id: 'group-profile',
  title: 'Profile',
  type: 'group',
  icon: UserOutlined,
  roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'],
  children: [
    {
      id: 'profile',
      title: 'Profile',
      type: 'item',
      url: '/profile',
      icon: UserOutlined,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']
    }
  ]
};

export default profile;

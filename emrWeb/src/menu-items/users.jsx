import TeamOutlined from '@ant-design/icons/TeamOutlined';

const users = {
  id: 'group-users',
  title: 'Users',
  type: 'group',
  icon: TeamOutlined,
  roles: ['ADMIN', 'HOSPITAL_ADMIN'],
  children: [
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/users',
      icon: TeamOutlined,
      roles: ['ADMIN', 'HOSPITAL_ADMIN']
    }
  ]
};

export default users;

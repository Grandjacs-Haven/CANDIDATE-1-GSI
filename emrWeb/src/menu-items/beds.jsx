import DatabaseOutlined from '@ant-design/icons/DatabaseOutlined';

const beds = {
  id: 'group-beds',
  title: 'Beds',
  type: 'group',
  icon: DatabaseOutlined,
  roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'],
  children: [
    {
      id: 'beds',
      title: 'Beds',
      type: 'item',
      url: '/beds',
      icon: DatabaseOutlined,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']
    }
  ]
};

export default beds;

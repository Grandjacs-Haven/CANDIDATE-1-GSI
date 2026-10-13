import TeamOutlined from '@ant-design/icons/TeamOutlined';

const patients = {
  id: 'group-patients',
  title: 'Patients',
  type: 'group',
  icon: TeamOutlined,
  roles: ['ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE'],
  children: [
    {
      id: 'patients',
      title: 'Patients',
      type: 'item',
      url: '/patients',
      icon: TeamOutlined,
      roles: ['ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE']
    }
  ]
};

export default patients;

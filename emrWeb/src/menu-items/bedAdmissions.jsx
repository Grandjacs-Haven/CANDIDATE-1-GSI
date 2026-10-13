import DeploymentUnitOutlined from '@ant-design/icons/DeploymentUnitOutlined';

const bedAdmissions = {
  id: 'group-bed-admissions',
  title: 'Bed Admissions',
  type: 'group',
  icon: DeploymentUnitOutlined,
  roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'],
  children: [
    {
      id: 'bed-admissions',
      title: 'Bed Admissions',
      type: 'item',
      url: '/bed-admissions',
      icon: DeploymentUnitOutlined,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']
    }
  ]
};

export default bedAdmissions;

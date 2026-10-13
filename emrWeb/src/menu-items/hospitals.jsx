import MedicineBoxOutlined from '@ant-design/icons/MedicineBoxOutlined';

const hospitals = {
  id: 'group-hospitals',
  title: 'Hospitals',
  type: 'group',
  icon: MedicineBoxOutlined,
  roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'],
  children: [
    {
      id: 'hospitals',
      title: 'Hospitals',
      type: 'item',
      url: '/hospitals',
      icon: MedicineBoxOutlined,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']
    }
  ]
};

export default hospitals;

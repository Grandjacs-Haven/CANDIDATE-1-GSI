import SafetyCertificateOutlined from '@ant-design/icons/SafetyCertificateOutlined';

const hospitalAdmins = {
  id: 'group-hospital-admins',
  title: 'Hospital Admins',
  type: 'group',
  icon: SafetyCertificateOutlined,
  roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN'],
  children: [
    {
      id: 'hospital-admins',
      title: 'Hospital Admins',
      type: 'item',
      url: '/hospital-admins',
      icon: SafetyCertificateOutlined,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'HOSPITAL_ADMIN']
    }
  ]
};

export default hospitalAdmins;

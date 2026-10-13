import {
  ApartmentOutlined,
  BankOutlined,
  CalendarOutlined,
  CreditCardOutlined,
  ExperimentOutlined,
  HomeOutlined,
  MedicineBoxOutlined,
  TeamOutlined,
  UserSwitchOutlined
} from '@ant-design/icons';

const operations = [
  {
    id: 'group-lobby',
    title: 'Lobby',
    type: 'group',
    icon: HomeOutlined,
    children: [
      {
        id: 'lobby',
        title: 'Lobby',
        type: 'item',
        url: '/lobby',
        icon: HomeOutlined,
        breadcrumbs: false
      }
    ]
  },
  {
    id: 'group-facility-management',
    title: 'Facility Management',
    type: 'group',
    icon: BankOutlined,
    children: [
      {
        id: 'bed-management',
        title: 'Bed Management',
        type: 'item',
        url: '/beds',
        icon: MedicineBoxOutlined,
        scopes: ['rbed']
      },
      {
        id: 'room-management',
        title: 'Room Management',
        type: 'item',
        url: '/rooms',
        icon: ApartmentOutlined,
        scopes: ['rroom']
      },
      {
        id: 'ward-management',
        title: 'Ward Management',
        type: 'item',
        url: '/wards',
        icon: BankOutlined,
        scopes: ['rward']
      }
    ]
  },
  {
    id: 'group-user-management',
    title: 'User Management',
    type: 'group',
    icon: TeamOutlined,
    children: [
      {
        id: 'user-management',
        title: 'User Management',
        type: 'item',
        url: '/users',
        icon: TeamOutlined,
        scopes: ['ruser']
      }
    ]
  },
  {
    id: 'group-practitioner-management',
    title: 'Practitioner Management',
    type: 'group',
    icon: TeamOutlined,
    scopes: ['rpract'],
    children: [
      {
        id: 'practitioner-management',
        title: 'Practitioner Management',
        type: 'item',
        url: '/practitioners',
        icon: TeamOutlined,
        scopes: ['rpract']
      }
    ]
  },
  {
    id: 'group-encounter',
    title: 'Encounter',
    type: 'group',
    icon: UserSwitchOutlined,
    scopes: ['renc'],
    children: [
      {
        id: 'encounter',
        title: 'Encounter',
        type: 'item',
        url: '/encounters',
        icon: UserSwitchOutlined,
        scopes: ['renc']
      }
    ]
  },
  {
    id: 'group-billing',
    title: 'Billing',
    type: 'group',
    icon: CreditCardOutlined,
    children: [
      {
        id: 'billing',
        title: 'Billing',
        type: 'item',
        url: '/billing',
        icon: CreditCardOutlined,
        scopes: ['rbill']
      },
      {
        id: 'laboratory',
        title: 'Laboratory',
        type: 'item',
        url: '/laboratory',
        icon: ExperimentOutlined,
        scopes: ['rbill']
      }
    ]
  },
  {
    id: 'group-appointments',
    title: 'Appointments',
    type: 'group',
    icon: CalendarOutlined,
    scopes: ['rapp'],
    children: [
      {
        id: 'appointments',
        title: 'Appointments',
        type: 'item',
        url: '/appointments',
        icon: CalendarOutlined,
        scopes: ['rapp']
      }
    ]
  },
  {
    id: 'group-patient-management',
    title: 'Patient Management',
    type: 'group',
    icon: TeamOutlined,
    scopes: ['rpat'],
    children: [
      {
        id: 'patient-management',
        title: 'Patient Management',
        type: 'item',
        url: '/patients',
        icon: TeamOutlined,
        scopes: ['rpat']
      }
    ]
  }
];

export default operations;

// assets
import { ChromeOutlined, QuestionOutlined } from '@ant-design/icons';

// icons
const icons = {
  ChromeOutlined,
  QuestionOutlined
};

// ==============================|| MENU ITEMS - SAMPLE PAGE & DOCUMENTATION ||============================== //

const support = {
  id: 'support',
  title: 'Support',
  type: 'group',
  icon: icons.QuestionOutlined,
  roles: ['ADMIN'],
  children: [
    {
      id: 'sample-page',
      title: 'Sample Page',
      type: 'item',
      url: '/sample-page',
      icon: icons.ChromeOutlined,
      roles: ['ADMIN']
    },
    {
      id: 'documentation',
      title: 'Documentation',
      type: 'item',
      url: '#',
      icon: icons.QuestionOutlined,
      external: true,
      target: true,
      roles: ['ADMIN']
    }
  ]
};

export default support;

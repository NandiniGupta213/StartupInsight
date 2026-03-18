// assets
import { LoginOutlined, ProfileOutlined, LogoutOutlined } from '@ant-design/icons';
import {
  DashboardOutlined,
} from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  LogoutOutlined,
  ProfileOutlined,
  LoginOutlined
};

// ==============================|| MENU ITEMS - DEEP ANALYSIS PAGES ||============================== //

const analysisPages = {
  id: 'deep-analysis',
  title: 'Analysis',
  type: 'group',
  children: [
    {
      id: 'market-trend',
      title: 'Market Trend',
      type: 'item',
      url: '/dashboard/market-trend',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'comparison',
      title: 'Comparison',
      type: 'item',
      url: '/dashboard/comparison',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    }
  ]
};

// Separate group for account actions at the bottom
const accountPages = {
  id: 'account',
  title: 'Account',
  type: 'group',
  children: [
    {
      id: 'profile',
      title: 'Profile',
      type: 'item',
      url: '/dashboard/profile',
      icon: icons.ProfileOutlined,
      breadcrumbs: false
    },
    {
      id: 'logout',
      title: 'Logout',
      type: 'item',
      url: '/login',
      icon: icons.LogoutOutlined,
      breadcrumbs: false
    }
  ]
};

// Export both groups
export default [analysisPages, accountPages];
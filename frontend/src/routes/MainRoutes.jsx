import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import MainLayout from '../layout/MainLayout';

// render - Home Page (Landing)
const HomePage = Loadable(lazy(() => import('../pages/homepage/index')));

// render - Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const MarketTrend = Loadable(lazy(() => import('../pages/DeepAnalysis/index')));
const Comparison = Loadable(lazy(() => import('../pages/comparison/index')));
const Profile = Loadable(lazy(() => import('../pages/auth/profile')));

// render - Auth Pages
const Login = Loadable(lazy(() => import('../pages/auth/Login')));
const Register = Loadable(lazy(() => import('../pages/auth/Register')));
const ForgotPassword = Loadable(lazy(() => import('../pages/auth/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('../pages/auth/ResetPassword')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      index: true,
      element: <Navigate to="/login" replace />  // Redirect to login
    },
    // Home Page
    {
      path: 'home',
      element: <HomePage />
    },
    // Auth Routes
    {
      path: 'login',
      element: <Login />
    },
    {
      path: 'register',
      element: <Register />
    },
    {
      path: 'forgot-password',
      element: <ForgotPassword />
    },
    {
      path: 'reset-password/:token',
      element: <ResetPassword />
    },
    // Dashboard Routes
    {
      path: 'dashboard',
      element: <DashboardLayout />,
      children: [
        {
          index: true,
          element: <DashboardDefault />
        },
        {
          path: 'market-trend', 
          element: <MarketTrend />  
        },
        {
          path: 'comparison', 
          element: <Comparison />  
        },
        {
          path: 'profile', 
          element: <Profile />  
        }
      ]
    },
  ]
};
export default MainRoutes;
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project imports
import Loadable from 'components/Loadable';
import PatientLayout from 'layout/Patient';

const PatientHomePage = Loadable(lazy(() => import('pages/patient/home')));
const PatientBillingPage = Loadable(lazy(() => import('pages/patient/billing')));
const PatientWardPage = Loadable(lazy(() => import('pages/patient/ward')));
const PatientProfilePage = Loadable(lazy(() => import('pages/patient/profile')));
const PatientResetPasswordPage = Loadable(lazy(() => import('pages/patient/resetPassword')));

const PatientRoutes = {
  path: 'patient',
  element: <PatientLayout />,
  children: [
    {
      index: true,
      element: <Navigate to="home" replace />
    },
    {
      path: 'home',
      element: <PatientHomePage />
    },
    {
      path: 'score',
      element: <Navigate to="/patient/home" replace />
    },
    {
      path: 'billing',
      element: <PatientBillingPage />
    },
    {
      path: 'ward',
      element: <PatientWardPage />
    },
    {
      path: 'profile',
      element: <PatientProfilePage />
    },
    {
      path: 'reset-password',
      element: <PatientResetPasswordPage />
    }
  ]
};

export default PatientRoutes;

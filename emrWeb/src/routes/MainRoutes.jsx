import { lazy } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import PropTypes from 'prop-types';

// project imports
import Loadable from 'components/Loadable';
import FeaturePlaceholder from 'components/FeaturePlaceholder';
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from './AuthGuard';
import ScopeGuard from './ScopeGuard';
import RoleRedirect from './RoleRedirect';
import PatientRoutes from './PatientRoutes';
import useAuth from 'hooks/useAuth';
import { getPathForRole } from 'utils/roles';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));
const AlertDashboardPage = Loadable(lazy(() => import('pages/dashboard/alerts')));
const AuthLoadingPage = Loadable(lazy(() => import('pages/auth/AuthLoading')));
const UsersPage = Loadable(lazy(() => import('pages/users')));
const EmergencyAlertsPage = Loadable(lazy(() => import('pages/alerts/AlertsPage')));
const HospitalsPage = Loadable(lazy(() => import('pages/hospitals')));
const BedsPage = Loadable(lazy(() => import('components/Hospital-Management/Bed/Bed')));
const RoomsPage = Loadable(lazy(() => import('components/Hospital-Management/Room/Room')));
const WardsPage = Loadable(lazy(() => import('components/Hospital-Management/Ward/Ward')));
const BedAdmissionsPage = Loadable(lazy(() => import('pages/bed-admissions')));
const DoctorsPage = Loadable(lazy(() => import('pages/doctors')));
const HospitalAdminsPage = Loadable(lazy(() => import('pages/hospital-admins')));
const PatientsPage = Loadable(lazy(() => import('pages/patients')));
const PractitionersPage = Loadable(lazy(() => import('components/Practitioner/Practitioner')));
const EncountersPage = Loadable(lazy(() => import('components/Encounter/Encounter')));
const AppointmentsPage = Loadable(lazy(() => import('components/Appointment/Appointment')));
// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

const ProfilePage = Loadable(lazy(() => import('pages/profile/profile')));

function PlaceholderPage({ title, description }) {
  return (
    <FeaturePlaceholder
      title={title}
      description={description}
      body={`${title} workspace is ready for the next implementation step.`}
    />
  );
}

PlaceholderPage.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired
};

function scopedRoute(path, element, requiredScopes) {
  return {
    element: <ScopeGuard requiredScopes={requiredScopes} />,
    children: [{ path, element }]
  };
}

function getOperationsRoutes() {
  return [
    {
      path: 'lobby',
      element: <PlaceholderPage title="Lobby" description="Front desk and operational intake workspace." />
    },
    {
      path: 'alerts',
      element: <EmergencyAlertsPage />
    },
    {
      path: 'hospitals',
      element: <HospitalsPage />
    },
    scopedRoute('beds', <BedsPage />, ['rbed']),
    scopedRoute('rooms', <RoomsPage />, ['rroom']),
    scopedRoute('wards', <WardsPage />, ['rward']),
    {
      path: 'bed-admissions',
      element: <BedAdmissionsPage />
    },
    scopedRoute('encounters', <EncountersPage />, ['renc']),
    scopedRoute('billing', <PlaceholderPage title="Billing" description="Review invoices, charges, and payment activity." />, ['rbill']),
    scopedRoute('laboratory', <PlaceholderPage title="Laboratory" description="Manage lab requests, results, and laboratory workflow." />, ['rbill']),
    scopedRoute('appointments', <AppointmentsPage />, ['rapp']),
    {
      path: 'doctors',
      element: <DoctorsPage />
    },
    {
      path: 'hospital-admins',
      element: <HospitalAdminsPage />
    },
    scopedRoute('patients', <PatientsPage />, ['rpat']),
    scopedRoute('practitioners', <PractitionersPage />, ['rpract'])
  ];
}

function getDashboardRoutes({ includeUsers = false, includeUtilities = false } = {}) {
  return [
    {
      path: 'dashboard',
      children: [
        { path: 'default', element: <DashboardDefault /> },
        { path: 'alerts', element: <AlertDashboardPage /> }
      ]
    },
    {
      path: 'profile',
      element: <ProfilePage />
    },
    ...(includeUsers
      ? [
          scopedRoute('users', <UsersPage />, ['ruser'])
        ]
      : []),
    ...getOperationsRoutes(),
    ...(includeUtilities
      ? [
          { path: 'typography', element: <Typography /> },
          { path: 'color', element: <Color /> },
          { path: 'shadow', element: <Shadow /> },
          { path: 'sample-page', element: <SamplePage /> }
        ]
      : [])
  ];
}

function getRoleDashboardRoute(path, options) {
  return {
    path,
    element: <DashboardLayout />,
    children: getDashboardRoutes(options)
  };
}

function RolePathRedirect({ to }) {
  const { role } = useAuth();

  if (role) {
    return <Navigate to={getPathForRole(role, to)} replace />;
  }

  return <Outlet />;
}

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <AuthGuard />,
  children: [
    {
      index: true,
      element: <RoleRedirect />
    },
    {
      path: 'auth/loading',
      element: <AuthLoadingPage />
    },
    PatientRoutes,
    getRoleDashboardRoute('admin', { includeUsers: true, includeUtilities: true }),
    getRoleDashboardRoute('doctor'),
    getRoleDashboardRoute('nurse'),
    getRoleDashboardRoute('hospital-admin', { includeUsers: true }),
    {
      path: 'profile',
      element: <RolePathRedirect to="/profile" />,
      children: [
        {
          path: '',
          element: <DashboardLayout />,
          children: [
            {
              index: true,
              element: <ProfilePage />
            }
          ]
        }
      ]
    }
  ]
};

export default MainRoutes;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import RequireAuth from './RequireAuth';
import RedirectIfAuthenticated from './RedirectIfAuthenticated';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// authentication

const Login1 = Loadable(lazy(() => import('../views/authentication/auth1/Login')));

const Login2 = Loadable(lazy(() => import('../views/authentication/auth2/Login')));

const Register2 = Loadable(lazy(() => import('../views/authentication/auth2/Register')));

const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));

//pages
const UserProfile = Loadable(lazy(() => import('../views/pages/user-profile/UserProfile')));
const Settings = Loadable(lazy(() => import('../views/pages/settings/Settings')));

const Error = Loadable(lazy(() => import('../views/authentication/Error')));

const Router = [
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <FullLayout />,
        children: [
          { path: '/', exact: true, element: <Navigate to="/user-profile" /> },
          { path: '*', element: <Navigate to="/auth/404" /> },

          { path: '/user-profile', element: <UserProfile /> },
          { path: '/settings', element: <Settings /> },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <BlankLayout />,
    children: [
      {
        path: '/login',
        element: (
          <RedirectIfAuthenticated>
            <Login1 />
          </RedirectIfAuthenticated>
        ),
      },

      {
        path: '/auth/auth2/login',
        element: (
          <RedirectIfAuthenticated>
            <Login2 />
          </RedirectIfAuthenticated>
        ),
      },

      {
        path: '/auth/auth2/register',
        element: (
          <RedirectIfAuthenticated>
            <Register2 />
          </RedirectIfAuthenticated>
        ),
      },

      { path: '/auth/maintenance', element: <Maintainance /> },
      { path: '404', element: <Error /> },
      { path: '/auth/404', element: <Error /> },
      { path: '*', element: <Navigate to="/auth/404" /> },
    ],
  },
];

const router = createBrowserRouter(Router);

export default router;

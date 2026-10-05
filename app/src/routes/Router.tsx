// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { lazy } from 'react';
import { Navigate, Outlet, createBrowserRouter } from 'react-router';
import Loadable from '../layouts/full/shared/loadable/Loadable';
import RequireAuth from './RequireAuth';
import RedirectIfAuthenticated from './RedirectIfAuthenticated';
import { TicketsProvider } from '../context/tickets-context';

/* ***Layouts**** */
const FullLayout = Loadable(lazy(() => import('../layouts/full/FullLayout')));
const BlankLayout = Loadable(lazy(() => import('../layouts/blank/BlankLayout')));

// authentication

const Login1 = Loadable(lazy(() => import('../views/authentication/auth1/Login')));

const Maintainance = Loadable(lazy(() => import('../views/authentication/Maintainance')));
const ForgotPassword = Loadable(lazy(() => import('../views/authentication/ForgotPassword')));
const ResetPassword = Loadable(lazy(() => import('../views/authentication/ResetPassword')));

//pages
const Home = Loadable(lazy(() => import('../views/pages/home/Home')));
const UserProfile = Loadable(lazy(() => import('../views/pages/user-profile/UserProfile')));
const Settings = Loadable(lazy(() => import('../views/pages/settings/Settings')));

// issues
const IssuesList = Loadable(lazy(() => import('../views/pages/issues/IssuesList')));
const CreateIssue = Loadable(lazy(() => import('../views/pages/issues/CreateIssue')));
const IssueDetail = Loadable(lazy(() => import('../views/pages/issues/IssueDetail')));

// public building incidents
const IncidentsList = Loadable(lazy(() => import('../views/pages/incidents/IncidentsList')));
const ReportIncident = Loadable(lazy(() => import('../views/pages/incidents/ReportIncident')));
const IncidentDetail = Loadable(lazy(() => import('../views/pages/incidents/IncidentDetail')));

// Owner/resident read-only views (server/resident.js)
const BuildingsList = Loadable(lazy(() => import('../views/pages/buildings/BuildingsList')));
const BuildingDetail = Loadable(lazy(() => import('../views/pages/buildings/BuildingDetail')));
const Messages = Loadable(lazy(() => import('../views/pages/messages/Messages')));
const PostMessage = Loadable(lazy(() => import('../views/pages/messages/PostMessage')));
const BillsList = Loadable(lazy(() => import('../views/pages/bills/BillsList')));
const BillDetail = Loadable(lazy(() => import('../views/pages/bills/BillDetail')));
const Contacts = Loadable(lazy(() => import('../views/pages/contacts/Contacts')));

const Error = Loadable(lazy(() => import('../views/authentication/Error')));

const Router = [
  {
    path: '/',
    element: <RequireAuth />,
    children: [
      {
        element: <FullLayout />,
        children: [
          { path: '/', exact: true, element: <Home /> },
          { path: '*', element: <Navigate to="/auth/404" /> },

          { path: '/user-profile', element: <UserProfile /> },
          { path: '/settings', element: <Settings /> },
          { path: '/buildings', element: <BuildingsList /> },
          { path: '/messages', element: <Messages /> },
          { path: '/messages/new', element: <PostMessage /> },
          { path: '/bills', element: <BillsList /> },
          { path: '/bills/:id', element: <BillDetail /> },
          { path: '/contacts', element: <Contacts /> },

          {
            element: (
              <TicketsProvider>
                <Outlet />
              </TicketsProvider>
            ),
            children: [
              { path: '/issues', element: <IssuesList /> },
              { path: '/issues/new', element: <CreateIssue /> },
              { path: '/issues/:id', element: <IssueDetail /> },
              // Incidents need ticket-options (incident kinds) and the
              // reporter's confirm/reopen from useTickets().
              { path: '/incidents', element: <IncidentsList /> },
              { path: '/incidents/new', element: <ReportIncident /> },
              { path: '/incidents/:id', element: <IncidentDetail /> },
              { path: '/buildings/:id', element: <BuildingDetail /> },
            ],
          },
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
        path: '/auth/forgot-password',
        element: (
          <RedirectIfAuthenticated>
            <ForgotPassword />
          </RedirectIfAuthenticated>
        ),
      },

      {
        path: '/auth/reset-password',
        element: (
          <RedirectIfAuthenticated>
            <ResetPassword />
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

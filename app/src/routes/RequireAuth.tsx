import { Navigate, Outlet } from 'react-router';
import { useAuth } from 'src/context/auth-context';
import Spinner from 'src/views/spinner/Spinner';

const RequireAuth = () => {
  const { status } = useAuth();

  if (status === 'loading') return <Spinner />;
  if (status === 'unauthenticated') return <Navigate to="/login" replace />;

  return <Outlet />;
};

export default RequireAuth;

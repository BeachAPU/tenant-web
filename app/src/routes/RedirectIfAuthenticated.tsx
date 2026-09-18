import type { ReactNode } from 'react';
import { Navigate } from 'react-router';
import { useAuth } from 'src/context/auth-context';
import Spinner from 'src/views/spinner/Spinner';

const RedirectIfAuthenticated = ({ children }: { children: ReactNode }) => {
  const { status } = useAuth();

  if (status === 'loading') return <Spinner />;
  if (status === 'authenticated') return <Navigate to="/" replace />;

  return <>{children}</>;
};

export default RedirectIfAuthenticated;

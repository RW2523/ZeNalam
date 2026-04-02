import { Navigate, useLocation } from 'react-router-dom';

/**
 * Wraps routes that expect a logged-in user (localStorage `id`).
 * Server should still enforce authorization on sensitive APIs.
 */
export default function RequireAuth({ children }) {
  const location = useLocation();
  const id = typeof window !== 'undefined' ? localStorage.getItem('id') : null;
  if (id == null || id === '') {
    return <Navigate to="/" replace state={{ from: location.pathname }} />;
  }
  return children;
}

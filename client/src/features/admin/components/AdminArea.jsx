import useAuth from '@/features/auth/hooks/useAuth';

// if user is admin, render, else dont
export default function AdminArea({ children }) {
  const { isCurrentUserAdmin } = useAuth();
  if (!isCurrentUserAdmin) return null;

  return <>{children}</>;
}

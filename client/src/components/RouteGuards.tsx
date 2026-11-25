import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { homePath } from "../lib/utils";
import type { Role } from "../lib/types";
import { Skeleton } from "./ui";

export function FullPageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg" role="status" aria-label="Loading">
      <div className="w-64 space-y-3">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}

// Signed-in users only
export function ProtectedRoute({ roles }: { roles?: Role[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (roles && !roles.includes(user.role)) return <Navigate to={homePath(user.role)} replace />;
  return <Outlet />;
}

// Sign-up / login pages bounce signed-in users to their dashboard
export function PublicOnlyRoute() {
  const { user, loading } = useAuth();
  if (loading) return <FullPageLoader />;
  if (user) return <Navigate to={homePath(user.role)} replace />;
  return <Outlet />;
}

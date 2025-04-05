
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { ServiceType } from "@/types/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredService: ServiceType;
}

export const ProtectedRoute = ({ children, requiredService }: ProtectedRouteProps) => {
  const { user, isAuthenticated, currentService } = useAuth();

  // If user is not authenticated, redirect to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Check if the user has access to the requested service
  if (requiredService === "crunchyroll") {
    // Crunchyroll admin can access everything
    return <>{children}</>;
  } else if (requiredService === currentService) {
    // User can access their assigned service
    return <>{children}</>;
  }

  // Redirect to login if service doesn't match
  return <Navigate to="/login" replace />;
};


import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredService?: "crunchyroll" | "netflix" | "prime" | null;
}

export const ProtectedRoute = ({ 
  children, 
  requiredService = null 
}: ProtectedRouteProps) => {
  const { isAuthenticated, currentService } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific service is required, check if the user is authenticated for that service
  if (requiredService && currentService !== requiredService) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

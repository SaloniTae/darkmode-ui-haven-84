
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

  console.log("ProtectedRoute check - isAuthenticated:", isAuthenticated, "currentService:", currentService, "requiredService:", requiredService);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If a specific service is required, check if the user is authenticated for that service
  if (requiredService && currentService !== requiredService) {
    console.log("Wrong service, redirecting to login");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Return children only if all authentication checks pass
  return <>{children}</>;
};

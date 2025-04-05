
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredService: "crunchyroll" | "netflix" | "prime";
}

export const ProtectedRoute = ({ children, requiredService }: ProtectedRouteProps) => {
  const { user } = useAuth();

  // Only check for user - we don't need to make database calls here
  // PersistLogin has already handled authentication checks
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Simple service check logic
  // For a more complex version, you'd check permissions in the database
  if (requiredService === "crunchyroll") {
    // All authenticated users can access Crunchyroll
    return <>{children}</>;
  } else if (requiredService === "netflix" || requiredService === "prime") {
    // For demo purposes, allow all authenticated users to access Netflix and Prime
    // In a real app, you'd check permissions from the user object or database
    return <>{children}</>;
  } 

  return <Navigate to="/login" replace />;
};

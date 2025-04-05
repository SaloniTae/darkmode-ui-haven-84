
import { useState, useEffect } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const PersistLogin = () => {
  const { user, isLoading } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Once the auth state is loaded, we can update our local loading state
    if (!isLoading) {
      setIsCheckingAuth(false);
    }
  }, [isLoading]);

  if (isCheckingAuth || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If we're not loading and there's no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If we're not loading and there is a user, render the protected routes
  return <Outlet />;
};

export default PersistLogin;

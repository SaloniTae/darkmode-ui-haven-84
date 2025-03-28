
import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import useRefreshToken from "@/hooks/useRefreshToken";
import { Loader2 } from "lucide-react";

export const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        // Attempt to refresh the session
        const result = await refresh();
        
        if (result) {
          console.log("Session verified successfully");
          // If we're on the login page and we have a valid session, redirect to appropriate service dashboard
          if (window.location.pathname === '/login') {
            const service = result.user?.user_metadata?.service;
            if (service) {
              navigate(`/${service}`, { replace: true });
            }
          }
        } 
        // If explicitly not authenticated and not on login page, redirect to login
        // Never redirect if authentication state is undefined
        else if (isAuthenticated === false && window.location.pathname !== '/login') {
          console.log("No active session found, redirecting to login page");
          navigate('/login', { replace: true });
        }
      } catch (err) {
        console.error("Failed to refresh session:", err);
        // Never redirect on error, just log it
      } finally {
        // Only update state if component is still mounted
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    verifySession();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
};

export default PersistLogin;

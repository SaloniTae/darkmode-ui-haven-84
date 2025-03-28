
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import useRefreshToken from "@/hooks/useRefreshToken";
import { Loader2 } from "lucide-react";

export const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefreshToken();
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        await refresh();
      } catch (err) {
        console.error("Failed to refresh session:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Only attempt to refresh if not already authenticated
    !isAuthenticated ? verifySession() : setIsLoading(false);

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

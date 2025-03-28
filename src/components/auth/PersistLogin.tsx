
import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

export const PersistLogin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { setSession, setUser, setIsAuthenticated, setCurrentService, setIsAdmin } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      try {
        // Check if we have an existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          if (isMounted) setIsLoading(false);
          return;
        }
        
        if (data.session) {
          // We have a valid session, set all the auth state values
          if (isMounted) {
            console.log("Session found, setting auth state");
            setSession(data.session);
            setUser(data.session.user);
            setIsAuthenticated(true);
            
            const service = data.session.user?.user_metadata?.service;
            setCurrentService(service || null);
            setIsAdmin(service === 'crunchyroll');
          }
        }
      } catch (err) {
        console.error("Failed to verify session:", err);
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
  }, [setSession, setUser, setIsAuthenticated, setCurrentService, setIsAdmin]);

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

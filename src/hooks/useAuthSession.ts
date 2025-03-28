import { useState, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { ServiceType } from "@/types/auth";
import { useNavigate, useLocation } from "react-router-dom";

export const useAuthSession = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentService, setCurrentService] = useState<ServiceType | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.email);
        
        if (event === 'SIGNED_IN' && currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          setIsAuthenticated(true);
          
          const service = currentSession.user?.user_metadata?.service as ServiceType;
          setCurrentService(service || null);
          setIsAdmin(service === 'crunchyroll');
          
          if (location.pathname === '/login' || location.pathname === '/password-reset') {
            navigate(`/${service}`, { replace: true });
          }
        } else if (event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setIsAuthenticated(false);
          setCurrentService(null);
          setIsAdmin(false);
          
          if (location.pathname !== '/login' && location.pathname !== '/password-reset') {
            navigate('/login', { replace: true });
          }
        } else if (event === 'PASSWORD_RECOVERY') {
          // Explicitly navigate to the password reset page
          navigate('/password-reset', { replace: true });
        }
      }
    );

    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setIsLoading(false);
          return;
        }
        
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          setIsAuthenticated(true);
          
          const service = data.session.user?.user_metadata?.service as ServiceType;
          setCurrentService(service || null);
          setIsAdmin(service === 'crunchyroll');
          
          console.log("Session found for:", data.session.user?.email, "service:", service);
          
          if (location.pathname === '/login' && service) {
            navigate(`/${service}`, { replace: true });
          }
        } else {
          console.log("No existing session found");
          
          if (location.pathname !== '/login' && !location.pathname.includes('/login')) {
            navigate('/login', { replace: true });
          }
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Auth initialization error:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return {
    session,
    user,
    isAuthenticated,
    currentService,
    isAdmin,
    isLoading,
    setSession,
    setUser,
    setIsAuthenticated,
    setCurrentService,
    setIsAdmin
  };
};

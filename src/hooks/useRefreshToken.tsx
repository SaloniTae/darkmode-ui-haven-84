
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const useRefreshToken = () => {
  const { setSession, setUser, setIsAuthenticated, setCurrentService, setIsAdmin } = useAuth();

  const refresh = async () => {
    try {
      // Check if we have an existing session
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        setIsAuthenticated(true);
        
        const service = data.session.user?.user_metadata?.service;
        setCurrentService(service || null);
        setIsAdmin(service === 'crunchyroll');
        
        console.log("Session refreshed for:", data.session.user?.email);
        return data.session;
      }
      
      return null;
    } catch (error) {
      console.error("Error refreshing token:", error);
      return null;
    }
  };

  return refresh;
};

export default useRefreshToken;

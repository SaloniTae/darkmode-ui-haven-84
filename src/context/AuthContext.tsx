import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";

type ServiceType = "crunchyroll" | "netflix" | "prime";

interface AuthContextType {
  isAuthenticated: boolean;
  currentService: ServiceType | null;
  user: User | null;
  session: Session | null;
  login: (username: string, password: string, service: ServiceType) => Promise<void>;
  signup: (username: string, password: string, token: string, service: ServiceType) => Promise<void>;
  logout: () => Promise<void>;
  generateToken: (service: ServiceType) => Promise<string | null>;
  isAdmin: boolean;
  updateUsername: (newUsername: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentService, setCurrentService] = useState<ServiceType | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        // Get service from metadata
        const service = session?.user?.user_metadata?.service as ServiceType;
        setCurrentService(service || null);
        setIsAdmin(service === 'crunchyroll');
      }
    );

    // Check for existing session but don't auto-redirect, always show login first
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && location.pathname === '/') {
        // If we have a session and we're on the root route, keep the session
        setSession(session);
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session);
        
        const service = session?.user?.user_metadata?.service as ServiceType;
        setCurrentService(service || null);
        setIsAdmin(service === 'crunchyroll');
      } else if (location.pathname !== '/login') {
        // If not on login page and no valid session, redirect to login
        if (!session) {
          navigate('/login', { replace: true });
        } else {
          setSession(session);
          setUser(session?.user ?? null);
          setIsAuthenticated(!!session);
          
          const service = session?.user?.user_metadata?.service as ServiceType;
          setCurrentService(service || null);
          setIsAdmin(service === 'crunchyroll');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location.pathname]);

  // Add redirects only after login/logout, not on initial load
  useEffect(() => {
    if (isAuthenticated && currentService && location.pathname === '/login') {
      navigate(`/${currentService}`, { replace: true });
    }
  }, [isAuthenticated, currentService, navigate, location.pathname]);

  const login = async (username: string, password: string, service: ServiceType) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${username}@example.com`, // Using username@example.com as email format
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user?.user_metadata?.service !== service) {
        await supabase.auth.signOut();
        toast.error(`You are not authorized to access the ${service} dashboard`);
        return;
      }

      toast.success(`Logged in to ${service} dashboard successfully!`);
      navigate(`/${service}`);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    }
  };

  const signup = async (username: string, password: string, token: string, service: ServiceType) => {
    try {
      // First verify token
      const { data: tokenData, error: tokenError } = await supabase
        .from('tokens')
        .select('*')
        .eq('token', token)
        .eq('service', service)
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        toast.error("Invalid or expired token");
        return;
      }

      // Register user
      const { data, error } = await supabase.auth.signUp({
        email: `${username}@example.com`, // Using username@example.com as email format
        password,
        options: {
          data: {
            username,
            service
          }
        }
      });

      if (error) {
        throw error;
      }

      // Mark token as used
      await supabase
        .from('tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      toast.success(`Signed up to ${service} dashboard successfully!`);
      navigate(`/${service}`);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to signup");
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setCurrentService(null);
      setUser(null);
      setSession(null);
      navigate("/login");
      toast.info("Logged out successfully");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    }
  };

  const generateToken = async (service: ServiceType): Promise<string | null> => {
    try {
      if (currentService !== 'crunchyroll') {
        toast.error("Only Crunchyroll admin can generate tokens");
        return null;
      }

      // Generate a random token
      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      // Insert directly without RLS policies getting in the way
      const { error } = await supabase
        .from('tokens')
        .insert([{ 
          token, 
          service,
          used: false,
          created_by: user?.id || null
        }]);

      if (error) {
        console.error("Token generation error:", error);
        toast.error(`Failed to generate token: ${error.message}`);
        return null;
      }

      toast.success(`Generated token for ${service}`);
      return token;
    } catch (error: any) {
      console.error("Token generation error:", error);
      toast.error(error.message || "Failed to generate token");
      return null;
    }
  };

  const updateUsername = async (newUsername: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { username: newUsername }
      });

      if (error) {
        throw error;
      }

      toast.success("Username updated successfully");
    } catch (error: any) {
      console.error("Update username error:", error);
      toast.error(error.message || "Failed to update username");
    }
  };

  const updatePassword = async (newPassword: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully");
    } catch (error: any) {
      console.error("Update password error:", error);
      toast.error(error.message || "Failed to update password");
    }
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentService, 
      user,
      session,
      login, 
      signup,
      logout,
      generateToken,
      isAdmin,
      updateUsername,
      updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

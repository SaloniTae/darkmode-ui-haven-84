
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
  updateUsername: (newUsername: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  isAdmin: boolean;
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
    // Set up auth state listener FIRST
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

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session);
      
      const service = session?.user?.user_metadata?.service as ServiceType;
      setCurrentService(service || null);
      setIsAdmin(service === 'crunchyroll');
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle redirect on auth state change
  useEffect(() => {
    if (isAuthenticated && currentService && location.pathname === '/login') {
      const from = location.state?.from?.pathname || `/${currentService}`;
      navigate(from, { replace: true });
    } else if (!isAuthenticated && location.pathname !== '/login' && !location.pathname.startsWith('/signup')) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, currentService, navigate, location]);

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

      const token = Math.random().toString(36).substring(2, 10).toUpperCase();
      
      const { error } = await supabase
        .from('tokens')
        .insert([
          { 
            token, 
            service,
            created_by: user?.id
          }
        ]);

      if (error) {
        throw error;
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
    } catch (error: any) {
      console.error("Username update error:", error);
      throw error;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    try {
      // First verify current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || "",
        password: currentPassword
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // Update password
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error("Password update error:", error);
      throw error;
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
      updateUsername,
      updatePassword,
      isAdmin
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

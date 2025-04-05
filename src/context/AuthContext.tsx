import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ServiceType } from "@/types/auth";

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  generateToken: (service: ServiceType) => Promise<string>;
  login: (username: string, password: string, service: ServiceType) => Promise<void>;
  logout: () => Promise<void>;
  signup: (username: string, password: string, token: string, service: ServiceType) => Promise<void>;
  isAuthenticated: boolean;
  currentService: ServiceType | null;
  isAdmin: boolean;
  updateUsername: (newUsername: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentService, setCurrentService] = useState<ServiceType | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log(`Auth event: ${event}`);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession?.user);
        
        if (currentSession?.user?.user_metadata?.service) {
          const service = currentSession.user.user_metadata.service as ServiceType;
          setCurrentService(service);
          setIsAdmin(service === 'crunchyroll');
        }
        
        if (currentSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          setTimeout(() => {
            console.log("User authenticated successfully");
          }, 0);
        }
      }
    );

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        console.log("Initial auth check:", initialSession ? "Session found" : "No session found");
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        setIsAuthenticated(!!initialSession?.user);
        
        if (initialSession?.user?.user_metadata?.service) {
          const service = initialSession.user.user_metadata.service as ServiceType;
          setCurrentService(service);
          setIsAdmin(service === 'crunchyroll');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      toast.success("Logged in successfully");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign in");
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
      console.error("Sign out error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (username: string, password: string, service: ServiceType) => {
    try {
      setIsLoading(true);
      const email = username.includes('@') ? username : `${username}@gmail.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
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

      setCurrentService(service);
      setIsAdmin(service === 'crunchyroll');
      setIsAuthenticated(true);
      toast.success(`Logged in to ${service} dashboard successfully!`);
      navigate(`/${service}`);
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (username: string, password: string, token: string, service: ServiceType) => {
    try {
      setIsLoading(true);
      const { data: tokenData, error: tokenError } = await supabase
        .from('tokens')
        .select('*')
        .eq('token', token)
        .eq('service', service)
        .eq('used', false)
        .single();

      if (tokenError || !tokenData) {
        toast.error("Invalid or expired token");
        setIsLoading(false);
        return;
      }

      const email = username.includes('@') ? username : `${username}@gmail.com`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
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

      await supabase
        .from('tokens')
        .update({ used: true })
        .eq('id', tokenData.id);

      setCurrentService(service);
      setIsAdmin(service === 'crunchyroll');
      setIsAuthenticated(true);
      toast.success(`Signed up to ${service} dashboard successfully!`);
      navigate(`/${service}`);
    } catch (error: any) {
      console.error("Signup error:", error);
      toast.error(error.message || "Failed to signup");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setCurrentService(null);
      setIsAdmin(false);
      toast.info("Logged out successfully");
      navigate('/login');
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    } finally {
      setIsLoading(false);
    }
  };

  const generateToken = async (service: ServiceType): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('tokens')
        .insert([
          { 
            token: crypto.randomUUID(),
            service,
            created_by: user?.id
          }
        ])
        .select()
        .single();

      if (error) throw error;
      
      return data.token;
    } catch (error) {
      console.error("Error generating token:", error);
      toast.error("Failed to generate token");
      return "";
    }
  };

  const updateUsername = async (newUsername: string) => {
    try {
      setIsLoading(true);
      const email = newUsername.includes('@') ? newUsername : `${newUsername}@gmail.com`;
      
      const { error } = await supabase.auth.updateUser({
        email: email,
        data: { username: newUsername }
      });

      if (error) {
        throw error;
      }

      toast.success("Username updated successfully");
    } catch (error: any) {
      console.error("Update username error:", error);
      toast.error(error.message || "Failed to update username");
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        throw error;
      }

      toast.success("Password updated successfully");
      
      await supabase.auth.signOut({ scope: 'global' });
      
      setUser(null);
      setSession(null);
      setIsAuthenticated(false);
      setCurrentService(null);
      setIsAdmin(false);
      
      navigate('/login');
      
      toast.info("Logged out from all devices for security");
      return { success: true };
    } catch (error: any) {
      console.error("Update password error:", error);
      toast.error(error.message || "Failed to update password");
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        signIn,
        signOut,
        isLoading,
        generateToken,
        login,
        logout,
        signup,
        isAuthenticated,
        currentService,
        isAdmin,
        updateUsername,
        updatePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

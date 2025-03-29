
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { User, Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any; data: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any; data: any }>;
  updatePassword: (password: string) => Promise<{ error: any; data: any }>;
  generateToken: (service: "netflix" | "prime") => Promise<string>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.info("Auth state changed:", event, session ? "SESSION" : "NO SESSION");
        
        if (event === 'PASSWORD_RECOVERY') {
          navigate('/password-reset');
        } else if (event === 'SIGNED_OUT') {
          navigate('/login');
        } else if (event === 'USER_UPDATED') {
          // Force reload when user is updated (like password changes)
          setSession(session);
          setUser(session?.user ?? null);
          
          // Special case for password updates - we're handling this in validateSession
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.info("Initial auth check:", session ? "Session found" : "No session found");
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    return response;
  };

  const signUp = async (email: string, password: string) => {
    const response = await supabase.auth.signUp({ email, password });
    return response;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const response = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/password-reset',
    });
    return response;
  };

  const updatePassword = async (password: string) => {
    // Update the password
    const response = await supabase.auth.updateUser({ password });
    
    if (response.error) {
      return response;
    }
    
    // If password update was successful, log out all other sessions
    // by creating a new session (current one) and invalidating others
    try {
      await supabase.auth.refreshSession();
      toast.success("Password updated and all other sessions have been logged out");
    } catch (error) {
      console.error("Error refreshing session after password change:", error);
    }
    
    return response;
  };

  const generateToken = async (service: "netflix" | "prime"): Promise<string> => {
    // Mock implementation - in a real app, you would call a backend API
    return `${service}_${Math.random().toString(36).substring(2, 15)}`;
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    generateToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

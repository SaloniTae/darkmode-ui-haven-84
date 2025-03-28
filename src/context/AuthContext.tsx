
import React, { createContext, useContext, useEffect } from "react";
import { ServiceType, AuthContextType } from "@/types/auth";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthOperations } from "@/hooks/useAuthOperations";
import { useLocation } from "react-router-dom";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
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
  } = useAuthSession();

  const {
    login,
    signup,
    logout,
    generateToken: baseGenerateToken,
    updateUsername,
    updatePassword,
    confirmUsernameChange,
    pendingUsernameChange
  } = useAuthOperations();

  const location = useLocation();

  // Check if we're returning from an email confirmation
  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const params = new URLSearchParams(location.search);
      if (params.has('tab') && params.get('tab') === 'reset' && isAuthenticated) {
        // Handle password reset confirmation
      } else if (isAuthenticated && user?.email_confirmed_at) {
        // Check if this is a username change confirmation
        await confirmUsernameChange();
      }
    };

    handleEmailConfirmation();
  }, [location, isAuthenticated, user?.email_confirmed_at]);

  // Wrap the generateToken to include the current service and user ID
  const generateToken = async (service: ServiceType): Promise<string | null> => {
    return baseGenerateToken(service, currentService, user?.id);
  };

  // Get the display username, considering pending changes
  const displayUsername = pendingUsernameChange 
    ? user?.user_metadata?.username 
    : user?.user_metadata?.username || user?.email?.split('@')[0] || '';

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      currentService, 
      user,
      session,
      displayUsername,
      pendingUsernameChange,
      login, 
      signup,
      logout,
      generateToken,
      isAdmin,
      updateUsername,
      updatePassword,
      setSession,
      setUser,
      setIsAuthenticated,
      setCurrentService,
      setIsAdmin
    }}>
      {isLoading ? (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        children
      )}
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

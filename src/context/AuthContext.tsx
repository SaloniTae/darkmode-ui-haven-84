
import React, { createContext, useContext } from "react";
import { ServiceType, AuthContextType } from "@/types/auth";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useAuthOperations } from "@/hooks/useAuthOperations";

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
    updatePassword
  } = useAuthOperations();

  // Wrap the generateToken to include the current service and user ID
  const generateToken = async (service: ServiceType): Promise<string | null> => {
    return baseGenerateToken(service, currentService, user?.id);
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

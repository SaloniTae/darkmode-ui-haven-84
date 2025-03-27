
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

type ServiceType = "crunchyroll" | "netflix" | "prime";

interface AuthContextType {
  isAuthenticated: boolean;
  currentService: ServiceType | null;
  login: (service: ServiceType) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentService, setCurrentService] = useState<ServiceType | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for existing auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem("auth");
    if (savedAuth) {
      const { authenticated, service } = JSON.parse(savedAuth);
      setIsAuthenticated(authenticated);
      setCurrentService(service as ServiceType);
    }
  }, []);

  // Handle redirect on auth state change
  useEffect(() => {
    const from = location.state?.from?.pathname || `/${currentService}`;
    
    if (isAuthenticated && currentService) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, currentService, navigate, location]);

  const login = (service: ServiceType) => {
    // For testing, no password required as per request
    setIsAuthenticated(true);
    setCurrentService(service);
    
    // Save auth state to localStorage
    localStorage.setItem("auth", JSON.stringify({ authenticated: true, service }));
    
    toast.success(`Logged in to ${service} dashboard successfully!`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentService(null);
    localStorage.removeItem("auth");
    navigate("/login");
    toast.info("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, currentService, login, logout }}>
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

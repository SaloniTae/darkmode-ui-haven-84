
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: string | null;
  service: string | null;
  login: (username: string, password: string, service: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  service: null,
  login: () => {},
  logout: async () => {},
  isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<string | null>(localStorage.getItem("user"));
  const [service, setService] = useState<string | null>(localStorage.getItem("service"));
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem("user"));
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is in localStorage on mount
    const storedUser = localStorage.getItem("user");
    const storedService = localStorage.getItem("service");
    if (storedUser && storedService) {
      setUser(storedUser);
      setService(storedService);
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string, service: string) => {
    // Implement proper auth validation later
    if (username && password) {
      localStorage.setItem("user", username);
      localStorage.setItem("service", service);
      setUser(username);
      setService(service);
      setIsAuthenticated(true);
      
      toast.success(`Logged in successfully to ${service}`);
      
      // Redirect based on service
      switch (service) {
        case "crunchyroll":
          navigate("/crunchyroll");
          break;
        case "netflix":
          navigate("/netflix");
          break;
        case "prime":
          navigate("/prime");
          break;
        default:
          navigate("/");
      }
    } else {
      toast.error("Invalid credentials");
    }
  };

  const logout = async (): Promise<void> => {
    localStorage.removeItem("user");
    localStorage.removeItem("service");
    setUser(null);
    setService(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        service,
        login,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

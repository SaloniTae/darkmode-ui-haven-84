
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  user: string | null;
  service: string | null;
  currentService: string | null; // Added for ProtectedRoute
  login: (username: string, password: string, service: string) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  updateUsername: (newUsername: string) => Promise<void>; // Added for UserSettingsMenu
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>; // Added for UserSettingsMenu
  generateToken: (service: string) => Promise<string>; // Added for TokenGenerator
  user_metadata?: { // Added for UserSettingsMenu
    username?: string;
  };
  email?: string; // Added for UserSettingsMenu
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  service: null,
  currentService: null,
  login: () => {},
  logout: async () => {},
  isAuthenticated: false,
  updateUsername: async () => {},
  updatePassword: async () => {},
  generateToken: async () => "",
  user_metadata: { username: undefined },
  email: undefined
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

  // New functions to implement the missing functionality
  const updateUsername = async (newUsername: string): Promise<void> => {
    // In a real implementation, this would call to a backend API
    // Here we just update localStorage for the demo
    if (newUsername) {
      localStorage.setItem("user", newUsername);
      setUser(newUsername);
      toast.success("Username updated successfully");
    } else {
      throw new Error("Username cannot be empty");
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<void> => {
    // In a real implementation, this would validate the current password
    // and update it in the backend
    // Here we just show a success message for the demo
    if (currentPassword && newPassword) {
      toast.success("Password updated successfully");
    } else {
      throw new Error("Password cannot be empty");
    }
  };

  const generateToken = async (service: string): Promise<string> => {
    // In a real implementation, this would generate a token in the backend
    // Here we just return a mock token for the demo
    const mockToken = `${service}_${Math.random().toString(36).substring(2, 15)}`;
    toast.success(`Generated token for ${service}`);
    return mockToken;
  };

  // Create a user object with metadata for compatibility with the UserSettingsMenu
  const userWithMetadata = {
    user_metadata: {
      username: user
    },
    email: user
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        service,
        currentService: service, // Map service to currentService for ProtectedRoute
        login,
        logout,
        isAuthenticated,
        updateUsername,
        updatePassword,
        generateToken,
        ...userWithMetadata // Spread the metadata for UserSettingsMenu compatibility
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

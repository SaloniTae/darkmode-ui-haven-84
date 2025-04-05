import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/components/ThemeProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { ServiceType } from "@/types/auth";

const PasswordResetPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [service, setService] = useState<ServiceType>("crunchyroll");
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const serviceParam = searchParams.get("service") as ServiceType | null;
    
    if (serviceParam && ["netflix", "crunchyroll", "prime"].includes(serviceParam)) {
      setService(serviceParam as ServiceType);
      try {
        localStorage.setItem("lastService", serviceParam);
      } catch (error) {
        console.warn("Could not access localStorage", error);
      }
    } else {
      try {
        const storedService = localStorage.getItem("lastService");
        if (storedService && ["netflix", "crunchyroll", "prime"].includes(storedService)) {
          setService(storedService as ServiceType);
        }
      } catch (error) {
        console.warn("Could not access localStorage", error);
      }
      
      const path = location.pathname;
      if (path.includes('netflix')) {
        setService('netflix');
        localStorage.setItem("lastService", 'netflix');
      } else if (path.includes('prime')) {
        setService('prime');
        localStorage.setItem("lastService", 'prime');
      }
    }
    
    const checkUserMetadata = async () => {
      try {
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase.auth.getSession();
        
        if (data.session?.user?.user_metadata?.service) {
          const userService = data.session.user.user_metadata.service as ServiceType;
          setService(userService);
          localStorage.setItem("lastService", userService);
        }
      } catch (error) {
        console.warn("Could not check user metadata", error);
      }
    };
    
    checkUserMetadata();
    
    const timer = setTimeout(() => {
      setIsPageLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await updatePassword(password);
      
      if (result && result.error) {
        toast.error(`Error updating password: ${result.error.message}`);
      } else {
        toast.success("Password updated successfully. All other sessions have been logged out.");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error: any) {
      console.error("Error during password reset:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonStyle = () => {
    if (resolvedTheme === 'dark') {
      return "bg-[#1c1c1c] hover:bg-[#2a2a2a] text-white border border-gray-700/30";
    } else {
      return "bg-[#f1f1f1] hover:bg-[#e5e5e5] text-black border border-gray-300/30";
    }
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-4 bg-gradient-to-b from-background/10 to-background/30 transition-colors duration-300">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md mx-auto">
        {isPageLoading ? (
          <>
            <div className="flex justify-center mb-6">
              <Skeleton className="w-12 h-12 rounded-full" />
            </div>
            <div className="w-full space-y-4">
              <Skeleton className="h-[200px] w-full rounded-lg" />
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-center mb-6 animate-fade-in">
              <Logo size="lg" service={service} />
            </div>
            
            <Card className="w-full border-border bg-card/80 backdrop-blur-sm shadow-lg animate-scale-in transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-xl text-center">Reset Password</CardTitle>
                <CardDescription className="text-center">
                  Enter your new password below
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your new password"
                      required
                      className="transition-all duration-200"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      required
                      className="transition-all duration-200"
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className={`w-full transition-all duration-200 ${getButtonStyle()}`} 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                        Updating...
                      </>
                    ) : "Reset Password"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
type ServiceType = "crunchyroll" | "netflix" | "prime";
export default function LoginPage() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">("login");
  const [token, setToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    login,
    signup,
    isAuthenticated,
    currentService
  } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && currentService) {
      navigate(`/${currentService}`);
    }
  }, [isAuthenticated, currentService, navigate]);
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService) {
      const processedUsername = username.includes('@') ? username : `${username}@gmail.com`;
      await login(processedUsername, password, selectedService);
    }
  };
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedService) return;
    const processedUsername = username.includes('@') ? username : `${username}@gmail.com`;
    await signup(processedUsername, password, token, selectedService);
  };
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const processedEmail = resetEmail.includes('@') ? resetEmail : `${resetEmail}@gmail.com`;

      // Use window.location.origin instead of hardcoding localhost:3000
      const {
        error
      } = await supabase.auth.resetPasswordForEmail(processedEmail, {
        redirectTo: `${window.location.origin}/password-reset`
      });
      if (error) {
        throw error;
      }
      toast.success("Password reset email sent! Check your inbox.");
      setActiveTab("login");
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setIsLoading(false);
      setResetEmail("");
    }
  };
  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    setUsername("");
    setPassword("");
    setToken("");
    setActiveTab("login");
    setResetEmail("");
  };

  // Get service color for styling
  const getServiceColor = (service: ServiceType) => {
    switch (service) {
      case "crunchyroll":
        return "#F47521";
      case "netflix":
        return "#E50914";
      case "prime":
        return "#00A8E1";
      default:
        return "#F47521";
    }
  };

  // Get service name for display
  const getServiceName = (service: ServiceType) => {
    switch (service) {
      case "crunchyroll":
        return "Crunchyroll";
      case "netflix":
        return "Netflix";
      case "prime":
        return "Prime Video";
      default:
        return "Service";
    }
  };
  return <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-background/10 to-background/30">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="w-full max-w-md">
        {selectedService ? <Button variant="ghost" onClick={() => setSelectedService(null)} className="mb-6">
            ← Back to selection
          </Button> : null}
        
        <Card className="w-full border-border bg-card/80 backdrop-blur-sm shadow-lg">
          {!selectedService ?
        // Service Selection
        <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Select Dashboard</CardTitle>
                <CardDescription>Choose which dashboard you want to access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {(["crunchyroll", "netflix", "prime"] as ServiceType[]).map(service => <Button key={service} onClick={() => handleServiceSelect(service)} className="w-full p-4 h-16 justify-start gap-3 transition-all hover:translate-y-[-2px]" style={{
                backgroundColor: getServiceColor(service),
                color: 'white'
              }}>
                      <Logo service={service} size="sm" />
                      <span className="text-lg font-medium capitalize">{getServiceName(service)}</span>
                    </Button>)}
                </div>
              </CardContent>
            </> :
        // Authentication Form
        <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Logo service={selectedService} size="lg" />
                </div>
                <CardTitle style={{
              color: getServiceColor(selectedService)
            }} className="text-2xl text-inherit">
                  {getServiceName(selectedService)} Dashboard
                </CardTitle>
                <CardDescription>
                  {activeTab === "login" ? "Sign in to your account" : activeTab === "signup" ? "Create a new account" : "Reset your password"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={v => setActiveTab(v as "login" | "signup" | "forgot")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div>
                        <Label htmlFor="username">Username</Label>
                        <Input id="username" value={username} onChange={e => setUsername(e.target.value)} className="mt-1" placeholder="Enter your username" required />
                      </div>
                      
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input id="password" type={showPassword ? "text" : "password"} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 pr-10" required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                        <button type="button" onClick={() => setActiveTab("forgot")} className="text-sm text-right w-full mt-1 text-muted-foreground hover:text-primary transition-colors">
                          Forgot password?
                        </button>
                      </div>
                      
                      <Button type="submit" className="w-full" style={{
                    backgroundColor: getServiceColor(selectedService),
                    color: 'white'
                  }}>
                        <LogIn className="mr-2 h-4 w-4" /> Sign In
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div>
                        <Label htmlFor="signup-username">Username</Label>
                        <Input id="signup-username" value={username} onChange={e => setUsername(e.target.value)} className="mt-1" placeholder="Choose a username" required />
                      </div>
                      
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input id="signup-password" type={showPassword ? "text" : "password"} placeholder="Choose a password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 pr-10" required />
                          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="token">Invitation Token</Label>
                        <Input id="token" value={token} onChange={e => setToken(e.target.value)} className="mt-1" placeholder="Enter your invitation token" required />
                      </div>
                      
                      <Button type="submit" className="w-full" style={{
                    backgroundColor: getServiceColor(selectedService),
                    color: 'white'
                  }}>
                        <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="forgot">
                    <form onSubmit={handleForgotPassword} className="space-y-4">
                      <div>
                        <Label htmlFor="reset-email">Email</Label>
                        <Input id="reset-email" value={resetEmail} onChange={e => setResetEmail(e.target.value)} className="mt-1" placeholder="Enter your email" required />
                      </div>
                      
                      <Button type="submit" className="w-full" disabled={isLoading} style={{
                    backgroundColor: getServiceColor(selectedService),
                    color: 'white'
                  }}>
                        {isLoading ? "Sending..." : "Reset Password"}
                      </Button>

                      <Button type="button" variant="outline" className="w-full mt-2" onClick={() => setActiveTab("login")}>
                        Back to Login
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <p>
                  {activeTab === "login" ? "Don't have an account? " : activeTab === "signup" ? "Already have an account? " : "Remember your password? "}
                  <button className="underline text-primary hover:text-primary/80 transition-colors" onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}>
                    {activeTab === "login" ? "Sign up" : activeTab === "signup" ? "Log in" : "Log in"}
                  </button>
                </p>
              </CardFooter>
            </>}
        </Card>
      </div>
    </div>;
}
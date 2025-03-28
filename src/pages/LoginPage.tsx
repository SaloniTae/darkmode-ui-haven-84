
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, LogIn, UserPlus, Mail } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

type ServiceType = "crunchyroll" | "netflix" | "prime";

export default function LoginPage() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [useEmail, setUseEmail] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [token, setToken] = useState("");
  const { login, signup, isAuthenticated, currentService } = useAuth();
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
      const loginId = useEmail ? email : username;
      await login(loginId, password, selectedService);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !selectedService) return;
    await signup(username, email, password, token, selectedService);
  };

  const handleServiceSelect = (service: ServiceType) => {
    setSelectedService(service);
    setUsername("");
    setEmail("");
    setPassword("");
    setToken("");
    setActiveTab("login");
    setUseEmail(false);
  };

  // Get service color for styling
  const getServiceColor = (service: ServiceType) => {
    switch (service) {
      case "crunchyroll": return "#F47521";
      case "netflix": return "#E50914";
      case "prime": return "#00A8E1";
      default: return "#F47521";
    }
  };

  // Get service name for display
  const getServiceName = (service: ServiceType) => {
    switch (service) {
      case "crunchyroll": return "Crunchyroll";
      case "netflix": return "Netflix";
      case "prime": return "Prime Video";
      default: return "Service";
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        {selectedService ? (
          <Button 
            variant="ghost" 
            onClick={() => setSelectedService(null)}
            className="mb-6"
          >
            ← Back to selection
          </Button>
        ) : null}
        
        <Card className="w-full">
          {!selectedService ? (
            // Service Selection
            <>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Select Dashboard</CardTitle>
                <CardDescription>Choose which dashboard you want to access</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {(["crunchyroll", "netflix", "prime"] as ServiceType[]).map((service) => (
                    <Button
                      key={service}
                      onClick={() => handleServiceSelect(service)}
                      className="w-full p-4 h-16 justify-start gap-3"
                      style={{
                        backgroundColor: getServiceColor(service),
                        color: 'white'
                      }}
                    >
                      <Logo service={service} size="sm" />
                      <span className="text-lg font-medium capitalize">{getServiceName(service)}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </>
          ) : (
            // Authentication Form
            <>
              <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                  <Logo service={selectedService} size="lg" />
                </div>
                <CardTitle className="text-2xl" style={{ color: getServiceColor(selectedService) }}>
                  {getServiceName(selectedService)} Dashboard
                </CardTitle>
                <CardDescription>
                  {activeTab === "login" ? "Sign in to your account" : "Create a new account"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "login" | "signup")} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="flex items-center space-x-2 mb-4">
                        <Button 
                          type="button" 
                          variant={useEmail ? "outline" : "default"}
                          onClick={() => setUseEmail(false)}
                          className="flex-1"
                        >
                          Username
                        </Button>
                        <Button 
                          type="button" 
                          variant={useEmail ? "default" : "outline"}
                          onClick={() => setUseEmail(true)}
                          className="flex-1"
                        >
                          Email
                        </Button>
                      </div>

                      {useEmail ? (
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1"
                            placeholder="Enter your email"
                            required
                          />
                        </div>
                      ) : (
                        <div>
                          <Label htmlFor="username">Username</Label>
                          <Input
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="mt-1"
                            placeholder="Enter your username"
                            required
                          />
                        </div>
                      )}
                      
                      <div>
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        style={{
                          backgroundColor: getServiceColor(selectedService),
                          color: 'white'
                        }}
                      >
                        <LogIn className="mr-2 h-4 w-4" /> Sign In
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div>
                        <Label htmlFor="signup-username">Username</Label>
                        <Input
                          id="signup-username"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="mt-1"
                          placeholder="Choose a username"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="mt-1"
                          placeholder="Enter your email address"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Email is optional. If provided, email confirmation will be required.
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="signup-password">Password</Label>
                        <div className="relative">
                          <Input
                            id="signup-password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Choose a password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 pr-10"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="token">Invitation Token</Label>
                        <Input
                          id="token"
                          value={token}
                          onChange={(e) => setToken(e.target.value)}
                          className="mt-1"
                          placeholder="Enter your invitation token"
                          required
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        style={{
                          backgroundColor: getServiceColor(selectedService),
                          color: 'white'
                        }}
                      >
                        <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter className="flex justify-center text-sm text-muted-foreground">
                <p>
                  {activeTab === "login" 
                    ? "Don't have an account? " 
                    : "Already have an account? "}
                  <button 
                    className="underline"
                    onClick={() => setActiveTab(activeTab === "login" ? "signup" : "login")}
                  >
                    {activeTab === "login" ? "Sign up" : "Log in"}
                  </button>
                </p>
              </CardFooter>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

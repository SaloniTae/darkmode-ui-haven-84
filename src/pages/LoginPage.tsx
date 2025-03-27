
import { useState, useEffect } from "react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CrunchyrollLogin } from "@/components/auth/CrunchyrollLogin";
import { NetflixLogin } from "@/components/auth/NetflixLogin";
import { PrimeLogin } from "@/components/auth/PrimeLogin";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [selectedService, setSelectedService] = useState<"crunchyroll" | "netflix" | "prime">("crunchyroll");
  const { theme } = useTheme();
  const { isAuthenticated, service } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (isAuthenticated && service) {
      navigate(`/${service}`);
    }
  }, [isAuthenticated, service, navigate]);

  // Animation classes based on current theme
  const getGlassClass = () => {
    switch (theme) {
      case "dark":
        return "glass-morphism bg-black/40";
      case "light":
        return "bg-white/90 shadow-lg border border-gray-200";
      default:
        return window.matchMedia('(prefers-color-scheme: dark)').matches 
          ? "glass-morphism bg-black/40" 
          : "bg-white/90 shadow-lg border border-gray-200";
    }
  };

  const getServiceColor = (service: string) => {
    switch (service) {
      case "crunchyroll":
        return "text-[#F47521]";
      case "netflix":
        return "text-[#E50914]";
      case "prime":
        return "text-[#00A8E1]";
      default:
        return "";
    }
  };

  const getServiceBgColor = (service: string) => {
    switch (service) {
      case "crunchyroll":
        return "bg-[#F47521]/10";
      case "netflix":
        return "bg-[#E50914]/10";
      case "prime":
        return "bg-[#00A8E1]/10";
      default:
        return "";
    }
  };

  const handleServiceSelect = (service: "crunchyroll" | "netflix" | "prime") => {
    setSelectedService(service);
  };
  
  // Navigate between tabs
  const navigateToLoginTab = () => {
    const loginTabTrigger = document.querySelector('button[value="login"]') as HTMLButtonElement | null;
    if (loginTabTrigger) {
      loginTabTrigger.click();
    }
  };
  
  const navigateToSelectTab = () => {
    const selectTabTrigger = document.querySelector('button[value="select"]') as HTMLButtonElement | null;
    if (selectTabTrigger) {
      selectTabTrigger.click();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative animate-fade-in">
      {/* Background effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background to-background/80" />
      </div>

      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className={`w-full max-w-md p-6 rounded-xl ${getGlassClass()}`}>
        <Tabs defaultValue="select" className="w-full">
          <TabsList className="w-full mb-6 grid grid-cols-2 h-auto p-1 glass-morphism shadow-lg">
            <TabsTrigger value="select">Select Dashboard</TabsTrigger>
            <TabsTrigger value="login">Login</TabsTrigger>
          </TabsList>

          <TabsContent value="select" className="mt-0 space-y-6">
            <h1 className="text-2xl font-bold text-center mb-6">Select Dashboard</h1>
            
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => handleServiceSelect("crunchyroll")}
                variant="outline"
                className={`flex flex-col items-center justify-center p-6 h-auto transition-all ${
                  selectedService === "crunchyroll" ? `ring-2 ring-[#F47521] ${getServiceBgColor("crunchyroll")}` : ""
                }`}
              >
                <Logo service="crunchyroll" size="lg" />
                <span className={`mt-2 font-medium ${getServiceColor("crunchyroll")}`}>Crunchyroll</span>
              </Button>
              
              <Button 
                onClick={() => handleServiceSelect("netflix")}
                variant="outline"
                className={`flex flex-col items-center justify-center p-6 h-auto transition-all ${
                  selectedService === "netflix" ? `ring-2 ring-[#E50914] ${getServiceBgColor("netflix")}` : ""
                }`}
              >
                <Logo service="netflix" size="lg" />
                <span className={`mt-2 font-medium ${getServiceColor("netflix")}`}>Netflix</span>
              </Button>
              
              <Button 
                onClick={() => handleServiceSelect("prime")}
                variant="outline"
                className={`flex flex-col items-center justify-center p-6 h-auto transition-all ${
                  selectedService === "prime" ? `ring-2 ring-[#00A8E1] ${getServiceBgColor("prime")}` : ""
                }`}
              >
                <Logo service="prime" size="lg" />
                <span className={`mt-2 font-medium ${getServiceColor("prime")}`}>Prime</span>
              </Button>
            </div>
            
            <div className="text-center">
              <Button 
                onClick={navigateToLoginTab} 
                className="mt-4"
              >
                Continue
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="login" className="mt-0">
            {selectedService === "crunchyroll" && <CrunchyrollLogin />}
            {selectedService === "netflix" && <NetflixLogin />}
            {selectedService === "prime" && <PrimeLogin />}
            
            <div className="text-center mt-4">
              <Button 
                variant="ghost" 
                onClick={navigateToSelectTab}
              >
                Change Dashboard
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

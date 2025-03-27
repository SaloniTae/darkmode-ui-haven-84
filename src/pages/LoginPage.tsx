
import { useState } from "react";
import { CrunchyrollLogin } from "@/components/auth/CrunchyrollLogin";
import { NetflixLogin } from "@/components/auth/NetflixLogin";
import { PrimeLogin } from "@/components/auth/PrimeLogin";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";

type ServiceType = "crunchyroll" | "netflix" | "prime" | null;

export default function LoginPage() {
  const [selectedService, setSelectedService] = useState<ServiceType>(null);

  // Render the appropriate login component based on selected service
  const renderLoginForm = () => {
    switch (selectedService) {
      case "crunchyroll":
        return <CrunchyrollLogin />;
      case "netflix":
        return <NetflixLogin />;
      case "prime":
        return <PrimeLogin />;
      default:
        return (
          <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in">
            <h1 className="text-2xl md:text-3xl font-bold text-center">Choose your dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
              {renderServiceButton("crunchyroll")}
              {renderServiceButton("netflix")}
              {renderServiceButton("prime")}
            </div>
          </div>
        );
    }
  };

  // Render a button for each service
  const renderServiceButton = (service: ServiceType) => {
    if (!service) return null;
    
    return (
      <Button
        onClick={() => setSelectedService(service)}
        className="flex flex-col items-center justify-center p-8 h-auto hover:scale-105 transition-all glass-morphism border border-white/10"
        variant="ghost"
      >
        <Logo service={service} size="lg" className="mb-4" />
        <span className="text-lg font-medium capitalize">{service}</span>
      </Button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        {selectedService && (
          <Button 
            variant="ghost" 
            onClick={() => setSelectedService(null)}
            className="mb-6"
          >
            ← Back to selection
          </Button>
        )}
        
        <div className="glass-morphism p-8 rounded-xl shadow-lg">
          {renderLoginForm()}
        </div>
      </div>
    </div>
  );
}

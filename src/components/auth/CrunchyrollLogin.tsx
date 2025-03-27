
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";

export const CrunchyrollLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(username, password, "crunchyroll");
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <Logo service="crunchyroll" size="lg" />
      <h1 className="text-2xl font-bold text-[#F47521]">Crunchyroll Admin</h1>
      
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        <div>
          <Input
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-white/5 border-[#F47521]/30 focus-visible:ring-[#F47521]"
            required
          />
        </div>
        
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-white/5 border-[#F47521]/30 focus-visible:ring-[#F47521] pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-[#F47521] hover:bg-[#F47521]/90 text-white"
        >
          <LogIn className="mr-2 h-4 w-4" /> Sign In
        </Button>
      </form>
    </div>
  );
};

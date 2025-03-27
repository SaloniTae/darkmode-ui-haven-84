
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { UserSettingsMenu } from "@/components/UserSettingsMenu";
import { UserSettingsDropdown } from "@/components/UserSettingsDropdown";
import { useParams } from "react-router-dom";

export function Header() {
  const { service } = useParams();
  
  const getServiceName = () => {
    switch (service) {
      case "crunchyroll":
        return "Crunchyroll";
      case "netflix":
        return "Netflix";
      case "prime":
        return "Prime";
      default:
        return "Admin";
    }
  };

  const getServiceColor = () => {
    switch (service) {
      case "crunchyroll":
        return "text-[#F47521]";
      case "netflix":
        return "text-[#E50914]";
      case "prime":
        return "text-[#00A8E1]";
      default:
        return "text-primary";
    }
  };

  return (
    <header className="border-b sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="flex items-center gap-2 md:gap-3">
          <Logo service={service as "crunchyroll" | "netflix" | "prime" | undefined} />
          <div className="hidden md:block">
            <h1 className={`text-xl font-bold ${getServiceColor()}`}>
              {getServiceName()} Admin
            </h1>
          </div>
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <UserSettingsDropdown />
          <ThemeToggle />
          <UserSettingsMenu />
        </div>
      </div>
    </header>
  );
}

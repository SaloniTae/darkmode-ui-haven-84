
import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  service?: 'crunchyroll' | 'netflix' | 'prime';
}

export const Logo = memo(function Logo({ 
  className, 
  size = 'md',
  service = 'crunchyroll'
}: LogoProps) {
  const { theme } = useTheme();
  const [effectiveTheme, setEffectiveTheme] = useState<'dark' | 'light'>('dark');
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  // Update effective theme when system preference or theme changes
  useEffect(() => {
    const updateEffectiveTheme = () => {
      if (theme === 'system') {
        // For system mode, we'll show light theme logos
        setEffectiveTheme('light');
      } else {
        setEffectiveTheme(theme as 'dark' | 'light');
      }
    };

    updateEffectiveTheme();

    // Listen for changes in system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (theme === 'system') {
        updateEffectiveTheme();
      }
    };

    // Add event listener with newer API if available
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handler);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handler);
    }

    return () => {
      // Clean up listener with newer API if available
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener('change', handler);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handler);
      }
    };
  }, [theme]);

  // Get the appropriate logo based on service and effective theme
  const getLogo = () => {
    switch (service) {
      case 'netflix':
        return effectiveTheme === "light" 
          ? "https://img.icons8.com/?size=512&id=YiCrW5hUkQCr&format=png" 
          : "https://raw.githubusercontent.com/OTTONRENT01/FOR-PHOTOS/refs/heads/main/Netflix-white.png";
      case 'prime':
        return effectiveTheme === "light" 
          ? "https://raw.githubusercontent.com/OTTONRENT01/FOR-PHOTOS/refs/heads/main/Prime-black.png" 
          : "https://raw.githubusercontent.com/OTTONRENT01/FOR-PHOTOS/refs/heads/main/Prime-white.png";
      case 'crunchyroll':
      default:
        return effectiveTheme === "light" 
          ? "https://static-00.iconduck.com/assets.00/crunchyroll-icon-512x512-4xi4az2l.png" 
          : "https://img.icons8.com/ios-glyphs/120/FFFFFF/crunchyroll.png";
    }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <img 
        src={getLogo()} 
        alt={`${service} logo`} 
        className={cn(sizeClasses[size], "transition-all duration-300")} 
      />
    </div>
  );
});


import { memo, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = memo(function Logo({ className, size = 'md' }: LogoProps) {
  const { theme } = useTheme();
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      {theme === "light" ? (
        // Light mode logo
        <img 
          src="https://static-00.iconduck.com/assets.00/crunchyroll-icon-512x512-4xi4az2l.png" 
          alt="crunchyroll logo" 
          className={cn(sizeClasses[size], "transition-all duration-300")} 
        />
      ) : (
        // Dark mode logo
        <img 
          src="https://img.icons8.com/ios-glyphs/120/FFFFFF/crunchyroll.png" 
          alt="crunchyroll logo" 
          className={cn(sizeClasses[size], "transition-all duration-300")} 
        />
      )}
    </div>
  );
});

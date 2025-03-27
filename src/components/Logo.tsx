
import { memo } from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = memo(function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <img 
        src="https://img.icons8.com/ios-glyphs/120/FFFFFF/crunchyroll.png" 
        alt="crunchyroll logo" 
        className={cn(
          sizeClasses[size], 
          "dark:filter-none filter invert dark:brightness-100 brightness-0 transition-all duration-300"
        )} 
      />
    </div>
  );
});

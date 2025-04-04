
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  resolvedTheme: "dark",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Safe localStorage accessor function for theme only
const getStorageTheme = (fallback: any): any => {
  try {
    const item = window.localStorage.getItem("theme");
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn("localStorage is not available:", error);
    return fallback;
  }
};

// Safe localStorage setter function for theme only
const setStorageTheme = (value: any): void => {
  try {
    window.localStorage.setItem("theme", JSON.stringify(value));
  } catch (error) {
    console.warn("localStorage is not available for writing:", error);
  }
};

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    return getStorageTheme(defaultTheme) as Theme;
  });
  
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  // Function to determine system preference
  const getSystemTheme = (): "dark" | "light" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme: "dark" | "light";
    
    if (theme === "system") {
      effectiveTheme = getSystemTheme();
      console.log("System theme detected:", effectiveTheme);
    } else {
      effectiveTheme = theme as "dark" | "light";
      console.log("User selected theme:", effectiveTheme);
    }
    
    root.classList.add(effectiveTheme);
    setResolvedTheme(effectiveTheme);
    
    // Save theme choice to localStorage
    setStorageTheme(theme);
    
    // For system theme, listen to system preference changes
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = () => {
        const newSystemTheme = getSystemTheme();
        console.log("System theme changed to:", newSystemTheme);
        root.classList.remove("light", "dark");
        root.classList.add(newSystemTheme);
        setResolvedTheme(newSystemTheme);
      };
      
      try {
        // Modern browsers
        if (mediaQuery.addEventListener) {
          mediaQuery.addEventListener("change", handleChange);
        } else {
          // Legacy support
          mediaQuery.addListener(handleChange);
        }
        
        return () => {
          if (mediaQuery.removeEventListener) {
            mediaQuery.removeEventListener("change", handleChange);
          } else {
            mediaQuery.removeListener(handleChange);
          }
        };
      } catch (error) {
        console.error("Error setting up media query listener:", error);
      }
    }
  }, [theme]);

  const value = {
    theme,
    resolvedTheme,
    setTheme: (theme: Theme) => {
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

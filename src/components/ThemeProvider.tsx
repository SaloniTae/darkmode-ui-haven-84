
import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "dark" | "light"; // Add resolvedTheme to track actual theme
};

const initialState: ThemeProviderState = {
  theme: "dark",
  setTheme: () => null,
  resolvedTheme: "dark", // Default resolved theme
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

// Safe localStorage accessor function to handle cases where localStorage is unavailable
const getStorageItem = (key: string, fallback: any): any => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn("localStorage is not available:", error);
    return fallback;
  }
};

// Safe localStorage setter function
const setStorageItem = (key: string, value: any): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("localStorage is not available for writing:", error);
  }
};

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => {
    return getStorageItem("theme", defaultTheme) as Theme;
  });
  
  // Track the actual theme (dark or light) based on system preference or explicit setting
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

  // Function to determine if system prefers dark mode
  const getSystemTheme = (): "dark" | "light" => {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  };

  // Update the DOM with the correct theme class
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");

    let effectiveTheme: "dark" | "light";
    
    if (theme === "system") {
      effectiveTheme = getSystemTheme();
    } else {
      effectiveTheme = theme as "dark" | "light";
    }
    
    root.classList.add(effectiveTheme);
    setResolvedTheme(effectiveTheme);
    
    // Only save explicit theme choices to localStorage
    if (theme !== "system") {
      setStorageItem("theme", theme);
    }
    
    // Listen for system theme changes when in system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      // Update theme when system preference changes
      const handleChange = () => {
        const newSystemTheme = getSystemTheme();
        root.classList.remove("light", "dark");
        root.classList.add(newSystemTheme);
        setResolvedTheme(newSystemTheme);
      };
      
      // Add the event listener (use newer API if available)
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener("change", handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.addListener(handleChange);
      }
      
      return () => {
        // Clean up the event listener
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener("change", handleChange);
        } else {
          // Fallback for older browsers
          mediaQuery.removeListener(handleChange);
        }
      };
    }
  }, [theme]);

  const value = {
    theme,
    resolvedTheme, // Expose the actual theme being used
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

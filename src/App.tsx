import { Suspense, lazy, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "@/components/ThemeProvider";

// Lazy load pages to improve initial loading performance
const Admin = lazy(() => import("./pages/Admin"));
const Index = lazy(() => import("./pages/Index"));

// Create a new QueryClient with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevent unnecessary refetching
      retry: 1, // Limit retries to reduce network requests
      staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000, // Cache for 10 minutes (formerly cacheTime in v4)
    },
  },
});

// Security wrapper to prevent inspection and network sniffing
function SecureWrapper({ children }: { children: React.ReactNode }) {
  // Disable right click
  React.useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable console access
    const disableConsole = () => {
      const originalConsole = { ...console };
      window.console = {
        ...originalConsole,
        log: () => {},
        warn: () => {},
        error: () => {},
        info: () => {},
        debug: () => {},
      };
    };

    // Disable F12 key and other debugging keys
    const disableDevTools = (e: KeyboardEvent) => {
      // F12 key
      if (e.keyCode === 123) {
        e.preventDefault();
        return false;
      }

      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        // Ctrl+Shift+J
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", disableDevTools);
    window.addEventListener("load", disableConsole);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", disableDevTools);
    };
  }, []);

  return <>{children}</>;
}

// Memoize the App component to reduce unnecessary re-renders
const App = memo(() => (
  <ThemeProvider defaultTheme="dark">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <SecureWrapper>
          <BrowserRouter>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
            }>
              <Routes>
                {/* Redirect root to admin by default */}
                <Route path="/" element={<Navigate to="/admin" replace />} />
                
                {/* Admin routes for different streaming services */}
                <Route path="/admin" element={<Admin />} />
                <Route path="/crunchyroll" element={<Admin />} />
                <Route path="/netflix" element={<Admin />} />
                <Route path="/prime" element={<Admin />} />
                
                {/* Keep Index page for reference */}
                <Route path="/index" element={<Index />} />
                
                {/* Fallback for unknown routes */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </SecureWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
));

export default App;

import { Suspense, lazy, memo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { SecurityWrapper } from "@/components/security/SecurityWrapper";

// Lazy load pages to improve initial loading performance
const Admin = lazy(() => import("./pages/Admin"));
const CrunchyrollDashboard = lazy(() => import("./pages/CrunchyrollDashboard"));
const NetflixDashboard = lazy(() => import("./pages/NetflixDashboard"));
const PrimeDashboard = lazy(() => import("./pages/PrimeDashboard"));
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

// Memoize the App component to reduce unnecessary re-renders
const App = memo(() => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SecurityWrapper>
        <BrowserRouter>
          <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          }>
            <Routes>
              {/* Redirect root to admin by default */}
              <Route path="/" element={<Navigate to="/admin" replace />} />
              
              {/* Distinct dashboards for different streaming services */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/crunchyroll" element={<CrunchyrollDashboard />} />
              <Route path="/netflix" element={<NetflixDashboard />} />
              <Route path="/prime" element={<PrimeDashboard />} />
              
              {/* Keep Index page for reference */}
              <Route path="/index" element={<Index />} />
              
              {/* Fallback for unknown routes */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SecurityWrapper>
    </TooltipProvider>
  </QueryClientProvider>
));

export default App;

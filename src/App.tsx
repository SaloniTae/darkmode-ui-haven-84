
import React, { Suspense, lazy, memo } from "react";
import { Loader2 } from "lucide-react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { SetupAdmin } from "@/components/auth/SetupAdmin";

// Lazy load pages to improve initial loading performance
const CrunchyrollAdmin = lazy(() => import("./pages/CrunchyrollAdmin"));
const NetflixAdmin = lazy(() => import("./pages/NetflixAdmin"));
const PrimeAdmin = lazy(() => import("./pages/PrimeAdmin"));
const LoginPage = lazy(() => import("./pages/LoginPage"));

// Memoize the App component to reduce unnecessary re-renders
const App = memo(() => (
  <AuthProvider>
    <SetupAdmin />
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    }>
      <Routes>
        {/* Public route for login */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Protected routes for different streaming services */}
        <Route path="/crunchyroll" element={
          <ProtectedRoute requiredService="crunchyroll">
            <CrunchyrollAdmin />
          </ProtectedRoute>
        } />
        
        <Route path="/netflix" element={
          <ProtectedRoute requiredService="netflix">
            <NetflixAdmin />
          </ProtectedRoute>
        } />
        
        <Route path="/prime" element={
          <ProtectedRoute requiredService="prime">
            <PrimeAdmin />
          </ProtectedRoute>
        } />
        
        {/* Redirect root to login page */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  </AuthProvider>
));

export default App;

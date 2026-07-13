import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import Tours from "./pages/Tours";
import Food from "./pages/Food";
import Recommendations from "./pages/Recommendations";
import AdminRecommendations from "./pages/AdminRecommendations";
import PlaceDetail from "./pages/PlaceDetail";
import { LocationProvider } from "./context/LocationContext";

const queryClient = new QueryClient();

// Protected Route Wrapper
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Public Route Wrapper (redirects to dashboard if logged in)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Login page - accessible only if NOT logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Index />
                </PublicRoute>
              }
            />

            {/* Public Pages */}
            <Route path="/tours" element={<Tours />} />
            <Route path="/food" element={<Food />} />
            <Route path="/place/:id" element={<PlaceDetail />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/recommendations"
              element={
                <ProtectedRoute>
                  <AdminRecommendations />
                </ProtectedRoute>
              }
            />

            {/* Default route */}
            <Route
              path="/"
              element={
                <PublicRoute>
                  <Navigate to="/login" replace />
                </PublicRoute>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </LocationProvider>
    </QueryClientProvider>
  );
}

export default App;

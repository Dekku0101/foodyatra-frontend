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
import Ticket from "./pages/Ticket";
import FoodJourney from "./pages/FoodJourney";
import { LocationProvider } from "./context/LocationContext";

const queryClient = new QueryClient();

/**
 * Decode JWT payload safely
 */
const parseJwt = (token: string) => {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// Protected Route Wrapper with Expiry Check
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const payload = parseJwt(token);

  // If payload is corrupted or token is expired, clean up and redirect to login
  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    console.warn("Expired or invalid JWT token. Clearing session...");
    localStorage.removeItem("token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Admin Only Route Wrapper
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const payload = parseJwt(token);

  if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
    localStorage.removeItem("token");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (payload.role !== "admin") {
    console.warn("Non-admin user attempted to access admin page.");
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Wrapper (redirects to dashboard if logged in)
const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("token");

  if (token) {
    const payload = parseJwt(token);
    if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
      return <Navigate to="/dashboard" replace />;
    }
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

            {/* Ticket Page */}
            <Route
              path="/tickets/:bookingId"
              element={
                <ProtectedRoute>
                  <Ticket />
                </ProtectedRoute>
              }
            />

            {/* Protected User Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
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
              path="/journey"
              element={
                <ProtectedRoute>
                  <FoodJourney />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/recommendations"
              element={
                <AdminRoute>
                  <AdminRecommendations />
                </AdminRoute>
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

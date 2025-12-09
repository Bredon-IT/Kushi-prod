import { Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./hooks/useTheme";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/layout/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import Messages from "./pages/Messages";
import { InspectionDashboard } from "./pages/InspectionDashboard";
import { Bookings } from "./pages/Bookings";
import { Customers } from "./pages/Customers";
import { Services } from "./pages/Services";
import { Invoices } from "./pages/Invoices";
import { Financial } from "./pages/Financial";
import { Settings } from "./pages/Settings";
import Gallery from './pages/Gallery';
import { Toaster } from "react-hot-toast";

// Admin CSS
import './admin.css';

function AdminRoutesList() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />}
      />
      <Route
        path=""
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="bookings"
        element={
          <ProtectedRoute>
            <Layout>
              <Bookings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="inspection"
        element={
          <ProtectedRoute>
            <Layout>
              <InspectionDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="customers"
        element={
          <ProtectedRoute>
            <Layout>
              <Customers />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="messages"
        element={
          <ProtectedRoute>
            <Layout>
              <Messages />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="services"
        element={
          <ProtectedRoute>
            <Layout>
              <Services />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="invoices"
        element={
          <ProtectedRoute>
            <Layout>
              <Invoices />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="financial"
        element={
          <ProtectedRoute>
            <Layout>
              <Financial />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="gallery"
        element={
          <ProtectedRoute>
            <Layout>
              <Gallery />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

export default function AdminRoutes() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <AdminRoutesList />
      </AuthProvider>
    </ThemeProvider>
  );
}
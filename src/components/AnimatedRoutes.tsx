import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import PageTransition from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";

// Lazy load all pages for code splitting
const Index = lazy(() => import("@/pages/Index"));
const StorePage = lazy(() => import("@/pages/StorePage"));
const CartPage = lazy(() => import("@/pages/CartPage"));
const OrdersPage = lazy(() => import("@/pages/OrdersPage"));
const AccountPage = lazy(() => import("@/pages/AccountPage"));
const CategoryPage = lazy(() => import("@/pages/CategoryPage"));
const AuthPage = lazy(() => import("@/pages/AuthPage"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const RestaurantDashboard = lazy(() => import("@/pages/RestaurantDashboard"));
const DriverDashboard = lazy(() => import("@/pages/DriverDashboard"));
const LiveTrackingPage = lazy(() => import("@/pages/LiveTrackingPage"));
const InstallPage = lazy(() => import("@/pages/InstallPage"));
const LoyaltyPage = lazy(() => import("@/pages/LoyaltyPage"));
const OrderDetailsPage = lazy(() => import("@/pages/OrderDetailsPage"));
const OffersPage = lazy(() => import("@/pages/OffersPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <Suspense fallback={<PageFallback />}>
      <PageTransition key={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/store/:id" element={<StorePage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order/:id" element={<ProtectedRoute><OrderDetailsPage /></ProtectedRoute>} />
          <Route path="/track/:id" element={<ProtectedRoute><LiveTrackingPage /></ProtectedRoute>} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/category/:id" element={<CategoryPage />} />
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/restaurant-dashboard" element={<ProtectedRoute requiredRole="restaurant_owner"><RestaurantDashboard /></ProtectedRoute>} />
          <Route path="/driver" element={<ProtectedRoute requiredRole="driver"><DriverDashboard /></ProtectedRoute>} />
          <Route path="/loyalty" element={<ProtectedRoute><LoyaltyPage /></ProtectedRoute>} />
          <Route path="/offers" element={<OffersPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </PageTransition>
    </Suspense>
  );
};

export default AnimatedRoutes;

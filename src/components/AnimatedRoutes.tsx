import { Routes, Route, useLocation } from "react-router-dom";
import PageTransition from "./PageTransition";
import ProtectedRoute from "./ProtectedRoute";

import Index from "@/pages/Index";
import StorePage from "@/pages/StorePage";
import CartPage from "@/pages/CartPage";
import OrdersPage from "@/pages/OrdersPage";
import AccountPage from "@/pages/AccountPage";
import CategoryPage from "@/pages/CategoryPage";
import AuthPage from "@/pages/AuthPage";
import AdminDashboard from "@/pages/AdminDashboard";
import RestaurantDashboard from "@/pages/RestaurantDashboard";
import DriverDashboard from "@/pages/DriverDashboard";
import LiveTrackingPage from "@/pages/LiveTrackingPage";
import InstallPage from "@/pages/InstallPage";
import LoyaltyPage from "@/pages/LoyaltyPage";
import OrderDetailsPage from "@/pages/OrderDetailsPage";
import OffersPage from "@/pages/OffersPage";
import NotFound from "@/pages/NotFound";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
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
  );
};

export default AnimatedRoutes;

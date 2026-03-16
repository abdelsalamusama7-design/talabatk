import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
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
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><Index /></PageTransition>} />
        <Route path="/auth" element={<PageTransition><AuthPage /></PageTransition>} />
        <Route path="/store/:id" element={<PageTransition><StorePage /></PageTransition>} />
        <Route path="/cart" element={<PageTransition><CartPage /></PageTransition>} />
        <Route path="/orders" element={<PageTransition><OrdersPage /></PageTransition>} />
        <Route path="/order/:id" element={<ProtectedRoute><PageTransition><OrderDetailsPage /></PageTransition></ProtectedRoute>} />
        <Route path="/track/:id" element={<ProtectedRoute><PageTransition><LiveTrackingPage /></PageTransition></ProtectedRoute>} />
        <Route path="/account" element={<PageTransition><AccountPage /></PageTransition>} />
        <Route path="/category/:id" element={<PageTransition><CategoryPage /></PageTransition>} />
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><PageTransition><AdminDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/restaurant-dashboard" element={<ProtectedRoute requiredRole="restaurant_owner"><PageTransition><RestaurantDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute requiredRole="driver"><PageTransition><DriverDashboard /></PageTransition></ProtectedRoute>} />
        <Route path="/loyalty" element={<ProtectedRoute><PageTransition><LoyaltyPage /></PageTransition></ProtectedRoute>} />
        <Route path="/offers" element={<PageTransition><OffersPage /></PageTransition>} />
        <Route path="/install" element={<PageTransition><InstallPage /></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;

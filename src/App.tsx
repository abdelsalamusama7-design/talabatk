import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context";
import { OrderProvider } from "@/lib/order-context";
import { AuthProvider } from "@/lib/auth-context";
import Index from "./pages/Index";
import StorePage from "./pages/StorePage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import AccountPage from "./pages/AccountPage";
import CategoryPage from "./pages/CategoryPage";
import AuthPage from "./pages/AuthPage";
import AdminDashboard from "./pages/AdminDashboard";
import RestaurantDashboard from "./pages/RestaurantDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import BottomNav from "./components/BottomNav";
import InstallPage from "./pages/InstallPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <CartProvider>
          <OrderProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/store/:id" element={<StorePage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
                <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
                <Route path="/category/:id" element={<CategoryPage />} />
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/restaurant-dashboard" element={<ProtectedRoute requiredRole="restaurant_owner"><RestaurantDashboard /></ProtectedRoute>} />
                <Route path="/driver" element={<ProtectedRoute requiredRole="driver"><DriverDashboard /></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
              <BottomNav />
            </BrowserRouter>
          </OrderProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

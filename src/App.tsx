import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/lib/cart-context";
import { OrderProvider } from "@/lib/order-context";
import { AuthProvider } from "@/lib/auth-context";
import { LiveOrderProvider } from "@/lib/live-order-context";
import { LangProvider } from "@/lib/lang-context";
import OfferNotificationListener from "@/components/OfferNotificationListener";
import AdminNotificationListener from "@/components/AdminNotificationListener";
import SplashScreen from "@/components/SplashScreen";
import AnimatedRoutes from "@/components/AnimatedRoutes";
import BottomNav from "./components/BottomNav";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LangProvider>
          <AuthProvider>
            <CartProvider>
              <OrderProvider>
                <LiveOrderProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <OfferNotificationListener />
                    <AdminNotificationListener />
                    <AnimatedRoutes />
                    <Footer />
                    <BottomNav />
                  </BrowserRouter>
                </LiveOrderProvider>
              </OrderProvider>
            </CartProvider>
          </AuthProvider>
          </LangProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;

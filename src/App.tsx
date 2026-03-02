import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { CampusProvider } from "@/context/CampusContext";
import Home from "./pages/Home";
import CampusSetup from "./pages/CampusSetup";
import VendorPage from "./pages/VendorPage";
import CartPage from "./pages/CartPage";
import ExplorePage from "./pages/ExplorePage";
import OrdersPage from "./pages/OrdersPage";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CampusProvider>
        <CartProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/setup" element={<CampusSetup />} />
              <Route path="/vendor/:id" element={<VendorPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </CampusProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

import { useCampus } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";
import { Navigate } from "react-router-dom";
import { Package, CheckCircle, Clock, Truck, ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type Order = Tables<"orders">;

const statusConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  placed: { label: "Order Placed", icon: Package, color: "text-muted-foreground" },
  accepted: { label: "Accepted", icon: CheckCircle, color: "text-primary" },
  preparing: { label: "Preparing", icon: ChefHat, color: "text-warning" },
  picked_up: { label: "On the way", icon: Truck, color: "text-primary" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-success" },
  cancelled: { label: "Cancelled", icon: Package, color: "text-destructive" },
};

const OrdersPage = () => {
  const { isSetup, loading: campusLoading } = useCampus();
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Order[];
    },
    enabled: !!user,
  });

  if (campusLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSetup) return <Navigate to="/setup" replace />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <h1 className="font-display font-bold text-lg">My Orders</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <Package className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="font-display font-semibold text-lg">No orders yet</h2>
          <p className="text-sm text-muted-foreground mt-1">Your orders will appear here</p>
        </div>
      ) : (
        <div className="px-4 mt-4 space-y-3">
          {orders.map((order, i) => {
            const status = statusConfig[order.status] ?? statusConfig.placed;
            const StatusIcon = status.icon;
            const timeAgo = new Date(order.created_at).toLocaleDateString();
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-2xl p-4 border border-border"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display font-semibold text-sm">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{timeAgo}</p>
                  </div>
                  <div className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                  <span className="text-sm font-display font-semibold">${Number(order.total).toFixed(2)}</span>
                  {order.status !== "delivered" && order.status !== "cancelled" && (
                    <span className="text-xs text-primary font-medium">Track Order →</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default OrdersPage;

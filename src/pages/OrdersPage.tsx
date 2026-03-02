import { useCampus } from "@/context/CampusContext";
import BottomNav from "@/components/BottomNav";
import { Navigate } from "react-router-dom";
import { Package, CheckCircle, Clock, Truck, ChefHat } from "lucide-react";
import { motion } from "framer-motion";
import type { OrderStatus } from "@/lib/data";

// Demo orders
const demoOrders = [
  {
    id: "ORD-001",
    vendorName: "Mama's Kitchen",
    items: ["Sadza & Beef Stew", "Rice & Beans"],
    total: 6.0,
    status: "preparing" as OrderStatus,
    time: "12 min ago",
  },
  {
    id: "ORD-002",
    vendorName: "Quick Print Hub",
    items: ["B&W Printing (10 pages)"],
    total: 1.0,
    status: "delivered" as OrderStatus,
    time: "2 hours ago",
  },
];

const statusConfig: Record<OrderStatus, { label: string; icon: React.ElementType; color: string }> = {
  placed: { label: "Order Placed", icon: Package, color: "text-muted-foreground" },
  accepted: { label: "Accepted", icon: CheckCircle, color: "text-primary" },
  preparing: { label: "Preparing", icon: ChefHat, color: "text-warning" },
  picked_up: { label: "On the way", icon: Truck, color: "text-primary" },
  delivered: { label: "Delivered", icon: CheckCircle, color: "text-success" },
};

const OrdersPage = () => {
  const { isSetup } = useCampus();
  if (!isSetup) return <Navigate to="/setup" replace />;

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <h1 className="font-display font-bold text-lg">My Orders</h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
        {demoOrders.map((order, i) => {
          const status = statusConfig[order.status];
          const StatusIcon = status.icon;
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
                  <p className="font-display font-semibold text-sm">{order.vendorName}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{order.id} · {order.time}</p>
                </div>
                <div className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {status.label}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{order.items.join(", ")}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
                <span className="text-sm font-display font-semibold">${order.total.toFixed(2)}</span>
                {order.status !== "delivered" && (
                  <button className="text-xs text-primary font-medium">Track Order →</button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
};

export default OrdersPage;

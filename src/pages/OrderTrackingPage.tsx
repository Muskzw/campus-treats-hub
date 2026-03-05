import { useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Package, CheckCircle, ChefHat, Truck, Home, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

const STEPS = [
  { key: "placed", label: "Order Placed", icon: Package },
  { key: "accepted", label: "Accepted", icon: CheckCircle },
  { key: "preparing", label: "Preparing", icon: ChefHat },
  { key: "picked_up", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Home },
];

const stepIndex = (status: string) => {
  if (status === "cancelled" || status === "rejected") return -1;
  return STEPS.findIndex((s) => s.key === status);
};

const OrderTrackingPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-tracking", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  // Realtime subscription for this specific order
  useEffect(() => {
    if (!id) return;
    const channel = supabase
      .channel(`order-${id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${id}` },
        () => {
          queryClient.invalidateQueries({ queryKey: ["order-tracking", id] });
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [id, queryClient]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) return <Navigate to="/orders" replace />;

  const currentStep = stepIndex(order.status);
  const isCancelled = order.status === "cancelled" || order.status === "rejected";
  const isDelivered = order.status === "delivered";
  const progressPercent = isCancelled ? 0 : isDelivered ? 100 : Math.max(0, ((currentStep + 0.5) / (STEPS.length - 1)) * 100);

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/orders" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-display font-bold text-lg">Track Order</h1>
          <p className="text-xs text-muted-foreground">{order.order_number}</p>
        </div>
      </div>

      <div className="px-4 mt-6">
        {/* Live badge */}
        <div className="flex items-center gap-2 mb-6">
          {!isCancelled && !isDelivered && (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-2.5 h-2.5 rounded-full bg-primary"
            />
          )}
          <span className="text-sm font-semibold text-foreground">
            {isCancelled ? "Order Cancelled" : isDelivered ? "Order Delivered! 🎉" : "Live Tracking"}
          </span>
        </div>

        {/* Progress bar */}
        <Progress value={progressPercent} className="h-2 mb-8" />

        {/* Steps */}
        <div className="space-y-1">
          {STEPS.map((step, i) => {
            const isActive = i <= currentStep && !isCancelled;
            const isCurrent = i === currentStep && !isCancelled && !isDelivered;
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 py-3"
              >
                <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCurrent ? "border-primary bg-primary/10" : isActive ? "border-primary bg-primary" : "border-border bg-card"
                }`}>
                  {isCurrent && (
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      className="absolute inset-0 rounded-full border-2 border-primary/30"
                    />
                  )}
                  <StepIcon className={`w-4 h-4 ${isActive && !isCurrent ? "text-primary-foreground" : isActive ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                  {isCurrent && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-xs text-primary mt-0.5"
                    >
                      In progress...
                    </motion.p>
                  )}
                </div>
                {isActive && <CheckCircle className="w-4 h-4 text-primary" />}
              </motion.div>
            );
          })}

          {isCancelled && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 py-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 border-destructive bg-destructive/10">
                <XCircle className="w-4 h-4 text-destructive" />
              </div>
              <p className="text-sm font-semibold text-destructive">Order was {order.status}</p>
            </motion.div>
          )}
        </div>

        {/* Order details */}
        <div className="mt-8 bg-card rounded-2xl p-4 border border-border space-y-3">
          <h3 className="font-display font-semibold text-sm">Order Details</h3>
          {(order as any).order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{item.quantity}x {item.product_name}</span>
              <span className="font-medium">${Number(item.total_price).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Delivery fee</span>
            <span>${Number(order.delivery_fee).toFixed(2)}</span>
          </div>
          {order.tip && Number(order.tip) > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tip</span>
              <span>${Number(order.tip).toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-border pt-2 flex justify-between font-display font-bold">
            <span>Total</span>
            <span className="text-primary">${Number(order.total).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTrackingPage;

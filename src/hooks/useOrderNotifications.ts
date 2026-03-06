import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = {
  accepted: "Your order has been accepted! 🎉",
  preparing: "Your order is being prepared 🍳",
  picked_up: "Your order is on the way! 🚴",
  delivered: "Your order has been delivered! ✅",
  cancelled: "Your order was cancelled ❌",
  rejected: "Your order was rejected ❌",
};

const VENDOR_STATUS_LABELS: Record<string, string> = {
  placed: "New order received! 🔔",
};

export function requestNotificationPermission() {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    Notification.requestPermission();
  }
}

function showBrowserNotification(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try {
    new Notification(title, { body, icon: "/favicon.ico" });
  } catch {
    // Silent fail on unsupported environments
  }
}

/**
 * Subscribe to order status changes for a customer and show notifications.
 */
export function useCustomerOrderNotifications(userId: string | undefined) {
  const prevStatuses = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`customer-notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${userId}`,
        },
        (payload) => {
          const newStatus = (payload.new as any).status;
          const orderId = (payload.new as any).id;
          const orderNumber = (payload.new as any).order_number;
          const oldStatus = prevStatuses.current.get(orderId);

          if (oldStatus !== newStatus && STATUS_LABELS[newStatus]) {
            const message = STATUS_LABELS[newStatus];
            toast.info(message, { description: `Order ${orderNumber}` });
            showBrowserNotification("CampusTreats", `${message} (${orderNumber})`);
          }
          prevStatuses.current.set(orderId, newStatus);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}

/**
 * Subscribe to new orders for a vendor and show notifications.
 */
export function useVendorOrderNotifications(vendorId: string | undefined) {
  useEffect(() => {
    if (!vendorId) return;

    const channel = supabase
      .channel(`vendor-notifications-${vendorId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `vendor_id=eq.${vendorId}`,
        },
        (payload) => {
          const orderNumber = (payload.new as any).order_number;
          const message = VENDOR_STATUS_LABELS.placed;
          toast.info(message, { description: `Order ${orderNumber}` });
          showBrowserNotification("CampusTreats Vendor", `${message} (${orderNumber})`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [vendorId]);
}

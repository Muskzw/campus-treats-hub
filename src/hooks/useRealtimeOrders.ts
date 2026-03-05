import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Subscribes to realtime order changes and invalidates relevant queries.
 * @param queryKeys - array of query key prefixes to invalidate on change
 * @param filterColumn - optional column to filter on (e.g. "customer_id" or "vendor_id")
 * @param filterValue - value for the filter column
 */
export function useRealtimeOrders(
  queryKeys: string[][],
  filterColumn?: string,
  filterValue?: string
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const filter = filterColumn && filterValue ? `${filterColumn}=eq.${filterValue}` : undefined;

    const channel = supabase
      .channel(`orders-realtime-${filterColumn}-${filterValue}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          ...(filter ? { filter } : {}),
        },
        () => {
          queryKeys.forEach((key) => {
            queryClient.invalidateQueries({ queryKey: key });
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, filterColumn, filterValue, JSON.stringify(queryKeys)]);
}

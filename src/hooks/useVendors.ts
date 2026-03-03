import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type DbVendor = {
  id: string;
  name: string;
  description: string | null;
  rating: number | null;
  delivery_time: string | null;
  delivery_fee: number | null;
  category: string;
  campus_id: string;
  image_url: string | null;
  logo_url: string | null;
  is_approved: boolean | null;
  user_id: string;
};

export type DbProduct = {
  id: string;
  vendor_id: string;
  name: string;
  price: number;
  description: string | null;
  image_url: string | null;
  prep_time: string | null;
  in_stock: boolean | null;
};

export const useVendors = (campusId: string | null) => {
  return useQuery({
    queryKey: ["vendors", campusId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("campus_id", campusId!)
        .eq("is_approved", true);
      if (error) throw error;
      return data as DbVendor[];
    },
    enabled: !!campusId,
  });
};

export const useVendor = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: ["vendor", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", vendorId!)
        .single();
      if (error) throw error;
      return data as DbVendor;
    },
    enabled: !!vendorId,
  });
};

export const useVendorProducts = (vendorId: string | undefined) => {
  return useQuery({
    queryKey: ["products", vendorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", vendorId!);
      if (error) throw error;
      return data as DbProduct[];
    },
    enabled: !!vendorId,
  });
};

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import { useVendorOrderNotifications, requestNotificationPermission } from "@/hooks/useOrderNotifications";
import { toast } from "sonner";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft, Plus, Package, ShoppingCart, DollarSign, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ImageUpload from "@/components/ImageUpload";

const VendorDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: "", price: "", description: "", prep_time: "", image_url: "" });

  // Get vendor for this user
  const { data: vendor, isLoading: vendorLoading } = useQuery({
    queryKey: ["my-vendor", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Get products
  const { data: products = [] } = useQuery({
    queryKey: ["my-products", vendor?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("vendor_id", vendor!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!vendor,
  });

  // Get orders
  const { data: orders = [] } = useQuery({
    queryKey: ["vendor-orders", vendor?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("vendor_id", vendor!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!vendor,
  });

  useRealtimeOrders([["vendor-orders", vendor?.id ?? ""]], "vendor_id", vendor?.id);
  useVendorOrderNotifications(vendor?.id);

  useEffect(() => {
    requestNotificationPermission();
  }, []);

  const addProductMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("products").insert({
        vendor_id: vendor!.id,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        description: newProduct.description || null,
        prep_time: newProduct.prep_time || null,
        image_url: newProduct.image_url || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      setNewProduct({ name: "", price: "", description: "", prep_time: "", image_url: "" });
      setShowAddProduct(false);
      toast.success("Product added!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const toggleStockMutation = useMutation({
    mutationFn: async ({ id, in_stock }: { id: string; in_stock: boolean }) => {
      const { error } = await supabase.from("products").update({ in_stock }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-products"] }),
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      toast.success("Product deleted");
    },
  });

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vendor-orders"] });
      toast.success("Order updated");
    },
  });

  if (vendorLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!vendor) return <Navigate to="/vendor-register" replace />;

  const totalEarnings = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + Number(o.subtotal), 0);
  const pendingOrders = orders.filter((o) => o.status === "placed" || o.status === "accepted");

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-display font-bold text-lg">Vendor Dashboard</h1>
      </div>

      {!vendor.is_approved && (
        <div className="mx-4 mt-4 p-3 rounded-xl bg-accent border border-border text-center">
          <p className="text-sm font-medium text-accent-foreground">⏳ Your vendor account is pending approval</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        {[
          { icon: Package, label: "Products", value: products.length },
          { icon: ShoppingCart, label: "Orders", value: orders.length },
          { icon: DollarSign, label: "Earned", value: `$${totalEarnings.toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-3 border border-border text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-display font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Pending Orders */}
      {pendingOrders.length > 0 && (
        <div className="px-4 mt-6">
          <h2 className="font-display font-semibold text-sm mb-3">Pending Orders</h2>
          <div className="space-y-3">
            {pendingOrders.map((order) => (
              <div key={order.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-semibold text-sm">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {(order as any).order_items?.map((i: any) => `${i.quantity}x ${i.product_name}`).join(", ")}
                    </p>
                    <p className="text-xs text-muted-foreground">Room: {order.room_number}</p>
                  </div>
                  <span className="font-display font-bold text-primary">${Number(order.total).toFixed(2)}</span>
                </div>
                <div className="flex gap-2 mt-3">
                  {order.status === "placed" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus.mutate({ id: order.id, status: "accepted" })}
                        className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateOrderStatus.mutate({ id: order.id, status: "rejected" })}
                        className="flex-1 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-semibold"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {order.status === "accepted" && (
                    <button
                      onClick={() => updateOrderStatus.mutate({ id: order.id, status: "preparing" })}
                      className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
                    >
                      Start Preparing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-sm">Your Products</h2>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {showAddProduct && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="bg-card rounded-2xl p-4 border border-border mb-4 space-y-3">
            <div><Label className="text-xs">Name</Label><Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Product name" /></div>
            <div><Label className="text-xs">Price ($)</Label><Input type="number" step="0.01" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" /></div>
            <div><Label className="text-xs">Description</Label><Textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Short description" /></div>
            <div><Label className="text-xs">Prep Time</Label><Input value={newProduct.prep_time} onChange={(e) => setNewProduct({ ...newProduct, prep_time: e.target.value })} placeholder="e.g. 15 min" /></div>
            <div>
              <Label className="text-xs">Product Image</Label>
              <div className="mt-1">
                <ImageUpload
                  currentUrl={newProduct.image_url}
                  onUpload={(url) => setNewProduct({ ...newProduct, image_url: url })}
                  folder="products"
                  size="md"
                  placeholder="Upload photo"
                />
              </div>
            </div>
            <button
              onClick={() => addProductMutation.mutate()}
              disabled={!newProduct.name || !newProduct.price || addProductMutation.isPending}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
            >
              {addProductMutation.isPending ? "Adding..." : "Add Product"}
            </button>
          </motion.div>
        )}

        <div className="space-y-2">
          {products.map((p) => (
            <div key={p.id} className="flex items-center gap-3 bg-card rounded-xl p-3 border border-border">
              <img src={p.image_url || "/placeholder.svg"} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.name}</p>
                <p className="text-xs text-primary font-bold">${Number(p.price).toFixed(2)}</p>
              </div>
              <button onClick={() => toggleStockMutation.mutate({ id: p.id, in_stock: !p.in_stock })}>
                {p.in_stock ? <ToggleRight className="w-6 h-6 text-primary" /> : <ToggleLeft className="w-6 h-6 text-muted-foreground" />}
              </button>
              <button onClick={() => deleteProductMutation.mutate(p.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;

import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, Store, ShoppingCart, Users, Check, X, TrendingUp } from "lucide-react";
import { useState } from "react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"vendors" | "orders" | "analytics">("vendors");

  // Check admin role
  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });

  // All vendors (admin can see all)
  const { data: vendors = [] } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // All orders
  const { data: orders = [] } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(50);
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  const approveVendor = useMutation({
    mutationFn: async ({ id, approved }: { id: string; approved: boolean }) => {
      const { error } = await supabase.from("vendors").update({ is_approved: approved }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-vendors"] });
      toast.success("Vendor updated");
    },
  });

  if (roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <X className="w-16 h-16 text-destructive mb-4" />
        <h1 className="font-display font-bold text-xl">Access Denied</h1>
        <p className="text-sm text-muted-foreground mt-2">You don't have admin privileges.</p>
        <Link to="/" className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">Go Home</Link>
      </div>
    );
  }

  const pendingVendors = vendors.filter((v) => !v.is_approved);
  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-display font-bold text-lg">Admin Dashboard</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-4">
        {[
          { icon: Store, label: "Vendors", value: vendors.length },
          { icon: ShoppingCart, label: "Orders", value: orders.length },
          { icon: TrendingUp, label: "Revenue", value: `$${totalRevenue.toFixed(2)}` },
        ].map((s) => (
          <div key={s.label} className="bg-card rounded-2xl p-3 border border-border text-center">
            <s.icon className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-lg font-display font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mt-5">
        {(["vendors", "orders", "analytics"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground"}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <div className="px-4 mt-4">
        {tab === "vendors" && (
          <div className="space-y-3">
            {pendingVendors.length > 0 && (
              <p className="text-xs font-semibold text-primary">{pendingVendors.length} pending approval</p>
            )}
            {vendors.map((v) => (
              <div key={v.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display font-semibold text-sm">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.category} · {v.campus_id}</p>
                    <p className={`text-xs mt-1 font-medium ${v.is_approved ? "text-primary" : "text-accent-foreground"}`}>
                      {v.is_approved ? "✅ Approved" : "⏳ Pending"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!v.is_approved && (
                      <button onClick={() => approveVendor.mutate({ id: v.id, approved: true })} className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {v.is_approved && (
                      <button onClick={() => approveVendor.mutate({ id: v.id, approved: false })} className="w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "orders" && (
          <div className="space-y-3">
            {orders.map((o) => (
              <div key={o.id} className="bg-card rounded-2xl p-4 border border-border">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-display font-semibold text-sm">{o.order_number}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">Room: {o.room_number} · {o.hostel_id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-bold text-primary">${Number(o.total).toFixed(2)}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      o.status === "delivered" ? "bg-primary/10 text-primary" :
                      o.status === "placed" ? "bg-accent text-accent-foreground" :
                      "bg-secondary text-secondary-foreground"
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "analytics" && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl p-5 border border-border">
              <h3 className="font-display font-semibold text-sm mb-3">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Total Vendors</span><span className="font-semibold">{vendors.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Approved</span><span className="font-semibold">{vendors.filter(v => v.is_approved).length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Orders</span><span className="font-semibold">{orders.length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Delivered</span><span className="font-semibold">{orders.filter(o => o.status === "delivered").length}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Revenue</span><span className="font-semibold text-primary">${totalRevenue.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Platform Commission (7%)</span><span className="font-semibold text-primary">${(totalRevenue * 0.07).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

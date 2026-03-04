import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Store, ShoppingCart, Users, Check, X, TrendingUp,
  Shield, UserCheck, UserX, ChevronDown, Search, Package
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type TabType = "vendors" | "orders" | "users" | "analytics";

const AdminDashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<TabType>("vendors");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: isAdmin, isLoading: roleLoading } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user,
  });

  // All vendors
  const { data: vendors = [], isLoading: vendorsLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendors").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // All orders
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // All profiles with roles
  const { data: profiles = [], isLoading: profilesLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: isAdmin === true,
  });

  // All user roles
  const { data: userRoles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
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

  const updateOrderStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated");
    },
  });

  const changeRole = useMutation({
    mutationFn: async ({ userId, role, action }: { userId: string; role: string; action: "add" | "remove" }) => {
      if (action === "add") {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: role as any });
        if (error && !error.message.includes("duplicate")) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role as any);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role updated");
    },
    onError: (err: any) => toast.error(err.message),
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
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Shield className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="font-display font-bold text-xl">Access Denied</h1>
        <p className="text-sm text-muted-foreground mt-2">You don't have admin privileges.</p>
        <Link to="/" className="mt-6 px-8 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-semibold">
          Go Home
        </Link>
      </div>
    );
  }

  const pendingVendors = vendors.filter((v) => !v.is_approved);
  const approvedVendors = vendors.filter((v) => v.is_approved);
  const totalRevenue = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + Number(o.total), 0);
  const commission = totalRevenue * 0.07;

  const getUserRoles = (userId: string) => userRoles.filter((r) => r.user_id === userId).map((r) => r.role);

  const filteredProfiles = profiles.filter(
    (p) =>
      !searchQuery ||
      (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.user_id.includes(searchQuery)
  );

  const tabItems: { key: TabType; label: string; icon: React.ElementType; badge?: number }[] = [
    { key: "vendors", label: "Vendors", icon: Store, badge: pendingVendors.length || undefined },
    { key: "orders", label: "Orders", icon: ShoppingCart },
    { key: "users", label: "Users", icon: Users },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <div className="min-h-screen bg-background pb-6">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <Link to="/" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-display font-bold text-lg">Admin Dashboard</h1>
            <p className="text-xs text-muted-foreground">Manage your platform</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 px-4 mt-4">
        {[
          { icon: Users, label: "Total Users", value: profiles.length, color: "text-primary" },
          { icon: Store, label: "Vendors", value: `${approvedVendors.length}/${vendors.length}`, color: "text-primary" },
          { icon: ShoppingCart, label: "Orders", value: orders.length, color: "text-primary" },
          { icon: TrendingUp, label: "Revenue", value: `$${totalRevenue.toFixed(0)}`, color: "text-success" },
        ].map((s) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-4 border border-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`w-4 h-4 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className="text-2xl font-display font-bold">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 mt-5 overflow-x-auto pb-1 scrollbar-none">
        {tabItems.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
              tab === t.key
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <t.icon className="w-3.5 h-3.5" />
            {t.label}
            {t.badge && (
              <span className="ml-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="px-4 mt-4"
        >
          {/* VENDORS TAB */}
          {tab === "vendors" && (
            <div className="space-y-3">
              {vendorsLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : vendors.length === 0 ? (
                <div className="text-center py-12">
                  <Store className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No vendors registered yet</p>
                </div>
              ) : (
                <>
                  {pendingVendors.length > 0 && (
                    <div className="bg-accent rounded-xl px-3 py-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-warning animate-pulse" />
                      <p className="text-xs font-semibold text-accent-foreground">
                        {pendingVendors.length} vendor{pendingVendors.length > 1 ? "s" : ""} awaiting approval
                      </p>
                    </div>
                  )}
                  {vendors.map((v) => (
                    <div key={v.id} className="bg-card rounded-2xl p-4 border border-border">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {v.image_url ? (
                            <img src={v.image_url} alt={v.name} className="w-12 h-12 rounded-xl object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
                              <Store className="w-5 h-5 text-accent-foreground" />
                            </div>
                          )}
                          <div>
                            <p className="font-display font-semibold text-sm">{v.name}</p>
                            <p className="text-xs text-muted-foreground">{v.category} · {v.campus_id}</p>
                            <span
                              className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                v.is_approved
                                  ? "bg-success/10 text-success"
                                  : "bg-warning/10 text-warning"
                              }`}
                            >
                              {v.is_approved ? "Approved" : "Pending"}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          {!v.is_approved && (
                            <button
                              onClick={() => approveVendor.mutate({ id: v.id, approved: true })}
                              className="w-9 h-9 rounded-xl bg-success/10 text-success flex items-center justify-center hover:bg-success/20 transition-colors"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          {v.is_approved && (
                            <button
                              onClick={() => approveVendor.mutate({ id: v.id, approved: false })}
                              className="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* ORDERS TAB */}
          {tab === "orders" && (
            <div className="space-y-3">
              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No orders yet</p>
                </div>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="bg-card rounded-2xl p-4 border border-border">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-display font-semibold text-sm">{o.order_number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(o.created_at).toLocaleDateString()} · Room {o.room_number}
                        </p>
                        <p className="text-xs text-muted-foreground">{o.hostel_id} · {o.campus_id}</p>
                      </div>
                      <p className="font-display font-bold text-primary text-lg">${Number(o.total).toFixed(2)}</p>
                    </div>
                    {/* Items */}
                    {(o as any).order_items?.length > 0 && (
                      <div className="text-xs text-muted-foreground mb-3 bg-muted/50 rounded-lg p-2">
                        {(o as any).order_items.map((item: any) => (
                          <span key={item.id} className="block">
                            {item.quantity}x {item.product_name} — ${Number(item.total_price).toFixed(2)}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <StatusBadge status={o.status} />
                      <select
                        value={o.status}
                        onChange={(e) => updateOrderStatus.mutate({ id: o.id, status: e.target.value })}
                        className="text-xs bg-muted border border-border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/50"
                      >
                        {["placed", "accepted", "preparing", "picked_up", "delivered", "cancelled"].map((s) => (
                          <option key={s} value={s}>{s.replace("_", " ")}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* USERS TAB */}
          {tab === "users" && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              {profilesLoading ? (
                <div className="flex justify-center py-12">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredProfiles.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No users found</p>
                </div>
              ) : (
                filteredProfiles.map((p) => {
                  const roles = getUserRoles(p.user_id);
                  return (
                    <div key={p.id} className="bg-card rounded-2xl p-4 border border-border">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-display font-semibold text-sm">{p.full_name || "No name"}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {p.campus_id || "No campus"} · {p.hostel_id || "No hostel"}
                          </p>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {roles.map((r) => (
                              <span
                                key={r}
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  r === "admin"
                                    ? "bg-destructive/10 text-destructive"
                                    : r === "vendor"
                                    ? "bg-primary/10 text-primary"
                                    : r === "rider"
                                    ? "bg-warning/10 text-warning"
                                    : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        </div>
                        <RoleDropdown
                          userId={p.user_id}
                          currentRoles={roles}
                          onToggle={(role, action) => changeRole.mutate({ userId: p.user_id, role, action })}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ANALYTICS TAB */}
          {tab === "analytics" && (
            <div className="space-y-4">
              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="font-display font-semibold text-sm mb-4">Platform Summary</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Users", value: profiles.length },
                    { label: "Total Vendors", value: vendors.length },
                    { label: "Approved Vendors", value: approvedVendors.length },
                    { label: "Pending Vendors", value: pendingVendors.length },
                    { label: "Total Orders", value: orders.length },
                    { label: "Delivered Orders", value: orders.filter((o) => o.status === "delivered").length },
                    { label: "Cancelled Orders", value: orders.filter((o) => o.status === "cancelled").length },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className="text-sm font-display font-bold">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-card rounded-2xl p-5 border border-border">
                <h3 className="font-display font-semibold text-sm mb-4">Revenue</h3>
                <div className="space-y-3">
                  {[
                    { label: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, highlight: true },
                    { label: "Platform Commission (7%)", value: `$${commission.toFixed(2)}`, highlight: true },
                    { label: "Total Delivery Fees", value: `$${orders.reduce((s, o) => s + Number(o.delivery_fee), 0).toFixed(2)}` },
                    { label: "Total Tips", value: `$${orders.reduce((s, o) => s + Number(o.tip || 0), 0).toFixed(2)}` },
                    { label: "Avg Order Value", value: orders.length ? `$${(totalRevenue / orders.filter((o) => o.status === "delivered").length || 1).toFixed(2)}` : "$0.00" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{row.label}</span>
                      <span className={`text-sm font-display font-bold ${row.highlight ? "text-primary" : ""}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Sub-components
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    placed: "bg-muted text-muted-foreground",
    accepted: "bg-primary/10 text-primary",
    preparing: "bg-warning/10 text-warning",
    picked_up: "bg-primary/10 text-primary",
    delivered: "bg-success/10 text-success",
    cancelled: "bg-destructive/10 text-destructive",
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${colors[status] || colors.placed}`}>
      {status.replace("_", " ")}
    </span>
  );
};

const RoleDropdown = ({
  userId,
  currentRoles,
  onToggle,
}: {
  userId: string;
  currentRoles: string[];
  onToggle: (role: string, action: "add" | "remove") => void;
}) => {
  const [open, setOpen] = useState(false);
  const allRoles = ["student", "vendor", "rider", "admin"];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-xs font-medium hover:bg-accent transition-colors"
      >
        Roles <ChevronDown className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 w-36 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
          {allRoles.map((role) => {
            const hasRole = currentRoles.includes(role);
            return (
              <button
                key={role}
                onClick={() => {
                  onToggle(role, hasRole ? "remove" : "add");
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2.5 text-xs hover:bg-accent transition-colors"
              >
                <span className="capitalize font-medium">{role}</span>
                {hasRole ? (
                  <UserX className="w-3.5 h-3.5 text-destructive" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-success" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

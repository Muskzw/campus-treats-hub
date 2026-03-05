import { useCampus } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { campuses, hostels } from "@/lib/data";
import BottomNav from "@/components/BottomNav";
import { Navigate, Link, useNavigate } from "react-router-dom";
import {
  User, MapPin, LogOut, ChevronRight, Store, Shield,
  Phone, Pencil, Check, X, ShoppingCart
} from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import ImageUpload from "@/components/ImageUpload";

const ProfilePage = () => {
  const { isSetup, campusId, hostelId, roomNumber, loading } = useCampus();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: isVendor } = useQuery({
    queryKey: ["is-vendor", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("vendors").select("id").eq("user_id", user!.id).maybeSingle();
      return !!data;
    },
    enabled: !!user,
  });

  const { data: isAdmin } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("has_role", { _user_id: user!.id, _role: "admin" });
      return data as boolean;
    },
    enabled: !!user,
  });

  const { data: userRoles = [] } = useQuery({
    queryKey: ["my-roles", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id);
      return data?.map((r) => r.role) || [];
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: editName, phone: editPhone })
        .eq("user_id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setEditing(false);
      toast.success("Profile updated");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSetup) return <Navigate to="/setup" replace />;

  const campus = campuses.find((c) => c.id === campusId);
  const hostel = hostels[campusId!]?.find((h) => h.id === hostelId);

  const handleLogout = async () => {
    await signOut();
    navigate("/auth");
  };

  const startEditing = () => {
    setEditName(profile?.full_name || user?.user_metadata?.full_name || "");
    setEditPhone(profile?.phone || "");
    setEditing(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <h1 className="font-display font-bold text-lg">Profile</h1>
        {!editing && (
          <button onClick={startEditing} className="flex items-center gap-1 text-xs text-primary font-semibold">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-4 mt-4 bg-card rounded-2xl p-5 border border-border"
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0">
            {editing ? (
              <ImageUpload
                currentUrl={profile?.avatar_url}
                onUpload={async (url) => {
                  await supabase.from("profiles").update({ avatar_url: url }).eq("user_id", user!.id);
                  queryClient.invalidateQueries({ queryKey: ["profile"] });
                }}
                folder="avatars"
                shape="circle"
                size="sm"
              />
            ) : profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Avatar" className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
                <User className="w-8 h-8 text-accent-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Full name"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="Phone number"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateProfile.mutate()}
                    disabled={updateProfile.isPending}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold"
                  >
                    <Check className="w-3 h-3" /> Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold"
                  >
                    <X className="w-3 h-3" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display font-bold text-lg truncate">
                  {profile?.full_name || user?.user_metadata?.full_name || "Student"}
                </h2>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                {profile?.phone && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" /> {profile.phone}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Role badges */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {userRoles.map((role) => (
            <span
              key={role}
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                role === "admin"
                  ? "bg-destructive/10 text-destructive"
                  : role === "vendor"
                  ? "bg-primary/10 text-primary"
                  : role === "rider"
                  ? "bg-warning/10 text-warning"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {role}
            </span>
          ))}
        </div>

        {!editing && (
          <p className="text-xs text-muted-foreground mt-2">
            📍 {campus?.name} · {hostel?.name} · {roomNumber}
          </p>
        )}
      </motion.div>

      {/* Menu Items */}
      <div className="mx-4 mt-4 bg-card rounded-2xl border border-border overflow-hidden">
        <Link
          to="/setup"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors border-b border-border"
        >
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Edit Delivery Location</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>

        <Link
          to="/orders"
          className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors border-b border-border"
        >
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">Order History</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>

        <Link
          to={isVendor ? "/vendor-dashboard" : "/vendor-register"}
          className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors border-b border-border"
        >
          <div className="flex items-center gap-3">
            <Store className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">{isVendor ? "Vendor Dashboard" : "Become a Vendor"}</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </Link>

        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors border-b border-border"
          >
            <div className="flex items-center gap-3">
              <Shield className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Admin Dashboard</span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-accent/50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-destructive" />
            <span className="text-sm font-medium text-destructive">Log Out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;

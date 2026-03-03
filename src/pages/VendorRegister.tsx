import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { campuses, categories } from "@/lib/data";

const VendorRegister = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    category: "food",
    campus_id: "uz",
    delivery_fee: "1.00",
    delivery_time: "20-30 min",
    image_url: "",
  });

  const handleSubmit = async () => {
    if (!user || !form.name.trim()) return;
    setLoading(true);
    try {
      // Add vendor role
      const { error: roleError } = await supabase.from("user_roles").insert({ user_id: user.id, role: "vendor" as any });
      // Ignore duplicate role error
      if (roleError && !roleError.message.includes("duplicate")) throw roleError;

      const { error } = await supabase.from("vendors").insert({
        user_id: user.id,
        name: form.name.trim(),
        description: form.description.trim() || null,
        category: form.category,
        campus_id: form.campus_id,
        delivery_fee: parseFloat(form.delivery_fee) || 0,
        delivery_time: form.delivery_time || null,
        image_url: form.image_url || null,
      });
      if (error) throw error;

      toast.success("Vendor registered! 🎉", { description: "Awaiting admin approval." });
      navigate("/vendor-dashboard");
    } catch (err: any) {
      toast.error("Registration failed", { description: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-6">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3 flex items-center gap-3">
        <Link to="/profile" className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="font-display font-bold text-lg">Register as Vendor</h1>
      </div>

      <div className="px-4 mt-6">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-accent flex items-center justify-center">
            <Store className="w-8 h-8 text-accent-foreground" />
          </div>
        </div>

        <div className="space-y-4">
          <div><Label>Business Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mama's Kitchen" /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What do you sell?" /></div>
          <div>
            <Label>Category</Label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-md border border-input bg-background text-sm">
              {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </div>
          <div>
            <Label>Campus</Label>
            <select value={form.campus_id} onChange={(e) => setForm({ ...form, campus_id: e.target.value })} className="w-full mt-1 px-3 py-2.5 rounded-md border border-input bg-background text-sm">
              {campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><Label>Delivery Fee ($)</Label><Input type="number" step="0.01" value={form.delivery_fee} onChange={(e) => setForm({ ...form, delivery_fee: e.target.value })} /></div>
          <div><Label>Delivery Time</Label><Input value={form.delivery_time} onChange={(e) => setForm({ ...form, delivery_time: e.target.value })} placeholder="e.g. 20-30 min" /></div>
          <div><Label>Cover Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>

          <button
            onClick={handleSubmit}
            disabled={loading || !form.name.trim()}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register Business"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VendorRegister;

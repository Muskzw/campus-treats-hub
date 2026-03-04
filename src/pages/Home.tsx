import { useState } from "react";
import { useCampus } from "@/context/CampusContext";
import { useAuth } from "@/context/AuthContext";
import { useVendors } from "@/hooks/useVendors";
import { campuses, hostels } from "@/lib/data";
import CategoryRow from "@/components/CategoryRow";
import VendorCard from "@/components/VendorCard";
import BottomNav from "@/components/BottomNav";
import { MapPin, Search, Bell, Sparkles } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const { campusId, hostelId, isSetup, loading } = useCampus();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { data: vendors = [], isLoading: vendorsLoading } = useVendors(campusId);

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
  const firstName = (user?.user_metadata?.full_name || "").split(" ")[0] || "there";

  const filtered = vendors
    .filter((v) => !selectedCategory || v.category === selectedCategory)
    .filter((v) => !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/setup" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Delivering to</p>
              <p className="text-sm font-semibold font-display">{hostel?.name}</p>
            </div>
          </Link>
          <button className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mt-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-2xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
          />
        </div>
      </div>

      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 mt-4 p-5 rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-20 h-20 bg-primary-foreground/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4" />
            <span className="text-xs font-medium opacity-90">Welcome back</span>
          </div>
          <h2 className="font-display font-bold text-xl">Hey {firstName}! 👋</h2>
          <p className="text-sm opacity-90 mt-1">Order from {campus?.name} vendors, delivered to your room</p>
        </div>
      </motion.div>

      {/* Categories */}
      <div className="mt-5">
        <h3 className="px-4 font-display font-semibold text-sm mb-3">Categories</h3>
        <CategoryRow selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Vendors */}
      <div className="mt-5 px-4">
        <h3 className="font-display font-semibold text-sm mb-3">
          {selectedCategory
            ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} vendors`
            : "Popular near you"}
        </h3>
        {vendorsLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-3">
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No vendors found</p>
            <p className="text-xs text-muted-foreground mt-1">Try a different category or search term</p>
          </motion.div>
        ) : (
          <div className="grid gap-3">
            {filtered.map((v, i) => (
              <VendorCard key={v.id} vendor={v} index={i} />
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Home;

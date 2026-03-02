import { useState } from "react";
import { useCampus } from "@/context/CampusContext";
import { vendors, campuses, hostels } from "@/lib/data";
import CategoryRow from "@/components/CategoryRow";
import VendorCard from "@/components/VendorCard";
import BottomNav from "@/components/BottomNav";
import { MapPin, Search, Bell } from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import { motion } from "framer-motion";

const Home = () => {
  const { campusId, hostelId, isSetup, loading } = useCampus();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const filtered = vendors
    .filter((v) => v.campus === campusId)
    .filter((v) => !selectedCategory || v.category === selectedCategory)
    .filter((v) => !searchQuery || v.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Link to="/setup" className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            <div>
              <p className="text-xs text-muted-foreground">Delivering to</p>
              <p className="text-sm font-semibold font-display">{hostel?.name}</p>
            </div>
          </Link>
          <button className="w-9 h-9 rounded-full bg-card border border-border flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="px-4 mt-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vendors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-4 mt-4 p-4 rounded-2xl bg-primary text-primary-foreground"
      >
        <h2 className="font-display font-bold text-lg">Welcome to {campus?.name} 🎓</h2>
        <p className="text-sm opacity-90 mt-1">Order from campus vendors, delivered to your room</p>
      </motion.div>

      <div className="mt-5">
        <h3 className="px-4 font-display font-semibold text-sm mb-3">Categories</h3>
        <CategoryRow selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <div className="mt-5 px-4">
        <h3 className="font-display font-semibold text-sm mb-3">
          {selectedCategory ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} vendors` : "Popular near you"}
        </h3>
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">
            No vendors found. Try a different category or search.
          </div>
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

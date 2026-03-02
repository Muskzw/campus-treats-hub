import { useState } from "react";
import { useCampus } from "@/context/CampusContext";
import { vendors } from "@/lib/data";
import VendorCard from "@/components/VendorCard";
import CategoryRow from "@/components/CategoryRow";
import BottomNav from "@/components/BottomNav";
import { Navigate } from "react-router-dom";
import { Search } from "lucide-react";

const ExplorePage = () => {
  const { isSetup, campusId } = useCampus();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  if (!isSetup) return <Navigate to="/setup" replace />;

  const filtered = vendors
    .filter((v) => v.campus === campusId)
    .filter((v) => !selectedCategory || v.category === selectedCategory)
    .filter((v) => !query || v.name.toLowerCase().includes(query.toLowerCase()) || v.description.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <h1 className="font-display font-bold text-lg mb-3">Explore</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search vendors or products..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-card border border-border text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      <div className="mt-4">
        <CategoryRow selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      <div className="px-4 mt-4 grid gap-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No results found</div>
        ) : (
          filtered.map((v, i) => <VendorCard key={v.id} vendor={v} index={i} />)
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ExplorePage;

import { useParams, Navigate, Link } from "react-router-dom";
import { vendors, products } from "@/lib/data";
import { useCampus } from "@/context/CampusContext";
import ProductCard from "@/components/ProductCard";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Star, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";

const VendorPage = () => {
  const { id } = useParams<{ id: string }>();
  const { isSetup } = useCampus();

  if (!isSetup) return <Navigate to="/setup" replace />;

  const vendor = vendors.find((v) => v.id === id);
  if (!vendor) return <Navigate to="/" replace />;

  const vendorProducts = products.filter((p) => p.vendorId === vendor.id);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Image */}
      <div className="relative h-48">
        <img src={vendor.image} alt={vendor.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
        <Link
          to="/"
          className="absolute top-4 left-4 w-9 h-9 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center border border-border"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Vendor Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="px-4 -mt-6 relative"
      >
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm">
          <h1 className="font-display font-bold text-xl">{vendor.name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{vendor.description}</p>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-primary text-primary" /> {vendor.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" /> {vendor.deliveryTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-primary" /> ${vendor.deliveryFee.toFixed(2)} delivery
            </span>
          </div>
        </div>
      </motion.div>

      {/* Products */}
      <div className="px-4 mt-5">
        <h2 className="font-display font-semibold text-sm mb-3">Menu</h2>
        <div className="space-y-3">
          {vendorProducts.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default VendorPage;

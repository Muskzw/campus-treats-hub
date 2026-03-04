import { DbVendor } from "@/hooks/useVendors";
import { Star, Clock, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

type Props = {
  vendor: DbVendor;
  index: number;
};

const VendorCard = ({ vendor, index }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
    >
      <Link
        to={`/vendor/${vendor.id}`}
        className="block bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 transition-all hover:shadow-md group"
      >
        <div className="relative h-40 overflow-hidden">
          <img
            src={vendor.image_url || "/placeholder.svg"}
            alt={vendor.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent" />
          
          {/* Overlay info */}
          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
            <div>
              <h3 className="font-display font-bold text-base text-card">{vendor.name}</h3>
              <p className="text-xs text-card/80 line-clamp-1">{vendor.description}</p>
            </div>
            <div className="flex items-center gap-1 bg-card/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-xs font-bold">{vendor.rating ?? 0}</span>
            </div>
          </div>
        </div>
        
        <div className="px-3 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-primary" />
              {vendor.delivery_time || "20-30 min"}
            </span>
            <span className="flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-primary" />
              ${(vendor.delivery_fee ?? 0).toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {vendor.category}
          </span>
        </div>
      </Link>
    </motion.div>
  );
};

export default VendorCard;

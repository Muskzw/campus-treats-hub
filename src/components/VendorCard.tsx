import { DbVendor } from "@/hooks/useVendors";
import { Star, Clock } from "lucide-react";
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
      transition={{ delay: index * 0.08, duration: 0.4 }}
    >
      <Link
        to={`/vendor/${vendor.id}`}
        className="block bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border"
      >
        <div className="relative h-36 overflow-hidden">
          <img
            src={vendor.image_url || "/placeholder.svg"}
            alt={vendor.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm rounded-full px-2.5 py-1 flex items-center gap-1 text-xs font-medium">
            <Clock className="w-3 h-3 text-primary" />
            {vendor.delivery_time || "20-30 min"}
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-display font-semibold text-sm">{vendor.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{vendor.description}</p>
            </div>
            <div className="flex items-center gap-0.5 bg-accent rounded-full px-2 py-0.5">
              <Star className="w-3 h-3 fill-primary text-primary" />
              <span className="text-xs font-semibold text-accent-foreground">{vendor.rating ?? 0}</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Delivery: ${(vendor.delivery_fee ?? 0).toFixed(2)}
          </p>
        </div>
      </Link>
    </motion.div>
  );
};

export default VendorCard;

import { DbProduct } from "@/hooks/useVendors";
import { useCart } from "@/context/CartContext";
import { Plus, Minus } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  product: DbProduct;
  index: number;
};

const ProductCard = ({ product, index }: Props) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="flex gap-3 bg-card rounded-2xl p-3 border border-border"
    >
      <img
        src={product.image_url || "/placeholder.svg"}
        alt={product.name}
        className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
        loading="lazy"
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-display font-semibold text-sm">{product.name}</h4>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="font-display font-bold text-primary">${product.price.toFixed(2)}</span>
          <div className="flex items-center gap-2">
            {qty > 0 && (
              <>
                <button
                  onClick={() => updateQuantity(product.id, qty - 1)}
                  className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-semibold w-5 text-center">{qty}</span>
              </>
            )}
            <button
              onClick={() => addItem(product)}
              disabled={!product.in_stock}
              className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

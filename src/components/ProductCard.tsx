import { DbProduct } from "@/hooks/useVendors";
import { useCart } from "@/context/CartContext";
import { Plus, Minus, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";

type Props = {
  product: DbProduct;
  index: number;
};

const ProductCard = ({ product, index }: Props) => {
  const { items, addItem, updateQuantity } = useCart();
  const cartItem = items.find((i) => i.product.id === product.id);
  const qty = cartItem?.quantity ?? 0;
  const outOfStock = !product.in_stock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex gap-3 bg-card rounded-2xl p-3 border border-border hover:border-primary/20 transition-all ${outOfStock ? "opacity-60" : ""}`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={product.image_url || "/placeholder.svg"}
          alt={product.name}
          className="w-20 h-20 rounded-xl object-cover"
          loading="lazy"
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-background/70 rounded-xl flex items-center justify-center">
            <span className="text-[10px] font-bold text-destructive uppercase">Sold out</span>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <h4 className="font-display font-semibold text-sm leading-tight">{product.name}</h4>
          {product.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{product.description}</p>
          )}
          {product.prep_time && (
            <p className="text-[10px] text-muted-foreground mt-0.5">⏱ {product.prep_time}</p>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-display font-bold text-primary text-base">${product.price.toFixed(2)}</span>
          <div className="flex items-center gap-1.5">
            {qty > 0 ? (
              <>
                <button
                  onClick={() => updateQuantity(product.id, qty - 1)}
                  className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold w-6 text-center">{qty}</span>
                <button
                  onClick={() => addItem(product)}
                  className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => addItem(product)}
                disabled={outOfStock}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;

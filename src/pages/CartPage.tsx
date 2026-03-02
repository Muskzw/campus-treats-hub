import { useCart } from "@/context/CartContext";
import { useCampus } from "@/context/CampusContext";
import BottomNav from "@/components/BottomNav";
import { Navigate, Link } from "react-router-dom";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CartPage = () => {
  const { items, updateQuantity, removeItem, clearCart, total, itemCount } = useCart();
  const { isSetup } = useCampus();

  if (!isSetup) return <Navigate to="/setup" replace />;

  const deliveryFee = itemCount > 0 ? 1.0 : 0;
  const grandTotal = total + deliveryFee;

  const handleCheckout = () => {
    toast.success("Order placed! 🎉", { description: "Your order is being prepared." });
    clearCart();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border px-4 py-3">
        <h1 className="font-display font-bold text-lg">Your Cart</h1>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mb-4" />
          <h2 className="font-display font-semibold text-lg">Your cart is empty</h2>
          <p className="text-sm text-muted-foreground mt-1">Add items from the marketplace</p>
          <Link
            to="/"
            className="mt-4 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm"
          >
            Browse Vendors
          </Link>
        </div>
      ) : (
        <div className="px-4 mt-4">
          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                layout
                exit={{ opacity: 0, x: -100 }}
                className="flex gap-3 bg-card rounded-2xl p-3 border border-border mb-3"
              >
                <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-display font-semibold text-sm">{item.product.name}</h4>
                  <p className="text-sm font-semibold text-primary mt-1">${(item.product.price * item.quantity).toFixed(2)}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="ml-auto w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Summary */}
          <div className="mt-4 bg-card rounded-2xl p-4 border border-border space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">${total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery fee</span>
              <span className="font-medium">${deliveryFee.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="font-display font-semibold">Total</span>
              <span className="font-display font-bold text-primary">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full mt-4 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm"
          >
            Checkout · ${grandTotal.toFixed(2)}
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default CartPage;

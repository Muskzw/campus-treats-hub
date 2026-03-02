import { categories } from "@/lib/data";
import { motion } from "framer-motion";

type Props = {
  selected: string | null;
  onSelect: (id: string | null) => void;
};

const CategoryRow = ({ selected, onSelect }: Props) => {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none px-4">
      {categories.map((cat, i) => (
        <motion.button
          key={cat.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => onSelect(selected === cat.id ? null : cat.id)}
          className={`flex flex-col items-center gap-1.5 min-w-[4.5rem] py-3 px-3 rounded-2xl transition-all ${
            selected === cat.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
              : "bg-card text-foreground hover:bg-accent"
          }`}
        >
          <span className="text-2xl">{cat.icon}</span>
          <span className="text-xs font-medium whitespace-nowrap">{cat.name}</span>
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryRow;

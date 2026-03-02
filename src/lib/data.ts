// Mock data for CampusGoodies

export const campuses = [
  { id: "uz", name: "University of Zimbabwe", city: "Harare" },
  { id: "hit", name: "Harare Institute of Technology", city: "Harare" },
  { id: "msu", name: "Midlands State University", city: "Gweru" },
  { id: "nust", name: "NUST", city: "Bulawayo" },
  { id: "cut", name: "Chinhoyi University of Technology", city: "Chinhoyi" },
];

export const hostels: Record<string, { id: string; name: string }[]> = {
  uz: [
    { id: "swinton", name: "Swinton Hostel" },
    { id: "manfred", name: "Manfred Hodson Hall" },
    { id: "carr-saunders", name: "Carr-Saunders Hall" },
    { id: "helleniks", name: "Helleniks Hall" },
  ],
  hit: [
    { id: "block-a", name: "Block A" },
    { id: "block-b", name: "Block B" },
    { id: "block-c", name: "Block C" },
  ],
  msu: [
    { id: "nehanda", name: "Nehanda Hall" },
    { id: "chaminuka", name: "Chaminuka Hall" },
    { id: "takawira", name: "Takawira Hall" },
  ],
  nust: [
    { id: "hall-1", name: "Hall 1" },
    { id: "hall-2", name: "Hall 2" },
  ],
  cut: [
    { id: "residence-a", name: "Residence A" },
    { id: "residence-b", name: "Residence B" },
  ],
};

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
};

export const categories: Category[] = [
  { id: "food", name: "Food", icon: "🍔", color: "bg-accent" },
  { id: "groceries", name: "Groceries", icon: "🛒", color: "bg-accent" },
  { id: "snacks", name: "Snacks", icon: "🍿", color: "bg-accent" },
  { id: "printing", name: "Printing", icon: "🖨️", color: "bg-accent" },
  { id: "cosmetics", name: "Cosmetics", icon: "💄", color: "bg-accent" },
  { id: "drinks", name: "Drinks", icon: "🥤", color: "bg-accent" },
];

export type Vendor = {
  id: string;
  name: string;
  description: string;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  category: string;
  image: string;
  campus: string;
};

export const vendors: Vendor[] = [
  {
    id: "v1",
    name: "Mama's Kitchen",
    description: "Authentic homemade meals, sadza & relish",
    rating: 4.8,
    deliveryTime: "20-30 min",
    deliveryFee: 1.0,
    category: "food",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    campus: "uz",
  },
  {
    id: "v2",
    name: "Campus Bites",
    description: "Burgers, fries, and campus favorites",
    rating: 4.5,
    deliveryTime: "15-25 min",
    deliveryFee: 0.75,
    category: "food",
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80",
    campus: "uz",
  },
  {
    id: "v3",
    name: "Quick Print Hub",
    description: "Printing, binding, lamination services",
    rating: 4.9,
    deliveryTime: "30-45 min",
    deliveryFee: 0.5,
    category: "printing",
    image: "https://images.unsplash.com/photo-1586075010882-3a0c4e123807?w=400&q=80",
    campus: "uz",
  },
  {
    id: "v4",
    name: "Snack Attack",
    description: "Chips, sweets, biscuits & more",
    rating: 4.3,
    deliveryTime: "10-20 min",
    deliveryFee: 0.5,
    category: "snacks",
    image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80",
    campus: "uz",
  },
  {
    id: "v5",
    name: "Fresh Mart",
    description: "Daily groceries delivered to your room",
    rating: 4.6,
    deliveryTime: "25-40 min",
    deliveryFee: 1.5,
    category: "groceries",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=80",
    campus: "uz",
  },
  {
    id: "v6",
    name: "Glow Up Beauty",
    description: "Skincare, makeup & beauty essentials",
    rating: 4.7,
    deliveryTime: "20-35 min",
    deliveryFee: 1.0,
    category: "cosmetics",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80",
    campus: "uz",
  },
];

export type Product = {
  id: string;
  vendorId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  prepTime: string;
  inStock: boolean;
};

export const products: Product[] = [
  { id: "p1", vendorId: "v1", name: "Sadza & Beef Stew", price: 3.50, description: "Traditional sadza with rich beef stew", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", prepTime: "15 min", inStock: true },
  { id: "p2", vendorId: "v1", name: "Sadza & Chicken", price: 4.00, description: "Sadza with grilled chicken pieces", image: "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80", prepTime: "20 min", inStock: true },
  { id: "p3", vendorId: "v1", name: "Rice & Beans", price: 2.50, description: "Fluffy rice with seasoned beans", image: "https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80", prepTime: "10 min", inStock: true },
  { id: "p4", vendorId: "v2", name: "Classic Burger", price: 3.00, description: "Beef patty with lettuce and cheese", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80", prepTime: "12 min", inStock: true },
  { id: "p5", vendorId: "v2", name: "Loaded Fries", price: 2.00, description: "Crispy fries with cheese sauce", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80", prepTime: "8 min", inStock: true },
  { id: "p6", vendorId: "v3", name: "B&W Printing (per page)", price: 0.10, description: "Standard black and white printing", image: "https://images.unsplash.com/photo-1586075010882-3a0c4e123807?w=400&q=80", prepTime: "5 min", inStock: true },
  { id: "p7", vendorId: "v3", name: "Color Printing (per page)", price: 0.30, description: "Full color printing", image: "https://images.unsplash.com/photo-1586075010882-3a0c4e123807?w=400&q=80", prepTime: "5 min", inStock: true },
  { id: "p8", vendorId: "v4", name: "Chips Variety Pack", price: 1.50, description: "Assorted chips pack", image: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80", prepTime: "2 min", inStock: true },
  { id: "p9", vendorId: "v5", name: "Bread & Eggs Bundle", price: 2.50, description: "Fresh bread loaf + 6 eggs", image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80", prepTime: "5 min", inStock: true },
  { id: "p10", vendorId: "v6", name: "Moisturizer Set", price: 5.00, description: "Face & body moisturizer combo", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80", prepTime: "3 min", inStock: true },
];

export type CartItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus = "placed" | "accepted" | "preparing" | "picked_up" | "delivered";

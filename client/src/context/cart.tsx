import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface ServiceDetails {
  fullName: string;
  birthDate: string;
  email: string;
  specialRequests?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  productType?: string;
  serviceDetails?: ServiceDetails;
}

interface CartContext {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
  hasServiceItems: boolean;
}

const CartCtx = createContext<CartContext | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("bc-cart");
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("bc-cart", JSON.stringify(items));
  }, [items]);

  const addItem = (item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      if (item.productType === "service") {
        return [...prev, { ...item, quantity: 1 }];
      }
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeItem = (id: number) => setItems(prev => prev.filter(i => i.id !== id));
  const updateQuantity = (id: number, qty: number) => {
    if (qty <= 0) return removeItem(id);
    setItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i));
  };
  const clearCart = () => setItems([]);
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const hasServiceItems = items.some(i => i.productType === "service");

  return (
    <CartCtx.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount, hasServiceItems }}>
      {children}
    </CartCtx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

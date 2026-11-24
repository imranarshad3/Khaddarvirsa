'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type CartItem = { id: number; alias: string; title: string; code: string | null; img: string; price: number; qty: number };

type Ctx = {
  items: CartItem[];
  ready: boolean;
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, 'qty'>, qty?: number) => void;
  setQty: (id: number, qty: number) => void;
  remove: (id: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  toast: string | null;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = 'kk_cart_v1';
const MAX_QTY = 50; // matches the server-side limit in placeOrder

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
      if (Array.isArray(raw)) setItems(raw.filter((i) => i && Number.isInteger(i.id) && i.qty > 0));
    } catch { /* corrupt storage: start with an empty cart */ }
    setReady(true);
    const sync = (e: StorageEvent) => { if (e.key === KEY) setItems(JSON.parse(e.newValue || '[]')); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  useEffect(() => { if (ready) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, ready]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((item: Omit<CartItem, 'qty'>, qty = 1) => {
    setItems((cur) => {
      const found = cur.find((i) => i.id === item.id);
      if (found) return cur.map((i) => (i.id === item.id ? { ...i, ...item, qty: Math.min(i.qty + qty, MAX_QTY) } : i));
      return [...cur, { ...item, qty: Math.min(qty, MAX_QTY) }];
    });
    if (qty > 0) setToast('Product item added to cart.'); // qty 0 = silent price refresh
  }, []);
  const setQty = useCallback((id: number, qty: number) =>
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, qty: Math.max(1, Math.min(qty, MAX_QTY)) } : i))), []);
  const remove = useCallback((id: number) => setItems((cur) => cur.filter((i) => i.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<Ctx>(() => ({
    items, ready, add, setQty, remove, clear, drawerOpen, setDrawerOpen, toast,
    count: items.reduce((a, i) => a + i.qty, 0),
    subtotal: items.reduce((a, i) => a + i.qty * i.price, 0),
  }), [items, ready, add, setQty, remove, clear, drawerOpen, toast]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
}

"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
  maxStock: number;
  qty: number;
};

type CartState = {
  items: CartLine[];
  addItem: (item: Omit<CartLine, "qty"> & { qty?: number }) => void;
  setQty: (productId: string, qty: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const qty = item.qty ?? 1;
        const existing = get().items.find((i) => i.productId === item.productId);
        if (existing) {
          const nextQty = Math.min(
            existing.maxStock,
            existing.qty + qty
          );
          set({
            items: get().items.map((i) =>
              i.productId === item.productId ? { ...i, qty: nextQty } : i
            ),
          });
          return;
        }
        set({
          items: [
            ...get().items,
            {
              productId: item.productId,
              name: item.name,
              price: item.price,
              imageUrl: item.imageUrl,
              maxStock: item.maxStock,
              qty: Math.min(item.maxStock, qty),
            },
          ],
        });
      },
      setQty: (productId, qty) => {
        const line = get().items.find((i) => i.productId === productId);
        if (!line) return;
        const next = Math.max(1, Math.min(line.maxStock, qty));
        set({
          items: get().items.map((i) =>
            i.productId === productId ? { ...i, qty: next } : i
          ),
        });
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      clear: () => set({ items: [] }),
    }),
    { name: "lahore-bazaar-cart" }
  )
);

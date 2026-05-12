"use client";

import { useCartStore } from "@/stores/cart-store";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  productId,
  name,
  price,
  stock,
  imageUrl,
}: {
  productId: string;
  name: string;
  price: number;
  stock: number;
  imageUrl: string | null;
}) {
  const addItem = useCartStore((s) => s.addItem);

  if (stock < 1) {
    return (
      <Button disabled className="w-full font-urdu">
        اسٹاک ختم — Out of stock
      </Button>
    );
  }

  return (
    <Button
      className="w-full font-urdu"
      size="lg"
      type="button"
      onClick={() =>
        addItem({
          productId,
          name,
          price,
          maxStock: stock,
          imageUrl,
          qty: 1,
        })
      }
    >
      کارٹ میں شامل کریں — Add to cart
    </Button>
  );
}

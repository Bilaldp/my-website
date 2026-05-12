"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-bold font-urdu">
          آپ کا کارٹ <span className="font-sans text-muted-foreground text-lg"> / Cart</span>
        </h1>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center font-urdu text-muted-foreground">
              کارٹ خالی ہے۔ بازار سے خریداری کریں۔
              <div className="mt-4">
                <Link href="/" className={buttonVariants({ size: "default" })}>
                  Continue shopping
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col gap-4">
            {items.map((line) => (
              <Card key={line.productId}>
                <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
                  <div className="relative h-24 w-full shrink-0 overflow-hidden rounded-md bg-muted sm:h-20 sm:w-20">
                    {line.imageUrl ? (
                      <Image
                        src={line.imageUrl}
                        alt={line.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/product/${line.productId}`}
                      className="font-semibold hover:text-primary line-clamp-2"
                    >
                      {line.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Rs {line.price.toLocaleString("en-PK")} × {line.qty}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="sr-only" htmlFor={`qty-${line.productId}`}>
                      Quantity
                    </label>
                    <Input
                      id={`qty-${line.productId}`}
                      type="number"
                      min={1}
                      max={line.maxStock}
                      className="w-20"
                      value={line.qty}
                      onChange={(e) =>
                        setQty(line.productId, Number.parseInt(e.target.value, 10) || 1)
                      }
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      type="button"
                      onClick={() => removeItem(line.productId)}
                      className="font-urdu"
                    >
                      ہٹائیں
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Separator />

            <div className="flex flex-col gap-4 rounded-xl border bg-card p-4">
              <div className="flex justify-between text-lg font-semibold">
                <span className="font-urdu text-muted-foreground">کل رقم</span>
                <span>Rs {subtotal.toLocaleString("en-PK")}</span>
              </div>
              <Link
                href="/checkout"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "font-urdu w-full sm:w-auto self-end"
                )}
              >
                چیک آؤٹ — Checkout
              </Link>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

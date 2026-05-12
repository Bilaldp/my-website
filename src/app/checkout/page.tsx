"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { placeOrder } from "@/app/actions/order-actions";
import type { CheckoutLine } from "@/app/actions/order-actions";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCartStore } from "@/stores/cart-store";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lines: CheckoutLine[] = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        qty: i.qty,
        price: i.price,
      })),
    [items]
  );

  const subtotal = items.reduce((acc, i) => acc + i.price * i.qty, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    fd.set("cart_json", JSON.stringify(lines));
    const result = await placeOrder(fd);
    setPending(false);
    if ("error" in result) {
      setError(result.error);
      return;
    }
    clear();
    router.push(`/order/${result.orderId}`);
    router.refresh();
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-bold font-urdu">
          چیک آؤٹ <span className="font-sans text-muted-foreground text-lg">/ Checkout</span>
        </h1>

        {items.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center font-urdu text-muted-foreground">
              کارٹ خالی ہے۔
              <div className="mt-4">
                <Link href="/" className={buttonVariants({ size: "default" })}>
                  Shop
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="font-urdu text-lg">کیش آن ڈیلیوری</CardTitle>
              <p className="text-sm text-muted-foreground">
                Cash on delivery only — آپ ادائیگی ڈیلیوری پر کریں گے۔
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="customer_name">
                    Name <span className="font-urdu text-muted-foreground">نام</span>
                  </Label>
                  <Input id="customer_name" name="customer_name" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer_phone">
                    Phone <span className="font-urdu text-muted-foreground">فون</span>
                  </Label>
                  <Input id="customer_phone" name="customer_phone" type="tel" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="customer_address">
                    Address <span className="font-urdu text-muted-foreground">پتہ</span>
                  </Label>
                  <Textarea id="customer_address" name="customer_address" rows={4} required />
                </div>

                <div className="rounded-lg bg-muted/60 p-3 text-sm">
                  <div className="flex justify-between font-semibold">
                    <span className="font-urdu text-muted-foreground">کل</span>
                    <span>Rs {subtotal.toLocaleString("en-PK")}</span>
                  </div>
                </div>

                {error ? (
                  <p className="text-destructive text-sm whitespace-pre-wrap">{error}</p>
                ) : null}

                <Button type="submit" disabled={pending} size="lg" className="font-urdu w-full">
                  {pending ? "..." : "آرڈر کنفرم کریں — Place order"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}

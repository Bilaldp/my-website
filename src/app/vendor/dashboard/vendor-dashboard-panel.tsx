"use client";

import { useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  deleteProduct,
  saveProduct,
  type ActionResult,
} from "@/app/actions/product-actions";
import type { Order, Product } from "@/lib/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const initial: ActionResult | undefined = undefined;

type OrderWithLines = Order & {
  order_items: Array<{
    quantity: number;
    price: number;
    products: { name: string } | null;
  }>;
};

export function VendorDashboardPanel({
  vendor,
  products,
  orders,
}: {
  vendor: {
    id: string;
    shop_name: string;
    approved: boolean;
  };
  products: Product[];
  orders: OrderWithLines[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<Product | null>(null);
  const [state, formAction, pending] = useActionState(saveProduct, initial);

  useEffect(() => {
    if (state?.ok) {
      setEditing(null);
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2 rounded-xl border bg-card p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-semibold">{vendor.shop_name}</h2>
          {vendor.approved ? (
            <Badge className="bg-primary">Approved</Badge>
          ) : (
            <Badge variant="destructive" className="font-urdu">
              زیرِ التواء منظوری
            </Badge>
          )}
        </div>
        {!vendor.approved ? (
          <p className="text-sm text-muted-foreground font-urdu">
            آپ کی دکان ایڈمن کی منظوری کے بعد ہی مارکیٹ میں نظر آئے گی۔ Supabase میں{" "}
            <code className="rounded bg-muted px-1">approved = true</code> سیٹ کریں۔
          </p>
        ) : null}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="font-urdu">
              {editing ? "مصنوعات میں ترمیم" : "نئی مصنوعات"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-3">
              <input type="hidden" name="id" value={editing?.id ?? ""} />
              <input
                type="hidden"
                name="existing_image_url"
                value={editing?.image_url ?? ""}
              />

              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  defaultValue={editing?.name ?? ""}
                />
              </div>
              <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price (Rs)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    defaultValue={editing ? String(editing.price) : ""}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    name="stock"
                    type="number"
                    min="0"
                    required
                    defaultValue={editing ? String(editing.stock) : ""}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  defaultValue={editing?.category ?? ""}
                  placeholder="e.g. Food, Fashion"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={3}
                  defaultValue={editing?.description ?? ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">
                  Image <span className="font-urdu text-muted-foreground">تصویر</span>
                </Label>
                <Input id="image" name="image" type="file" accept="image/*" />
                {editing?.image_url ? (
                  <div className="relative mt-1 h-28 w-28 overflow-hidden rounded-md border bg-muted">
                    <Image
                      src={editing.image_url}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  </div>
                ) : null}
              </div>

              {state?.error ? (
                <p className="text-destructive text-sm">{state.error}</p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={pending} className="font-urdu">
                  {pending ? "..." : editing ? "محفوظ کریں — Save" : "شامل کریں — Add"}
                </Button>
                {editing ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(null)}
                    className="font-urdu"
                  >
                    منسوخ — Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-urdu">آپ کی مصنوعات</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {products.length === 0 ? (
              <p className="text-sm text-muted-foreground font-urdu">
                ابھی کوئی مصنوعات نہیں۔
              </p>
            ) : (
              products.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Rs {Number(p.price).toLocaleString("en-PK")} · Stock {p.stock}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setEditing(p)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      type="button"
                      className="font-urdu"
                      onClick={async () => {
                        if (
                          typeof window !== "undefined" &&
                          window.confirm("Delete this product?")
                        ) {
                          await deleteProduct(p.id);
                          router.refresh();
                        }
                      }}
                    >
                      حذف
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <h3 className="text-lg font-semibold font-urdu">آپ کے آرڈرز</h3>
        {orders.length === 0 ? (
          <p className="text-sm text-muted-foreground">No orders yet containing your products.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((o) => (
              <Card key={o.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-mono">{o.id}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    {new Date(o.created_at).toLocaleString("en-PK")}
                  </p>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <p>
                    <span className="font-urdu text-muted-foreground">گاہک</span>:{" "}
                    {o.customer_name} · {o.customer_phone}
                  </p>
                  <p className="text-muted-foreground">{o.customer_address}</p>
                  <div className="mt-2 flex flex-col gap-1 border-t pt-2">
                    {o.order_items.map((li, i) => (
                      <div key={i} className="flex justify-between gap-2">
                        <span>
                          {li.products?.name ?? "Item"} × {li.quantity}
                        </span>
                        <span className="tabular-nums">
                          Rs {(Number(li.price) * li.quantity).toLocaleString("en-PK")}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="pt-2 font-semibold">
                    Total order: Rs {Number(o.total).toLocaleString("en-PK")}{" "}
                    <Badge variant="outline" className="ml-2">
                      {o.status}
                    </Badge>
                  </p>
                  <Link
                    href={`/order/${o.id}`}
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "w-fit inline-flex"
                    )}
                  >
                    Customer confirmation view
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

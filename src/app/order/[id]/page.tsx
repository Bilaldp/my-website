import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/server";
import { whatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type ItemRow = {
  quantity: number;
  price: number;
  products: {
    name: string;
    vendors: { shop_name: string; phone: string | null } | null;
  } | null;
};

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error: oErr } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (oErr || !order) notFound();

  const { data: linesRaw } = await supabase
    .from("order_items")
    .select(
      `
      quantity,
      price,
      products (
        name,
        vendors ( shop_name, phone )
      )
    `
    )
    .eq("order_id", id);

  const lines = (linesRaw ?? []) as unknown as ItemRow[];

  const vendorOutreach = new Map<
    string,
    { shop: string; phone: string | null }
  >();

  for (const line of lines) {
    const v = line.products?.vendors;
    if (!v?.shop_name) continue;
    const key = v.shop_name + (v.phone ?? "");
    if (!vendorOutreach.has(key)) {
      vendorOutreach.set(key, { shop: v.shop_name, phone: v.phone });
    }
  }

  const summaryLines = lines
    .map((l) => {
      const name = l.products?.name ?? "Product";
      return `• ${name} × ${l.quantity} @ Rs ${Number(l.price).toLocaleString("en-PK")}`;
    })
    .join("\n");

  const customerBlock = [
    `Customer: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    `Address: ${order.customer_address}`,
  ].join("\n");

  const waMessage = [
    `Assalamualaikum — Lahore Bazaar order`,
    ``,
    customerBlock,
    ``,
    summaryLines,
    ``,
    `Total: Rs ${Number(order.total).toLocaleString("en-PK")}`,
    `Order ID: ${order.id}`,
  ].join("\n");

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8">
        <h1 className="text-2xl font-bold font-urdu">
          آرڈر کی تصدیق <span className="font-sans text-muted-foreground text-lg">/ Order placed</span>
        </h1>

        <Card className="border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-lg">Thank you!</CardTitle>
            <p className="text-sm text-muted-foreground font-urdu">
              آپ کا آرڈر موصول ہو گیا۔ وینڈرز سے واٹس ایپ پر رابطہ کر سکتے ہیں۔
            </p>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p>
              <span className="text-muted-foreground">Order ID</span>:{" "}
              <span className="font-mono">{order.id}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Total</span>: Rs{" "}
              {Number(order.total).toLocaleString("en-PK")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-urdu text-base">آئٹمز</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {lines.map((line, idx) => (
              <div key={idx} className="flex justify-between gap-4 text-sm">
                <span className="flex-1">
                  {line.products?.name ?? "Product"}{" "}
                  <span className="text-muted-foreground">
                    × {line.quantity}
                  </span>
                </span>
                <span className="tabular-nums">
                  Rs {(Number(line.price) * line.quantity).toLocaleString("en-PK")}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Separator />

        <section className="flex flex-col gap-3">
          <h2 className="font-semibold font-urdu">وینڈر سے رابطہ — Message vendor</h2>
          <div className="flex flex-col gap-2">
            {Array.from(vendorOutreach.values()).map((v) => {
              const href = whatsappUrl(v.phone, waMessage);
              if (!href) {
                return (
                  <Button key={v.shop + (v.phone ?? "")} variant="secondary" disabled>
                    WhatsApp: {v.shop} (no phone on file)
                  </Button>
                );
              }
              return (
                <a
                  key={v.shop + (v.phone ?? "")}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "secondary", size: "default" }))}
                >
                  Message vendor — {v.shop}
                </a>
              );
            })}
            {vendorOutreach.size === 0 ? (
              <p className="text-sm text-muted-foreground font-urdu">
                وینڈر فون نمبر دستیاب نہیں۔
              </p>
            ) : null}
          </div>
        </section>

        <Link
          href="/"
          className={cn(buttonVariants({ variant: "outline", size: "default" }))}
        >
          بازار پر واپس — Continue shopping
        </Link>
      </main>
    </>
  );
}

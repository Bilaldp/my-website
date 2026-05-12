import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { AddToCartButton } from "./add-to-cart";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: row, error } = await supabase
    .from("products")
    .select("*, vendors(shop_name, phone, approved)")
    .eq("id", id)
    .maybeSingle();

  if (error || !row) notFound();

  const vendors = row.vendors as {
    shop_name: string;
    phone: string | null;
    approved: boolean;
  } | null;

  if (!vendors?.approved) notFound();

  const product = {
    id: row.id as string,
    name: row.name as string,
    price: Number(row.price),
    description: row.description as string | null,
    image_url: row.image_url as string | null,
    stock: Number(row.stock),
    category: row.category as string | null,
  };

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-6 px-4 py-8">
        <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
          ← Back to marketplace
        </Link>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width:768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center font-urdu text-muted-foreground">
                کوئی تصویر نہیں
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {product.category ? (
                <Badge variant="secondary">{product.category}</Badge>
              ) : null}
              <Badge variant="outline">{vendors.shop_name}</Badge>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
            <p className="text-3xl font-bold text-primary">
              Rs {product.price.toLocaleString("en-PK")}
            </p>
            {product.description ? (
              <p className="text-muted-foreground leading-relaxed">{product.description}</p>
            ) : (
              <p className="font-urdu text-sm text-muted-foreground">تفصیل دستیاب نہیں۔</p>
            )}
            <p className="text-sm text-muted-foreground">
              Stock / <span className="font-urdu">اسٹاک</span>: {product.stock}
            </p>

            <AddToCartButton
              productId={product.id}
              name={product.name}
              price={product.price}
              stock={product.stock}
              imageUrl={product.image_url}
            />
            <Link
              href="/cart"
              className={cn(
                buttonVariants({ variant: "outline", size: "default" }),
                "w-full font-urdu"
              )}
            >
              کارٹ دیکھیں — View cart
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}

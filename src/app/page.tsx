import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { ProductWithVendor } from "@/lib/types";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { q = "", category = "" } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("*, vendors(shop_name, phone, approved)")
    .order("created_at", { ascending: false });

  const term = q.trim();
  if (term) {
    query = query.ilike("name", `%${term}%`);
  }
  if (category.trim()) {
    query = query.eq("category", category.trim());
  }

  const { data: raw, error } = await query;

  type Row = ProductWithVendor & {
    vendors: { shop_name: string; phone: string | null; approved: boolean } | null;
  };

  const products = ((raw ?? []) as Row[]).filter(
    (p) => p.vendors?.approved === true
  ) as ProductWithVendor[];

  const { data: vendorRows } = await supabase
    .from("vendors")
    .select("id")
    .eq("approved", true);

  const approvedIds = new Set((vendorRows ?? []).map((v) => v.id));

  const { data: catRows } = await supabase.from("products").select("category, vendor_id");

  const categories = Array.from(
    new Set(
      (catRows ?? [])
        .filter((r) => approvedIds.has(r.vendor_id as string))
        .map((r) => r.category)
        .filter((c): c is string => Boolean(c))
    )
  ).sort();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-8">
        <section className="rounded-2xl border bg-gradient-to-br from-primary/15 via-background to-secondary/40 p-6 sm:p-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Lahore Bazaar
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Fresh picks from Lahore&apos;s approved local vendors — cash on delivery across the city.
          </p>
          <p className="font-urdu mt-2 text-sm text-primary">
            تازہ مصنوعات، قابل اعتماد وینڈرز، کیش آن ڈیلیوری۔
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <form
            className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
            method="get"
            action="/"
          >
            <div className="flex flex-1 flex-col gap-2 min-w-[200px]">
              <Label htmlFor="q">
                Search <span className="font-urdu text-muted-foreground">(تلاش)</span>
              </Label>
              <Input
                id="q"
                name="q"
                placeholder="Search products..."
                defaultValue={term}
              />
            </div>
            <div className="flex flex-col gap-2 sm:w-48">
              <Label htmlFor="category">
                Category <span className="font-urdu text-muted-foreground">(قسم)</span>
              </Label>
              <select
                id="category"
                name="category"
                defaultValue={category}
                className="border-input bg-background h-9 w-full rounded-md border px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
              >
                <option value="">All / تمام</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <Button type="submit" className="sm:mb-0.5">
              Apply
            </Button>
          </form>

          {error ? (
            <p className="text-destructive text-sm">
              Could not load products. Run <code className="rounded bg-muted px-1">supabase/schema.sql</code>{" "}
              and approve vendors in Supabase.
            </p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground font-urdu text-center py-12">
              کوئی مصنوعات نہیں ملیں۔ فلٹر بدل کر دیکھیں۔
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </section>

        <footer className="border-t pt-8 text-center text-sm text-muted-foreground">
          <Link href="/vendor/signup" className="text-primary hover:underline font-urdu">
            وینڈر بنیں — Become a vendor
          </Link>
        </footer>
      </main>
    </>
  );
}

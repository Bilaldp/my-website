import Link from "next/link";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { createClient } from "@/lib/supabase/server";
import type { Order, Product } from "@/lib/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VendorDashboardPanel } from "./vendor-dashboard-panel";
import { VendorLogoutButton } from "./vendor-logout-button";

type OrderWithLines = Order & {
  order_items: Array<{
    quantity: number;
    price: number;
    products: { name: string } | null;
  }>;
};

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/vendor/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id, shop_name, approved")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor) redirect("/vendor/signup");

  const { data: productsRaw } = await supabase
    .from("products")
    .select("*")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  const products = (productsRaw ?? []) as Product[];

  const { data: ordersRaw } = await supabase
    .from("orders")
    .select(
      `
      id,
      customer_name,
      customer_phone,
      customer_address,
      total,
      status,
      created_at,
      order_items (
        quantity,
        price,
        products ( name )
      )
    `
    )
    .order("created_at", { ascending: false });

  const orders = (ordersRaw ?? []) as unknown as OrderWithLines[];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold font-urdu">وینڈر ڈیش بورڈ</h1>
            <p className="text-sm text-muted-foreground">Manage products & incoming orders</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <VendorLogoutButton />
            <Link
              href="/"
              className={cn(buttonVariants({ variant: "secondary", size: "sm" }))}
            >
              Shop
            </Link>
          </div>
        </div>

        <VendorDashboardPanel vendor={vendor} products={products} orders={orders} />
      </main>
    </>
  );
}

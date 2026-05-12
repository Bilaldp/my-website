"use client";

import Link from "next/link";
import { ShoppingCart, Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const count = useCartStore((s) =>
    s.items.reduce((acc, i) => acc + i.qty, 0)
  );

  return (
    <header className="sticky top-0 z-40 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="text-lg font-bold tracking-tight text-primary">
            Lahore Bazaar
          </span>
          <span className="font-urdu text-xs text-muted-foreground">
            لاہور بازار — مقامی برانڈز
          </span>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            href="/vendor/login"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "gap-1.5"
            )}
          >
            <Store className="size-4" />
            <span className="hidden sm:inline font-urdu text-xs">وینڈر</span>
            <span className="hidden sm:inline">Vendor</span>
          </Link>
          <Link
            href="/cart"
            className={cn(buttonVariants({ size: "sm" }), "relative gap-1.5")}
          >
            <ShoppingCart className="size-4" />
            <span className="hidden sm:inline font-urdu text-xs">کارٹ</span>
            <span className="hidden sm:inline">Cart</span>
            {count > 0 ? (
              <Badge className="absolute -right-2 -top-2 h-5 min-w-5 px-1 justify-center tabular-nums">
                {count}
              </Badge>
            ) : null}
          </Link>
        </nav>
      </div>
    </header>
  );
}

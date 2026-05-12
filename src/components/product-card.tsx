import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import type { ProductWithVendor } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductCard({ product }: { product: ProductWithVendor }) {
  const vendorName = product.vendors?.shop_name ?? "Vendor";

  return (
    <Card className="flex flex-col overflow-hidden pt-0 pb-3 gap-0 transition-shadow hover:shadow-md">
      <CardHeader className="p-0">
        <Link href={`/product/${product.id}`} className="block aspect-square bg-muted relative">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground font-urdu">
              کوئی تصویر نہیں
            </div>
          )}
        </Link>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2 px-4 pt-3">
        <div className="flex flex-wrap items-center gap-2">
          {product.category ? (
            <Badge variant="secondary">{product.category}</Badge>
          ) : null}
          <span className="text-xs text-muted-foreground truncate">{vendorName}</span>
        </div>
        <Link href={`/product/${product.id}`}>
          <h2 className="line-clamp-2 font-semibold leading-snug hover:text-primary">
            {product.name}
          </h2>
        </Link>
        <p className="text-lg font-bold text-primary">
          Rs {Number(product.price).toLocaleString("en-PK")}
        </p>
      </CardContent>
      <CardFooter className="px-4 pt-0">
        <Link
          href={`/product/${product.id}`}
          className={cn(buttonVariants({ size: "sm" }), "w-full font-urdu")}
        >
          خریداری — View
        </Link>
      </CardFooter>
    </Card>
  );
}

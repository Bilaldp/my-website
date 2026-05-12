import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { VendorSignupForm } from "./vendor-signup-form";

export default function VendorSignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex flex-1 flex-col items-center px-4 py-10">
        <VendorSignupForm />
        <Link href="/" className="mt-6 text-sm text-muted-foreground hover:text-primary">
          ← Back to shop
        </Link>
      </main>
    </>
  );
}

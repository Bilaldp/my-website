"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function VendorLogoutButton() {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="sm"
      className="font-urdu"
      type="button"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/");
        router.refresh();
      }}
    >
      لاگ آؤٹ
    </Button>
  );
}

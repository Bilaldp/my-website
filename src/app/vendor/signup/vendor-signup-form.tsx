"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupVendor, type ActionResult } from "@/app/actions/vendor-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initial: ActionResult | undefined = undefined;

export function VendorSignupForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(signupVendor, initial);

  useEffect(() => {
    if (state?.ok) {
      router.push("/vendor/dashboard");
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <Card className="w-full max-w-lg border-primary/20 shadow-lg">
      <CardHeader>
        <CardTitle className="font-urdu text-2xl">وینڈر رجسٹریشن</CardTitle>
        <CardDescription>
          Shop details + Supabase Auth account (email / password).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="shop_name">
              Shop name <span className="font-urdu text-muted-foreground">دکان کا نام</span>
            </Label>
            <Input id="shop_name" name="shop_name" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="owner_name">
              Owner name <span className="font-urdu text-muted-foreground">مالک کا نام</span>
            </Label>
            <Input id="owner_name" name="owner_name" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">
              Phone <span className="font-urdu text-muted-foreground">فون</span>
            </Label>
            <Input id="phone" name="phone" type="tel" placeholder="+92..." />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="address">
              Address <span className="font-urdu text-muted-foreground">پتہ</span>
            </Label>
            <Textarea id="address" name="address" rows={3} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" required autoComplete="email" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {state?.error ? (
            <p className="text-destructive text-sm whitespace-pre-wrap">{state.error}</p>
          ) : null}

          <Button type="submit" disabled={pending} className="w-full font-urdu">
            {pending ? "..." : "اکاؤنٹ بنائیں — Sign up"}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            پہلے سے اکاؤنٹ ہے؟{" "}
            <Link href="/vendor/login" className="text-primary underline font-urdu">
              لاگ ان
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

"use client";

import Link from "next/link";
import { useActionState } from "react";
import { SiteHeader } from "@/components/site-header";
import { loginVendor, type LoginState } from "@/app/actions/auth-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const initial: LoginState | undefined = undefined;

export default function VendorLoginPage() {
  const [state, formAction, pending] = useActionState(loginVendor, initial);

  return (
    <>
      <SiteHeader />
      <main className="mx-auto flex flex-1 flex-col items-center px-4 py-10">
        <Card className="w-full max-w-md border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle className="font-urdu text-2xl">وینڈر لاگ ان</CardTitle>
            <CardDescription>Sign in to manage your Lahore Bazaar shop.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={formAction} className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                />
              </div>
              {state?.error ? (
                <p className="text-destructive text-sm whitespace-pre-wrap">{state.error}</p>
              ) : null}
              <Button type="submit" disabled={pending} className="w-full font-urdu">
                {pending ? "..." : "داخل ہوں — Sign in"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                نئے وینڈر؟{" "}
                <Link href="/vendor/signup" className="text-primary underline font-urdu">
                  سائن اپ
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
        <Link href="/" className="mt-6 text-sm text-muted-foreground hover:text-primary">
          ← Back to shop
        </Link>
      </main>
    </>
  );
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type LoginState = { error?: string };

/**
 * Server-side sign-in so session cookies are set via Next.js (fixes client-only
 * login where dashboard saw no user).
 */
export async function loginVendor(
  _prev: LoginState | undefined,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "ای میل اور پاس ورڈ درکار ہیں۔ / Email and password required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      error:
        `${error.message} — اگر اکاؤنٹ نیا ہے تو Supabase میں ای میل تصدیق بند کریں یا ای میل کنفرم کریں۔`,
    };
  }

  revalidatePath("/", "layout");
  redirect("/vendor/dashboard");
}

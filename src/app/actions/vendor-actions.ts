"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionResult = { error?: string; ok?: boolean };

export async function signupVendor(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const shop_name = String(formData.get("shop_name") ?? "").trim();
  const owner_name = String(formData.get("owner_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!shop_name || !email || password.length < 6) {
    return {
      error:
        "براہ کرم تمام ضروری خانے پُر کریں۔ پاس ورڈ کم از کم ۶ حروف کا ہونا چاہیے۔ / Please fill required fields; password min 6 characters.",
    };
  }

  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: undefined,
    },
  });

  if (authError) return { error: authError.message };

  const userId = authData.user?.id;
  if (!userId) {
    return {
      error:
        "اکاؤنٹ بن گیا ہو سکتا ہے۔ ای میل تصدیق آن ہے تو ابھی لاگ ان نہیں ہو سکتا۔ Supabase میں ای میل تصدیق چیک کریں۔ / Account may require email confirmation before vendor profile can be created.",
    };
  }

  const { error: vendorError } = await supabase.from("vendors").insert({
    user_id: userId,
    shop_name,
    owner_name: owner_name || null,
    phone: phone || null,
    address: address || null,
  });

  if (vendorError) {
    return { error: vendorError.message };
  }

  revalidatePath("/", "layout");
  return { ok: true };
}

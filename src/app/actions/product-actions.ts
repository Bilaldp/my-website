"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type ActionResult = { error?: string; ok?: boolean };

export async function saveProduct(
  _prev: ActionResult | undefined,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "لاگ ان درکار ہے۔ / Please log in." };

  const { data: vendor, error: vErr } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (vErr || !vendor) return { error: "وینڈر پروفائل نہیں ملی۔ / Vendor profile not found." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const price = Number(formData.get("price"));
  const description = String(formData.get("description") ?? "").trim();
  const stock = Number(formData.get("stock"));
  const category = String(formData.get("category") ?? "").trim();
  const existingImage = String(formData.get("existing_image_url") ?? "").trim();

  if (!name || Number.isNaN(price) || price <= 0 || Number.isNaN(stock) || stock < 0) {
    return { error: "درست مصنوعات کی تفصیلات درج کریں۔ / Enter valid product details." };
  }

  const file = formData.get("image");
  let image_url: string | null = existingImage || null;

  if (file instanceof File && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "") || "image";
    const path = `${vendor.id}/${Date.now()}-${safeName}`;
    const { error: upErr } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });

    if (upErr) return { error: upErr.message };

    const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
    image_url = pub.publicUrl;
  }

  const payload = {
    vendor_id: vendor.id,
    name,
    price,
    description: description || null,
    stock,
    category: category || null,
    image_url,
  };

  if (id) {
    const { error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .eq("vendor_id", vendor.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("products").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/vendor/dashboard");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteProduct(productId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "لاگ ان درکار ہے۔ / Please log in." };

  const { data: vendor } = await supabase
    .from("vendors")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!vendor) return { error: "وینڈر نہیں ملا۔ / Vendor not found." };

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("vendor_id", vendor.id);

  if (error) return { error: error.message };

  revalidatePath("/vendor/dashboard");
  revalidatePath("/");
  return { ok: true };
}

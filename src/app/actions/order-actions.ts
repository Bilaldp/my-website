"use server";

import { createClient } from "@/lib/supabase/server";

export type CheckoutLine = {
  productId: string;
  qty: number;
  price: number;
};

export type PlaceOrderResult =
  | { error: string }
  | { orderId: string };

export async function placeOrder(formData: FormData): Promise<PlaceOrderResult> {
  const customer_name = String(formData.get("customer_name") ?? "").trim();
  const customer_phone = String(formData.get("customer_phone") ?? "").trim();
  const customer_address = String(formData.get("customer_address") ?? "").trim();
  const cartJson = String(formData.get("cart_json") ?? "");

  if (!customer_name || !customer_phone || !customer_address) {
    return {
      error:
        "براہ کرم ڈیلیوری کی تمام تفصیلات درج کریں۔ / Please enter delivery details.",
    };
  }

  let lines: CheckoutLine[];
  try {
    lines = JSON.parse(cartJson) as CheckoutLine[];
  } catch {
    return { error: "کارٹ درست نہیں ہے۔ / Cart is invalid." };
  }

  if (!Array.isArray(lines) || lines.length === 0) {
    return { error: "کارٹ خالی ہے۔ / Cart is empty." };
  }

  const supabase = await createClient();

  let total = 0;
  const validated: { product_id: string; quantity: number; price: number }[] =
    [];

  for (const line of lines) {
    if (
      !line.productId ||
      typeof line.qty !== "number" ||
      line.qty < 1 ||
      typeof line.price !== "number"
    ) {
      return { error: "کارٹ آئٹم درست نہیں ہے۔ / Invalid cart item." };
    }

    const { data: product, error } = await supabase
      .from("products")
      .select("id, price, stock")
      .eq("id", line.productId)
      .maybeSingle();

    if (error || !product) {
      return { error: "کچھ مصنوعات دستیاب نہیں ہیں۔ / Some products are unavailable." };
    }

    const dbPrice = Number(product.price);
    const stock = Number(product.stock);

    if (line.qty > stock) {
      return {
        error: `اسٹاک ناکافی: ${line.productId}. / Insufficient stock for an item.`,
      };
    }

    const unitPrice = dbPrice;
    total += unitPrice * line.qty;
    validated.push({
      product_id: product.id,
      quantity: line.qty,
      price: unitPrice,
    });
  }

  const { data: order, error: orderErr } = await supabase
    .from("orders")
    .insert({
      customer_name,
      customer_phone,
      customer_address,
      total,
      status: "pending",
    })
    .select("id")
    .single();

  if (orderErr || !order) {
    return { error: orderErr?.message ?? "آرڈر نہیں بن سکا۔ / Could not create order." };
  }

  const rows = validated.map((v) => ({
    order_id: order.id,
    product_id: v.product_id,
    quantity: v.quantity,
    price: v.price,
  }));

  const { error: itemsErr } = await supabase.from("order_items").insert(rows);

  if (itemsErr) {
    return {
      error:
        itemsErr.message ||
        "آرڈر آئٹمز محفوظ نہیں ہو سکیں۔ سپورٹ سے رابطہ کریں۔ / Failed to save order lines.",
    };
  }

  return { orderId: order.id };
}

export type Vendor = {
  id: string;
  user_id: string;
  shop_name: string;
  owner_name: string | null;
  phone: string | null;
  address: string | null;
  approved: boolean;
  created_at: string;
};

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  price: number;
  image_url: string | null;
  description: string | null;
  stock: number;
  category: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total: number;
  status: string;
  created_at: string;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  quantity: number;
  price: number;
};

export type ProductWithVendor = Product & {
  vendors: Pick<Vendor, "shop_name" | "phone"> | null;
};

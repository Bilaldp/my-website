export function whatsappUrl(phone: string | null | undefined, message: string) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  let n = digits;
  if (n.startsWith("0")) n = `92${n.slice(1)}`;
  if (!n.startsWith("92")) n = `92${n}`;
  const q = new URLSearchParams({ text: message });
  return `https://wa.me/${n}?${q.toString()}`;
}

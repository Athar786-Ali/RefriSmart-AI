// Shared types for the admin panel sections
import type { OrderStatus } from "@/lib/order-status";
import type { ServiceDisplayStatus } from "@/lib/service-status";

export type Product = {
  id: string; title: string; price: number;
  images?: string[] | string | null;
  productType?: "NEW" | "REFURBISHED";
  conditionScore?: number | null;
  warrantyType?: "BRAND" | "SHOP" | null;
  warrantyExpiry?: string | null;
  stockQty?: number | null;
};

export type Stats = {
  totalBookings: number; totalUsers: number; totalProducts: number;
  latestProducts: Product[];
  applianceStats: { appliance: string; _count: { _all: number } }[];
};

export type Booking = {
  id: string; appliance: string; issue: string;
  status: "PENDING"|"ASSIGNED"|"ESTIMATE_APPROVED"|"OUT_FOR_REPAIR"|"REPAIRING"|"PAYMENT_PENDING"|"FIXED"|"COMPLETED"|"CANCELLED";
  displayStatus?: ServiceDisplayStatus;
  statusLabel?: string;
  scheduledAt: string; address?: string | null;
  contactName?: string | null; contactPhone?: string | null;
  finalCost?: number | null; paymentQR?: string | null; invoiceUrl?: string | null;
  customer?: { name?: string; email?: string };
  technician?: { name?: string; phone?: string } | null;
  technicianId?: string | null;
  technicianName?: string | null;
  pincode?: string | null;
};

export type TechnicianOption = {
  id: string;
  name: string;
  phone?: string;
};

export type Order = {
  id: string; productId?: string; productTitle: string;
  productImageUrl?: string | null; customerId?: string | null;
  customerName?: string | null; deliveryPhone: string; deliveryAddress: string;
  status: OrderStatus;
  paymentStatus?: string; internalNote?: string | null;
  price: number; invoiceUrl?: string | null; createdAt: string;
  userName?: string | null; userEmail?: string | null; userPhone?: string | null;
};

export type Analytics = {
  conversionRate: number; avgSlaHours: number;
  topFaults: { appliance: string; count: number }[];
  marginByCategory: Record<string, number>;
};

export type GalleryItem = {
  id: string; imageUrl: string;
  mediaType?: "image" | "video"; caption?: string | null; createdAt?: string;
};

export type SellOffer = {
  id: string;
  offerPrice: number;
  pickupSlot?: string | null;
  status: string;
  createdAt: string;
};

export type SellReq = {
  id: string;
  userId: string;
  applianceType: string;
  brandModel: string;
  contactName?: string | null;
  address?: string | null;
  conditionNote: string;
  expectedPrice?: number | null;
  pincode?: string | null;
  imageUrl?: string | null;
  status: string;
  createdAt: string;
  customer?: {
    id: string;
    name?: string | null;
    email?: string | null;
    phone?: string | null;
  } | null;
  offers?: SellOffer[];
  latestOffer?: SellOffer | null;
  pendingOffer?: SellOffer | null;
};

export type NewProd = {
  title: string; description: string; price: string; imageUrl: string;
  serialNumber: string; stockQty: string;
  productType: "NEW"|"REFURBISHED";
  conditionScore: string; ageMonths: string;
  warrantyType: ""|"BRAND"|"SHOP"; warrantyExpiry: string; warrantyCertificateUrl: string;
};

export type SectionProps = {
  stats: Stats | null;
  setStats: React.Dispatch<React.SetStateAction<Stats | null>>;
  bookings: Booking[]; setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  orders: Order[];     setOrders:   React.Dispatch<React.SetStateAction<Order[]>>;
  gallery: GalleryItem[]; setGallery: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  analytics: Analytics | null;
  diagnoses: import("@/types").DiagnosisItem[];
  sells: SellReq[]; setSells: React.Dispatch<React.SetStateAction<SellReq[]>>;
  technicians: TechnicianOption[];
  API: string;
};

/* ── helpers (shared) ── */
export const STATUS_COLORS: Record<string, string> = {
  PENDING:           "text-yellow-400 bg-yellow-400/10 border-yellow-400/30",
  ASSIGNED:          "text-blue-400 bg-blue-400/10 border-blue-400/30",
  ESTIMATE_APPROVED: "text-blue-400 bg-blue-400/10 border-blue-400/30",
  OUT_FOR_REPAIR:    "text-orange-400 bg-orange-400/10 border-orange-400/30",
  ON_THE_WAY:        "text-orange-400 bg-orange-400/10 border-orange-400/30",
  REPAIRING:         "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  PAYMENT_PENDING:   "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  FIXED:             "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  COMPLETED:         "text-green-400 bg-green-400/10 border-green-400/30",
  CANCELLED:         "text-red-400 bg-red-400/10 border-red-400/30",
  PLACED:            "text-blue-400 bg-blue-400/10 border-blue-400/30",
  DISPATCHED:        "text-orange-400 bg-orange-400/10 border-orange-400/30",
  OUT_FOR_DELIVERY:  "text-cyan-400 bg-cyan-400/10 border-cyan-400/30",
  DELIVERED:         "text-green-400 bg-green-400/10 border-green-400/30",
};
export const sc  = (s: string) => STATUS_COLORS[s] ?? "text-slate-400 bg-slate-400/10 border-slate-400/30";
export const INR = (n: number) => `₹${Number(n || 0).toLocaleString("en-IN")}`;
export const toDataUrl = (f: File) => new Promise<string>((res, rej) => {
  const r = new FileReader();
  r.onload = () => res(String(r.result ?? ""));
  r.onerror = () => rej(new Error("read error"));
  r.readAsDataURL(f);
});
export const imgSrc = (img: unknown): string | null => {
  if (Array.isArray(img) && typeof img[0] === "string") return img[0];
  if (typeof img === "string" && img.trim()) return img.trim();
  return null;
};
export const expiryDate = (v: string, u: "MONTHS"|"YEARS") => {
  const n = Number(v || 0);
  if (!n) return "";
  const d = new Date();
  u === "YEARS" ? d.setFullYear(d.getFullYear() + n) : d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
};
export const inp = "w-full rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:border-cyan-500/70 focus:outline-none focus:ring-1 focus:ring-cyan-500/30";
export const btn = (c: string) => `px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${c}`;

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

type DiagnosisItem = {
  id: string;
  appliance: string;
  issue: string;
  aiDiagnosis: string;
  customer?: {
    name?: string;
    email?: string;
  };
};

type ProductItem = {
  id: string;
  title: string;
  price: number;
  images?: string[] | string | null;
  isUsed?: boolean;
  productType?: "NEW" | "REFURBISHED";
  conditionScore?: number | null;
  warrantyType?: "BRAND" | "SHOP" | null;
  warrantyExpiry?: string | null;
};

type ApplianceStat = {
  appliance: string;
  _count: {
    _all: number;
  };
};

type DashboardStats = {
  totalBookings: number;
  totalUsers: number;
  totalProducts: number;
  latestProducts: ProductItem[];
  applianceStats: ApplianceStat[];
};

type ServiceBookingItem = {
  id: string;
  appliance: string;
  issue: string;
  status: "PENDING" | "ASSIGNED" | "OUT_FOR_REPAIR" | "REPAIRING" | "FIXED" | "COMPLETED";
  scheduledAt: string;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  finalCost?: number | null;
  paymentQR?: string | null;
  invoiceUrl?: string | null;
  customer?: { name?: string; email?: string };
  technician?: { name?: string; phone?: string } | null;
  pincode?: string | null;
};

type OpsAnalytics = {
  conversionRate: number;
  avgSlaHours: number;
  topFaults: Array<{ appliance: string; count: number }>;
  marginByCategory: Record<string, number>;
};

type ShowcaseImage = {
  id: string;
  imageUrl: string;
  mediaType?: "image" | "video";
  caption?: string | null;
  createdAt?: string;
};

type OrderItem = {
  id: string;
  productId: string;
  productTitle: string;
  productImageUrl?: string | null;
  customerId: string;
  customerName?: string | null;
  deliveryPhone: string;
  deliveryAddress: string;
  orderStatus: "ORDER_PLACED" | "DISPATCHED" | "OUT_FOR_DELIVERY" | "DELIVERED";
  paymentStatus?: string;
  price: number;
  invoiceUrl?: string | null;
  createdAt: string;
  userName?: string | null;
  userEmail?: string | null;
};

type NewProduct = {
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  productType: "NEW" | "REFURBISHED";
  conditionScore: string;
  ageMonths: string;
  warrantyType: "" | "BRAND" | "SHOP";
  warrantyExpiry: string;
  warrantyCertificateUrl: string;
};

const DEFAULT_CERTIFICATE_LINE = "Tested & Certified: Cooling system and compressor working properly.";
const YEAR_OPTIONS = Array.from({ length: 16 }, (_, i) => String(i));
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i));
const WARRANTY_DURATION_OPTIONS = ["3", "6", "9", "12", "18", "24", "36"];

const initialProduct: NewProduct = {
  title: "",
  description: "",
  price: "",
  imageUrl: "",
  productType: "NEW",
  conditionScore: "",
  ageMonths: "",
  warrantyType: "BRAND",
  warrantyExpiry: "",
  warrantyCertificateUrl: "",
};

const toWarrantyExpiryFromDuration = (durationValue: string, durationUnit: "MONTHS" | "YEARS") => {
  const value = Number(durationValue || 0);
  if (!Number.isFinite(value) || value <= 0) return "";
  const date = new Date();
  if (durationUnit === "YEARS") {
    date.setFullYear(date.getFullYear() + value);
  } else {
    date.setMonth(date.getMonth() + value);
  }
  return date.toISOString().slice(0, 10);
};

const getImageUrl = (images: unknown): string | null => {
  if (Array.isArray(images) && typeof images[0] === "string" && images[0].trim()) {
    return images[0].trim();
  }
  if (typeof images === "string" && images.trim()) {
    return images.trim();
  }
  return null;
};

const toDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("File conversion failed"));
    reader.readAsDataURL(file);
  });

type UploadResult = {
  ok: boolean;
  imageUrl: string;
  error?: string;
};

export default function AdminDashboard() {
  const [data, setData] = useState<DiagnosisItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [opsBookings, setOpsBookings] = useState<ServiceBookingItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [showcaseImages, setShowcaseImages] = useState<ShowcaseImage[]>([]);
  const [opsAnalytics, setOpsAnalytics] = useState<OpsAnalytics | null>(null);
  const [selectedStatusByBooking, setSelectedStatusByBooking] = useState<Record<string, ServiceBookingItem["status"]>>({});
  const [selectedStatusByOrder, setSelectedStatusByOrder] = useState<Record<string, OrderItem["orderStatus"]>>({});
  const [finalCostByBooking, setFinalCostByBooking] = useState<Record<string, string>>({});
  const [galleryCaption, setGalleryCaption] = useState("");
  const [galleryFile, setGalleryFile] = useState<File | null>(null);
  const [galleryDragActive, setGalleryDragActive] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [deletingImageIds, setDeletingImageIds] = useState<Record<string, boolean>>({});
  const [generatingInvoiceByOrder, setGeneratingInvoiceByOrder] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<DiagnosisItem | null>(null);
  const [newProd, setNewProd] = useState<NewProduct>(initialProduct);
  const [ageYears, setAgeYears] = useState("0");
  const [ageMonthsPart, setAgeMonthsPart] = useState("0");
  const [warrantyDuration, setWarrantyDuration] = useState("12");
  const [warrantyDurationUnit, setWarrantyDurationUnit] = useState<"MONTHS" | "YEARS">("MONTHS");
  const [isUploading, setIsUploading] = useState(false);
  const [isSuggestingPrice, setIsSuggestingPrice] = useState(false);
  const router = useRouter();

  const resetProductForm = () => {
    setNewProd(initialProduct);
    setAgeYears("0");
    setAgeMonthsPart("0");
    setWarrantyDuration("12");
    setWarrantyDurationUnit("MONTHS");
  };

  const handleProductTypeChange = (nextType: "NEW" | "REFURBISHED") => {
    if (nextType === "REFURBISHED") {
      setNewProd((prev) => ({
        ...prev,
        productType: "REFURBISHED",
        conditionScore: prev.conditionScore || "9",
        warrantyType: "SHOP",
        warrantyCertificateUrl: prev.warrantyCertificateUrl || DEFAULT_CERTIFICATE_LINE,
      }));
      setWarrantyDuration("6");
      setWarrantyDurationUnit("MONTHS");
      return;
    }

    setNewProd((prev) => ({
      ...prev,
      productType: "NEW",
      conditionScore: "",
      ageMonths: "",
      warrantyType: "BRAND",
      warrantyCertificateUrl: "",
    }));
    setAgeYears("0");
    setAgeMonthsPart("0");
    setWarrantyDuration("12");
    setWarrantyDurationUnit("MONTHS");
  };

  useEffect(() => {
    const checkAdmin = () => {
      const savedUser = localStorage.getItem("user");
      const user = savedUser ? JSON.parse(savedUser) : null;
      if (!user || (user.email !== "mdatharsbr@gmail.com" && user.role !== "ADMIN")) {
        router.push("/");
        return false;
      }
      return true;
    };

    const fetchAdminData = async () => {
      if (!checkAdmin()) return;

      try {
        const [dataRes, statsRes, serviceRes, opsRes, galleryRes, ordersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/all-diagnoses`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/service-overview`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/ops/analytics`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders`),
        ]);
        const dataPayload = await dataRes.json();
        let statsPayload = await statsRes.json().catch(() => null);
        const servicePayload = await serviceRes.json().catch(() => null);
        const opsPayload = await opsRes.json().catch(() => null);
        const galleryPayload = await galleryRes.json().catch(() => null);
        const ordersPayload = await ordersRes.json().catch(() => null);

        // Fallback to basic stats if enriched stats endpoint is unavailable.
        if (!statsRes.ok || !statsPayload || statsPayload?.error) {
          const basicRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats-basic`);
          statsPayload = await basicRes.json().catch(() => null);
        }

        const normalizedStats =
          statsPayload && typeof statsPayload === "object"
            ? {
                ...statsPayload,
                totalBookings: Number((statsPayload as DashboardStats).totalBookings || 0),
                totalUsers: Number((statsPayload as DashboardStats).totalUsers || 0),
                totalProducts: Number((statsPayload as DashboardStats).totalProducts || 0),
              }
            : null;

        setData(Array.isArray(dataPayload) ? dataPayload : []);
        setStats(normalizedStats);
        setOpsBookings(Array.isArray(servicePayload?.bookings) ? servicePayload.bookings : []);
        setShowcaseImages(Array.isArray(galleryPayload) ? galleryPayload : []);
        setOrders(Array.isArray(ordersPayload) ? ordersPayload : []);
        setOpsAnalytics(opsPayload && typeof opsPayload === "object" ? opsPayload : null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, [router]);

  const uploadViaBackend = async (file: File): Promise<UploadResult> => {
    try {
      const fileData = await toDataUrl(file);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileData, fileName: file.name }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.imageUrl) {
        return { ok: false, imageUrl: "", error: payload?.error || "Backend upload failed." };
      }
      return { ok: true, imageUrl: payload.imageUrl as string };
    } catch {
      return { ok: false, imageUrl: "", error: "Backend is unreachable." };
    }
  };

  const uploadViaUnsignedCloudinary = async (file: File): Promise<UploadResult> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "athar_unsigned");

      const res = await fetch("https://api.cloudinary.com/v1_1/dloe4yd7c/image/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok || !payload?.secure_url) {
        return { ok: false, imageUrl: "", error: payload?.error?.message || "Unsigned upload failed." };
      }
      return { ok: true, imageUrl: payload.secure_url as string };
    } catch {
      return { ok: false, imageUrl: "", error: "Cloudinary unsigned upload failed." };
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }

    setIsUploading(true);
    const backendUpload = await uploadViaBackend(file);
    const finalUpload = backendUpload.ok ? backendUpload : await uploadViaUnsignedCloudinary(file);

    if (finalUpload.ok) {
      setNewProd((prev) => ({ ...prev, imageUrl: finalUpload.imageUrl }));
      toast.success("Image uploaded successfully.");
    } else {
      console.error("Upload failed:", {
        backend: backendUpload.error,
        fallback: finalUpload.error,
      });
      toast.error(
        `Upload failed. Backend: ${backendUpload.error || "unknown"} | Fallback: ${finalUpload.error || "unknown"}`
      );
    }
    setIsUploading(false);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/delete-product/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Product deleted.");
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const savedUser = localStorage.getItem("user");
    const user = savedUser ? JSON.parse(savedUser) : null;
    if (!user) return toast.error("Login required.");
    if (!newProd.imageUrl) return toast.error("Please upload a product image first.");
    const isRefurbished = newProd.productType === "REFURBISHED";
    const totalAgeMonths = (Number(ageYears || 0) * 12) + Number(ageMonthsPart || 0);
    const computedWarrantyExpiry = toWarrantyExpiryFromDuration(warrantyDuration, warrantyDurationUnit);
    const payload: NewProduct = {
      ...newProd,
      conditionScore: isRefurbished ? (newProd.conditionScore || "9") : "",
      ageMonths: isRefurbished ? String(totalAgeMonths) : "",
      warrantyType: isRefurbished ? (newProd.warrantyType || "SHOP") : newProd.warrantyType,
      warrantyExpiry: computedWarrantyExpiry,
      warrantyCertificateUrl:
        isRefurbished
          ? (newProd.warrantyCertificateUrl.trim() || DEFAULT_CERTIFICATE_LINE)
          : newProd.warrantyCertificateUrl,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/add-product`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, sellerId: user.id }),
      });

      if (res.ok) {
        toast.success("Product listed successfully.");
        resetProductForm();
        window.location.reload();
      } else {
        const payload = await res.json();
        toast.error(`${payload?.error || "Unable to add product."}${payload?.details ? `\n${payload.details}` : ""}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuggestPrice = async () => {
    if (!newProd.price) return toast.error("Please enter base price first.");
    const totalAgeMonths = (Number(ageYears || 0) * 12) + Number(ageMonthsPart || 0);
    setIsSuggestingPrice(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/suggest-price`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          basePrice: newProd.price,
          conditionScore: newProd.conditionScore,
          ageMonths: newProd.productType === "REFURBISHED" ? totalAgeMonths : 0,
          productType: newProd.productType,
          title: newProd.title,
          description: newProd.description,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        toast.error(payload?.error || "Unable to suggest price.");
      } else {
        setNewProd((prev) => ({ ...prev, price: String(payload.suggestedPrice || prev.price) }));
        toast.success(
          `AI Suggested Range: ₹${payload.recommendedMin} - ₹${payload.recommendedMax}\n` +
          `Quick Sale Price: ₹${payload.quickSalePrice}\n` +
          `Premium Listing Price: ₹${payload.premiumListingPrice}\n` +
          `Confidence: ${Math.round((payload.confidenceScore || 0) * 100)}%\n` +
          `Comparables Used: ${payload.marketSampleSize || 0}`
        );
      }
    } catch (err) {
      console.error(err);
      toast.error("Price suggestion failed.");
    } finally {
      setIsSuggestingPrice(false);
    }
  };

  const refreshServiceOps = async () => {
    try {
      const [serviceRes, opsRes, galleryRes, ordersRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/service-overview`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/ops/analytics`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/gallery`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders`),
      ]);
      const servicePayload = await serviceRes.json().catch(() => null);
      const opsPayload = await opsRes.json().catch(() => null);
      const galleryPayload = await galleryRes.json().catch(() => null);
      const ordersPayload = await ordersRes.json().catch(() => null);
      setOpsBookings(Array.isArray(servicePayload?.bookings) ? servicePayload.bookings : []);
      setShowcaseImages(Array.isArray(galleryPayload) ? galleryPayload : []);
      setOrders(Array.isArray(ordersPayload) ? ordersPayload : []);
      setOpsAnalytics(opsPayload && typeof opsPayload === "object" ? opsPayload : null);
    } catch (err) {
      console.error(err);
    }
  };

  const updateBookingStatus = async (
    bookingId: string,
    status: "PENDING" | "ASSIGNED" | "OUT_FOR_REPAIR" | "REPAIRING" | "FIXED" | "COMPLETED",
    finalCost?: string,
  ) => {
    const parsedFinalCost = finalCost && finalCost.trim() ? Number(finalCost) : undefined;
    const previousBookings = [...opsBookings];
    setOpsBookings((prev) =>
      prev.map((booking) =>
        booking.id === bookingId
          ? {
              ...booking,
              status,
              finalCost: Number.isFinite(parsedFinalCost) ? parsedFinalCost : booking.finalCost,
            }
          : booking,
      ),
    );

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/service/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          finalCost: Number.isFinite(parsedFinalCost) ? parsedFinalCost : undefined,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setOpsBookings(previousBookings);
        return toast.error(payload?.error || "Failed to update booking status.");
      }
      if (payload?.booking) {
        setOpsBookings((prev) =>
          prev.map((booking) => (booking.id === bookingId ? { ...booking, ...(payload.booking as ServiceBookingItem) } : booking)),
        );
      }
      if (status === "FIXED") {
        toast.success("Bill generated and payment request pushed to customer screen.");
      }
      await refreshServiceOps();
    } catch (err) {
      console.error(err);
      setOpsBookings(previousBookings);
      toast.error("Status update failed.");
    }
  };

  const uploadGalleryItem = async () => {
    if (!galleryFile) return toast.error("Please choose an image or video first.");
    setGalleryUploading(true);
    try {
      const fileData = await toDataUrl(galleryFile);
      const mediaType: "image" | "video" = galleryFile.type.startsWith("video/") ? "video" : "image";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/gallery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileData,
          mediaType,
          caption: galleryCaption.trim() || null,
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) return toast.error(payload?.error || "Failed to upload gallery item.");
      toast.success("Live gallery updated.");
      if (payload?.id && payload?.imageUrl) {
        setShowcaseImages((prev) => [
          {
            id: String(payload.id),
            imageUrl: String(payload.imageUrl),
            mediaType: payload?.mediaType === "video" ? "video" : mediaType,
            caption: payload?.caption || galleryCaption || null,
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        await refreshServiceOps();
      }
      setGalleryCaption("");
      setGalleryFile(null);
    } catch (err) {
      console.error(err);
      toast.error("Gallery upload failed.");
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleDeleteImage = async (id: string) => {
    if (!id) return;
    if (!confirm("Delete this gallery image?")) return;

    const previousImages = [...showcaseImages];
    setDeletingImageIds((prev) => ({ ...prev, [id]: true }));
    setShowcaseImages((prev) => prev.filter((image) => image.id !== id));

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/gallery/${id}`, {
        method: "DELETE",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setShowcaseImages(previousImages);
        toast.error(payload?.error || "Failed to delete image.");
      }
    } catch (err) {
      console.error(err);
      setShowcaseImages(previousImages);
      toast.error("Failed to delete image.");
    } finally {
      setDeletingImageIds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    orderStatus: OrderItem["orderStatus"],
  ) => {
    const previousOrders = [...orders];
    setOrders((prev) =>
      prev.map((order) => (order.id === orderId ? { ...order, orderStatus } : order)),
    );

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderStatus }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        setOrders(previousOrders);
        return toast.error(payload?.error || "Failed to update order status.");
      }
      if (payload?.order) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? payload.order : order)));
      }
    } catch (err) {
      console.error(err);
      setOrders(previousOrders);
      toast.error("Failed to update order status.");
    }
  };

  const handleGenerateOrderBill = async (orderId: string) => {
    setGeneratingInvoiceByOrder((prev) => ({ ...prev, [orderId]: true }));
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}/generate-invoice`, {
        method: "POST",
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        return toast.error(payload?.error || "Failed to generate order bill.");
      }
      if (payload?.order) {
        setOrders((prev) => prev.map((order) => (order.id === orderId ? payload.order : order)));
      }
      if (payload?.invoiceUrl) {
        window.open(payload.invoiceUrl, "_blank", "noopener,noreferrer");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate order bill.");
    } finally {
      setGeneratingInvoiceByOrder((prev) => {
        const next = { ...prev };
        delete next[orderId];
        return next;
      });
    }
  };

  const downloadServiceDoc = async (docType: "invoice" | "warranty-certificate" | "service-report", bookingId?: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/docs/${docType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: bookingId || "ADMIN",
          amount: 2500,
          gst: 18,
          signature: "Golden Refrigeration Digital Sign",
          notes: "Generated from admin operations panel",
        }),
      });
      if (!res.ok) return toast.error("Failed to generate document.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${docType}-${bookingId || "admin"}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6">
        <div className="mx-auto grid max-w-7xl gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={`admin-skeleton-${i}`} className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
              <div className="h-5 w-40 animate-pulse rounded bg-slate-700" />
              <div className="mt-3 h-10 w-28 animate-pulse rounded bg-slate-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const safeData = Array.isArray(data) ? data : [];
  const safeLatestProducts = Array.isArray(stats?.latestProducts) ? stats.latestProducts : [];
  const safeApplianceStats = Array.isArray(stats?.applianceStats) ? stats.applianceStats : [];
  const safeBookings = Array.isArray(opsBookings) ? opsBookings : [];
  const activeQueue = safeBookings.filter((service) =>
    ["PENDING", "ASSIGNED", "OUT_FOR_REPAIR", "REPAIRING", "ON_WAY"].includes(String(service.status)),
  );
  const completedOperations = safeBookings.filter((service) =>
    ["FIXED", "COMPLETED"].includes(String(service.status)),
  );
  const activeServiceCount = activeQueue.length;
  const fixedReadyCount = safeBookings.filter((booking) => booking.status === "FIXED").length;
  return (
    <main className="min-h-screen px-4 sm:px-6 py-8 bg-[radial-gradient(circle_at_top_right,#0f172a_0%,#020617_45%,#000814_100%)]">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="rounded-3xl border border-cyan-400/20 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-8 shadow-2xl shadow-cyan-900/20">
          <p className="text-xs uppercase tracking-[0.2em] font-semibold text-cyan-300 mb-2">Admin Control Center</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Golden Refrigeration Dashboard</h1>
          <p className="text-slate-300 mt-2 max-w-2xl">Manage products, monitor service consultations, and keep inventory operations in one place.</p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-blue-950/30 transition-all hover:border-blue-500/40">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Active Services</p>
            <h2 className="mt-2 text-3xl font-black text-cyan-300">{activeServiceCount}</h2>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-blue-950/30 transition-all hover:border-emerald-500/40">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Ready for Payment</p>
            <h2 className="mt-2 text-3xl font-black text-emerald-300">{fixedReadyCount}</h2>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-blue-950/30 transition-all hover:border-blue-500/40">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Conversion</p>
            <h2 className="mt-2 text-3xl font-black text-cyan-300">{opsAnalytics?.conversionRate ?? 0}%</h2>
          </article>
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-lg shadow-blue-950/30 transition-all hover:border-blue-500/40">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-semibold">Avg SLA</p>
            <h2 className="mt-2 text-3xl font-black text-cyan-300">{opsAnalytics?.avgSlaHours ?? 0}h</h2>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-blue-950/30">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-cyan-300">E-Commerce Ops</p>
              <h3 className="text-xl font-black text-white mt-1">Live Orders Controller</h3>
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
              {orders.length} orders
            </span>
          </div>

          <div className="space-y-3 max-h-[36rem] overflow-auto pr-1">
            {orders.map((order) => {
              const status = selectedStatusByOrder[order.id] || order.orderStatus;
              const isGeneratingInvoice = Boolean(generatingInvoiceByOrder[order.id]);
              return (
                <article
                  key={order.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/90 p-4 transition-all duration-300 hover:border-blue-500/50"
                >
                  <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
                    <div className="space-y-1.5">
                      <p className="text-sm font-semibold text-white">{order.productTitle}</p>
                      <p className="text-xs text-cyan-300 font-semibold">₹{Number(order.price || 0).toLocaleString("en-IN")}</p>
                      <p className="text-xs text-slate-300">
                        Customer: <span className="font-semibold">{order.customerName || order.userName || "Unknown"}</span>
                        {order.userEmail ? ` · ${order.userEmail}` : ""}
                      </p>
                      <p className="text-xs text-slate-300">
                        Phone: <span className="font-semibold">{order.deliveryPhone || "N/A"}</span>
                      </p>
                      <p className="text-xs text-slate-300">
                        Address: <span className="font-semibold">{order.deliveryAddress || "N/A"}</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Placed: {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                      </p>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 lg:w-56">
                      <select
                        value={status}
                        onChange={(e) => {
                          const next = e.target.value as OrderItem["orderStatus"];
                          setSelectedStatusByOrder((prev) => ({ ...prev, [order.id]: next }));
                          updateOrderStatus(order.id, next);
                        }}
                        className="w-full rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-100"
                      >
                        <option value="ORDER_PLACED">Order Placed</option>
                        <option value="DISPATCHED">Dispatched</option>
                        <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                        <option value="DELIVERED">Delivered</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => handleGenerateOrderBill(order.id)}
                        disabled={isGeneratingInvoice}
                        className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:opacity-60"
                      >
                        {isGeneratingInvoice ? "Generating..." : "Generate & Send Bill"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
            {!orders.length && (
              <p className="text-xs text-slate-400">No incoming product orders yet.</p>
            )}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-blue-950/30">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Live Service Controller</h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
                {activeQueue.length} active
              </span>
            </div>
            <div className="space-y-3 max-h-[520px] overflow-auto pr-1">
              {activeQueue.map((service) => {
                const selectedStatus = selectedStatusByBooking[service.id] || service.status;
                const draftFinalCost = finalCostByBooking[service.id] ?? (service.finalCost ? String(service.finalCost) : "");
                return (
                  <article
                    key={service.id}
                    className="rounded-xl border border-slate-700 bg-slate-900 p-3 transition-all duration-300 hover:border-blue-500/40 hover:shadow-md hover:shadow-blue-900/20"
                  >
                    <p className="text-sm font-semibold text-slate-100">{service.appliance}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{new Date(service.scheduledAt).toLocaleString()}</p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Customer: {service.contactName || service.customer?.name || "Unknown"}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Phone: {service.contactPhone || "Not provided"}
                    </p>
                    <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">
                      Address: {service.address || "Not provided"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Technician: {service.technician?.name || "Unassigned"}</p>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                      <select
                        value={selectedStatus}
                        onChange={(e) => {
                          const nextStatus = e.target.value as ServiceBookingItem["status"];
                          if (nextStatus === "FIXED" && !draftFinalCost.trim()) {
                            toast.error("Please enter final cost before moving to FIXED.");
                            return;
                          }
                          setSelectedStatusByBooking((prev) => ({ ...prev, [service.id]: nextStatus }));
                          updateBookingStatus(service.id, nextStatus, nextStatus === "FIXED" ? draftFinalCost : undefined);
                        }}
                        className="w-full p-2 rounded-md bg-slate-800 border border-slate-600 text-slate-100 text-xs"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="ASSIGNED">ASSIGNED</option>
                        <option value="OUT_FOR_REPAIR">ON_WAY</option>
                        <option value="REPAIRING">REPAIRING</option>
                        <option value="FIXED">FIXED</option>
                        <option value="COMPLETED">COMPLETED</option>
                      </select>
                      <input
                        value={draftFinalCost}
                        onChange={(e) => setFinalCostByBooking((prev) => ({ ...prev, [service.id]: e.target.value }))}
                        placeholder="Final Cost ₹"
                        className="w-full sm:w-32 p-2 rounded-md bg-slate-800 border border-slate-600 text-slate-100 text-xs"
                      />
                    </div>
                  </article>
                );
              })}
              {!activeQueue.length && <p className="text-xs text-slate-400">No active services in queue.</p>}
            </div>
          </article>

          <article className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-blue-950/30">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-black text-white">Completed Operations Log</h3>
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
                {completedOperations.length} completed
              </span>
            </div>
            <div className="space-y-2 max-h-[520px] overflow-auto pr-1">
              {completedOperations.map((service) => (
                <article
                  key={service.id}
                  className="rounded-xl border border-slate-700 bg-slate-900/80 p-3 transition-all duration-300 hover:border-emerald-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{service.appliance}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{new Date(service.scheduledAt).toLocaleString()}</p>
                      <p className="text-xs text-emerald-300 mt-1">Final Cost: ₹{Number(service.finalCost || 0).toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => downloadServiceDoc("invoice", service.id)}
                      className="rounded-lg border border-slate-600 bg-transparent px-3 py-1.5 text-xs font-semibold text-slate-300 hover:border-cyan-400/60 hover:text-cyan-200"
                    >
                      View Invoice
                    </button>
                  </div>
                </article>
              ))}
              {!completedOperations.length && <p className="text-xs text-slate-400">No completed services yet.</p>}
            </div>
          </article>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-xl shadow-blue-950/30">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] font-semibold text-cyan-300">Media Manager</p>
              <h3 className="text-xl font-black text-white mt-1">On-Site Work Showcase</h3>
            </div>
            <button
              onClick={refreshServiceOps}
              className="text-xs px-3 py-1.5 rounded-lg border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500/10"
            >
              Refresh
            </button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 rounded-xl border border-dashed border-slate-600 bg-slate-900 p-5">
              <p className="text-sm text-slate-300 mb-3">Upload Live Repair Photos / Videos</p>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setGalleryDragActive(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setGalleryDragActive(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setGalleryDragActive(false);
                  const dropped = e.dataTransfer.files?.[0];
                  if (dropped && (dropped.type.startsWith("image/") || dropped.type.startsWith("video/"))) {
                    setGalleryFile(dropped);
                  }
                }}
                className={`rounded-lg border border-dashed p-6 text-center transition ${
                  galleryDragActive ? "border-cyan-400 bg-cyan-500/10" : "border-slate-700 bg-slate-900"
                }`}
              >
                <p className="text-sm text-slate-300">Drop image/video here or browse file</p>
                <input
                  type="file"
                  accept="image/*,video/mp4,video/webm"
                  onChange={(e) => setGalleryFile(e.target.files?.[0] || null)}
                  className="mt-3 w-full text-xs text-slate-300 file:mr-2 file:rounded-md file:border file:border-cyan-500/40 file:bg-cyan-500/20 file:px-3 file:py-1.5 file:text-cyan-200"
                />
                {galleryFile && <p className="mt-2 text-xs text-cyan-300">{galleryFile.name}</p>}
              </div>
              <input
                value={galleryCaption}
                onChange={(e) => setGalleryCaption(e.target.value)}
                placeholder="Caption for this repair photo"
                className="mt-3 w-full rounded-md border border-slate-600 bg-slate-800 px-3 py-2.5 text-sm text-slate-100"
              />
              <button
                onClick={uploadGalleryItem}
                disabled={galleryUploading}
                className="mt-3 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
              >
                {galleryUploading ? "Uploading..." : "Publish Showcase Image"}
              </button>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs uppercase tracking-wide text-slate-300 font-semibold">Recent Uploads</p>
                <span className="text-[11px] text-slate-400">{showcaseImages.length} media files</span>
              </div>
              <div className="space-y-3 max-h-[28rem] overflow-auto pr-1">
                {showcaseImages.map((item) => {
                  const isDeleting = Boolean(deletingImageIds[item.id]);
                  const isVideo =
                    item.mediaType === "video" ||
                    item.imageUrl.toLowerCase().includes(".mp4") ||
                    item.imageUrl.toLowerCase().includes(".webm");
                  return (
                    <article
                      key={item.id}
                      className="overflow-hidden rounded-lg border border-slate-700 bg-slate-800/90 transition-all duration-300 hover:border-cyan-400/40"
                    >
                      {isVideo ? (
                        <video
                          src={item.imageUrl}
                          controls
                          preload="metadata"
                          className="h-28 w-full object-cover"
                        />
                      ) : (
                        <img src={item.imageUrl} alt={item.caption || "Showcase"} className="h-28 w-full object-cover" />
                      )}
                      <div className="p-2.5 flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-[11px] text-slate-200 truncate">
                            {item.caption || "Live repair snapshot"}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {item.createdAt ? new Date(item.createdAt).toLocaleString() : "Uploaded image"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(item.id)}
                          disabled={isDeleting}
                          className="inline-flex items-center justify-center rounded-md border border-red-500/50 bg-red-500/10 p-2 text-red-300 hover:bg-red-500 hover:text-white disabled:opacity-60"
                          aria-label="Delete gallery image"
                          title="Delete image"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
                {!showcaseImages.length && <p className="text-xs text-slate-400">No showcase images uploaded yet.</p>}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="space-y-8 lg:col-span-3 lg:order-2">
            <div className="bg-slate-900/60 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
              <div className="px-5 sm:px-6 py-5 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800">
                <h3 className="text-xl font-black text-white">Customer consultations</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="hidden w-full text-left md:table">
                  <thead className="bg-slate-800/80 text-xs uppercase tracking-wide text-slate-300 font-semibold">
                    <tr>
                      <th className="px-6 py-3">Customer</th>
                      <th className="px-6 py-3">Appliance</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {safeData.map((item) => (
                      <tr key={item.id} className="hover:bg-cyan-500/10 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-100 text-sm">{item.customer?.name || "Unknown"}</p>
                          <p className="text-xs text-slate-400">{item.customer?.email || "No email"}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-800 text-slate-200 px-3 py-1 rounded-full text-xs font-semibold uppercase border border-slate-700">
                            {item.appliance}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase">
                            <span className="h-2 w-2 bg-cyan-400 rounded-full" />
                            Processed
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setSelectedLog(item)}
                            className="bg-cyan-500 text-slate-900 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-cyan-400 shadow-sm"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="space-y-3 p-4 md:hidden">
                  {safeData.map((item) => (
                    <article
                      key={item.id}
                      className="rounded-xl border border-slate-700 bg-slate-900 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-100">{item.customer?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-400">{item.customer?.email || "No email"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] font-semibold uppercase text-slate-300">
                          {item.appliance}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-cyan-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                          Processed
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedLog(item)}
                        className="mt-3 min-h-[48px] w-full rounded-lg bg-cyan-500 px-4 py-2 text-xs font-semibold text-slate-900 transition-transform hover:bg-cyan-400 active:scale-95"
                      >
                        View
                      </button>
                    </article>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 rounded-2xl border border-slate-700 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xl font-black text-white">Live inventory</h3>
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-300 bg-slate-800 border border-slate-700 px-3 py-1 rounded-full">
                  {stats?.latestProducts?.length || 0} products
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {safeLatestProducts.map((p) => {
                  const normalizedType = p.productType || (p.isUsed ? "REFURBISHED" : "NEW");
                  return (
                  <article
                    key={p.id}
                    className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl border border-slate-700 hover:border-red-400/60 hover:shadow-lg hover:shadow-red-900/20 transition-all group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-11 h-11 rounded-lg overflow-hidden bg-slate-800 border border-slate-700 shrink-0 shadow-sm">
                        {getImageUrl(p.images) ? (
                          <img src={getImageUrl(p.images) || ""} className="w-full h-full object-cover" alt={p.title} />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-slate-400">❄️</div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-100 text-sm truncate">{p.title}</p>
                        <p className="text-xs text-cyan-300 font-semibold">₹{p.price.toLocaleString()}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-400/30 text-cyan-300 bg-cyan-400/10">
                            {normalizedType}
                          </span>
                          {typeof p.conditionScore === "number" && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-emerald-400/30 text-emerald-300 bg-emerald-400/10">
                              {p.conditionScore}/10
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteProduct(p.id)}
                      className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-300 border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-red-500 hover:text-white hover:border-red-400 transition-all"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="none" aria-hidden="true">
                        <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12h10l1-12M9 7V5h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      </svg>
                      Delete
                    </button>
                  </article>
                );
                })}
              </div>
            </div>
          </div>

          <div className="space-y-8 lg:col-span-3 lg:order-1">
            <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 shadow-xl">
              <h3 className="text-xl font-black text-white mb-5">Add product</h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Required: Product title, Price, Product image.
                <br />
                Optional: Condition, Age, Warranty fields.
              </p>
              <form onSubmit={handleAddProduct} className="space-y-4">
                <input
                  type="text"
                  placeholder="Product title (Required)"
                  className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                  value={newProd.title}
                  onChange={(e) => setNewProd({ ...newProd, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Short description (Optional)"
                  className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 min-h-[90px]"
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Price in ₹ (Required)"
                  className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                  value={newProd.price}
                  onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
                  required
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={newProd.productType}
                    onChange={(e) => handleProductTypeChange(e.target.value as "NEW" | "REFURBISHED")}
                    className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                  >
                    <option value="NEW">NEW</option>
                    <option value="REFURBISHED">REFURBISHED</option>
                  </select>
                </div>

                {newProd.productType === "NEW" ? (
                  <section className="rounded-xl border border-slate-700 bg-slate-800/50 p-4 space-y-3">
                    <h4 className="text-sm font-bold text-cyan-200 uppercase tracking-wide">New Product Section</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 block mb-1.5">Warranty Type</label>
                        <select
                          value={newProd.warrantyType}
                          onChange={(e) => setNewProd({ ...newProd, warrantyType: e.target.value as "" | "BRAND" | "SHOP" })}
                          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                        >
                          <option value="">Select warranty type</option>
                          <option value="BRAND">Brand Warranty</option>
                          <option value="SHOP">Shop Warranty</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1.5">Warranty Duration</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={warrantyDuration}
                            onChange={(e) => setWarrantyDuration(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                          >
                            {WARRANTY_DURATION_OPTIONS.map((value) => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                          <select
                            value={warrantyDurationUnit}
                            onChange={(e) => setWarrantyDurationUnit(e.target.value as "MONTHS" | "YEARS")}
                            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                          >
                            <option value="MONTHS">Months</option>
                            <option value="YEARS">Years</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </section>
                ) : (
                  <section className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-4 space-y-3">
                    <h4 className="text-sm font-bold text-cyan-200 uppercase tracking-wide">Refurbished / Second-Hand Section</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 block mb-1.5">Condition Score</label>
                        <select
                          value={newProd.conditionScore}
                          onChange={(e) => setNewProd({ ...newProd, conditionScore: e.target.value })}
                          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                        >
                          {Array.from({ length: 10 }, (_, idx) => {
                            const value = String(idx + 1);
                            return <option key={value} value={value}>{value}/10</option>;
                          })}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1.5">Age of Product</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={ageYears}
                            onChange={(e) => setAgeYears(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                          >
                            {YEAR_OPTIONS.map((value) => (
                              <option key={value} value={value}>{value} year</option>
                            ))}
                          </select>
                          <select
                            value={ageMonthsPart}
                            onChange={(e) => setAgeMonthsPart(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                          >
                            {MONTH_OPTIONS.map((value) => (
                              <option key={value} value={value}>{value} month</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-300 block mb-1.5">Warranty Type</label>
                        <select
                          value={newProd.warrantyType}
                          onChange={(e) => setNewProd({ ...newProd, warrantyType: e.target.value as "" | "BRAND" | "SHOP" })}
                          className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                        >
                          <option value="SHOP">Shop Warranty</option>
                          <option value="BRAND">Brand Warranty</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-slate-300 block mb-1.5">Warranty Duration</label>
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            value={warrantyDuration}
                            onChange={(e) => setWarrantyDuration(e.target.value)}
                            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                          >
                            {WARRANTY_DURATION_OPTIONS.map((value) => (
                              <option key={value} value={value}>{value}</option>
                            ))}
                          </select>
                          <select
                            value={warrantyDurationUnit}
                            onChange={(e) => setWarrantyDurationUnit(e.target.value as "MONTHS" | "YEARS")}
                            className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                          >
                            <option value="MONTHS">Months</option>
                            <option value="YEARS">Years</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-slate-300 block mb-1.5">Warranty Certificate Note</label>
                      <input
                        type="text"
                        placeholder={DEFAULT_CERTIFICATE_LINE}
                        className="w-full p-3.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400"
                        value={newProd.warrantyCertificateUrl}
                        onChange={(e) => setNewProd({ ...newProd, warrantyCertificateUrl: e.target.value })}
                      />
                    </div>
                  </section>
                )}
                <button
                  type="button"
                  onClick={handleSuggestPrice}
                  disabled={isSuggestingPrice}
                  className="w-full bg-slate-800 text-cyan-300 border border-cyan-400/40 font-semibold py-3 rounded-xl hover:bg-cyan-500/20 disabled:opacity-60"
                >
                  {isSuggestingPrice ? "Suggesting..." : "AI Suggest Price (Bhaiya Final Decision)"}
                </button>

                <div className="border border-dashed border-slate-600 p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800">
                  <p className="text-xs uppercase tracking-wide font-semibold text-slate-300 mb-2">Product image</p>
                  <input
                    type="file"
                    onChange={handleFileUpload}
                    className="text-xs w-full cursor-pointer text-slate-300 file:bg-cyan-500/20 file:border file:border-cyan-400/40 file:rounded-lg file:px-3 file:py-1.5 file:text-cyan-300 file:font-semibold"
                    accept="image/*"
                  />
                  {isUploading && <p className="mt-2 text-cyan-300 text-xs font-semibold">Uploading image...</p>}
                  {newProd.imageUrl && (
                    <div className="mt-3 w-full h-28 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <img src={newProd.imageUrl} className="w-full h-full object-contain" alt="Preview" />
                    </div>
                  )}
                </div>

                <button
                  disabled={isUploading}
                  className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 font-semibold py-3.5 rounded-xl hover:from-cyan-300 hover:to-blue-400 disabled:opacity-60 shadow-md shadow-cyan-700/40"
                >
                  {isUploading ? "Please wait..." : "List Product"}
                </button>
              </form>
            </div>

            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 text-white p-6 rounded-2xl shadow-xl shadow-blue-900/30 border border-slate-700">
              <h3 className="text-lg font-black mb-5 text-cyan-300">Appliance trend</h3>
              <div className="space-y-4">
                  {safeApplianceStats.map((s, i) => (
                  <div key={`${s.appliance}-${i}`}>
                    <div className="flex justify-between text-xs uppercase tracking-wide mb-1 text-slate-200">
                      <span>{s.appliance}</span>
                      <span>{s._count._all}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400"
                        style={{ width: `${(s._count._all / (stats?.totalBookings || 1)) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/45 p-0 backdrop-blur-sm md:items-center md:p-4">
          <div className="relative w-full max-w-xl rounded-t-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl sm:p-8 md:rounded-3xl">
            <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-slate-600 md:hidden" />
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white text-2xl font-semibold"
            >
              ×
            </button>
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300 font-semibold">{selectedLog.appliance}</p>
            <h3 className="text-2xl font-black text-white mt-2">Diagnosis report</h3>
            <p className="text-sm text-slate-400 mt-1">Customer: {selectedLog.customer?.name || "Unknown"}</p>

            <div className="space-y-4 mt-6">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-slate-100">{selectedLog.issue}</div>
              <div className="text-slate-300 leading-relaxed whitespace-pre-wrap text-sm">{selectedLog.aiDiagnosis}</div>
            </div>

            <button
              onClick={() => setSelectedLog(null)}
              className="mt-7 w-full bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-900 py-3.5 rounded-xl font-semibold hover:from-cyan-300 hover:to-blue-400"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

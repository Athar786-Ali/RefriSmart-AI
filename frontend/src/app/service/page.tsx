"use client";

import { FormEvent, type ComponentType, useEffect, useMemo, useState } from "react";
import { AirVent, Loader2, MapPin, Microwave, Refrigerator, WashingMachine, Wrench } from "lucide-react";
import { toast } from "sonner";
import ServiceActiveTrackerCard, { type ServiceBooking } from "@/components/ServiceActiveTrackerCard";
import ServiceHistoryCard from "@/components/ServiceHistoryCard";

type GalleryItem = {
  id: string;
  imageUrl: string;
  mediaType?: "image" | "video";
  caption?: string | null;
};

type BookingFormState = {
  appliance: "Refrigerator" | "Air Conditioner" | "Washing Machine" | "Microwave Oven";
  fullName: string;
  phoneNumber: string;
  issue: string;
  address: string;
  lat: string;
  lng: string;
};

const API = process.env.NEXT_PUBLIC_API_URL;
const FALLBACK_GALLERY_IMAGE =
  "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=900&auto=format&fit=crop";
const SHOP_UPI_ID = "9060877595-2@ybl";
const SHOP_UPI_NAME = "MD ATHAR ALI";

const APPLIANCE_OPTIONS: Array<{
  label: BookingFormState["appliance"];
  icon: ComponentType<{ className?: string }>;
}> = [
  { label: "Refrigerator", icon: Refrigerator },
  { label: "Air Conditioner", icon: AirVent },
  { label: "Washing Machine", icon: WashingMachine },
  { label: "Microwave Oven", icon: Microwave },
];

const PLACEHOLDER_GALLERY: GalleryItem[] = [
  {
    id: "ph-1",
    imageUrl: "https://images.unsplash.com/photo-1621905252472-943afaa20e4b?q=80&w=900&auto=format&fit=crop",
    caption: "Compressor diagnostics on-site",
  },
  {
    id: "ph-2",
    imageUrl: "https://images.unsplash.com/photo-1594549181132-9045fed330ce?q=80&w=900&auto=format&fit=crop",
    caption: "Technician performing cooling check",
  },
  {
    id: "ph-3",
    imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45249ff2f?q=80&w=900&auto=format&fit=crop",
    caption: "Live repair at customer site",
  },
  {
    id: "ph-4",
    imageUrl: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=900&auto=format&fit=crop",
    caption: "Final quality inspection",
  },
];

const buildUpiLink = (amount?: number | null) => {
  const query = new URLSearchParams({
    pa: SHOP_UPI_ID,
    pn: SHOP_UPI_NAME,
    cu: "INR",
  });
  if (typeof amount === "number" && Number.isFinite(amount) && amount > 0) {
    query.set("am", String(amount));
  }
  return `upi://pay?${query.toString()}`;
};

export default function ServicePage() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string; email?: string } | null>(null);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [hasActiveBooking, setHasActiveBooking] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);

  const [form, setForm] = useState<BookingFormState>({
    appliance: "Refrigerator",
    fullName: "",
    phoneNumber: "",
    issue: "",
    address: "",
    lat: "",
    lng: "",
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    try {
      setCurrentUser(raw ? (JSON.parse(raw) as { id: string; name?: string; email?: string }) : null);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  const loadData = async (userId?: string) => {
    if (!API) {
      setBookings([]);
      setGallery([]);
      setHasActiveBooking(false);
      setLoading(false);
      return;
    }

    try {
      const bookingsPromise = userId
        ? fetch(`${API}/service/my-bookings?userId=${userId}`, { credentials: "include" }).then((res) => res.json().catch(() => []))
        : Promise.resolve([]);
      const galleryPromise = fetch(`${API}/gallery`, { credentials: "include" }).then((res) => res.json().catch(() => []));
      const [bookingsPayload, galleryPayload] = await Promise.all([bookingsPromise, galleryPromise]);
      const nextBookings = Array.isArray(bookingsPayload) ? (bookingsPayload as ServiceBooking[]) : [];

      setBookings(nextBookings);
      setHasActiveBooking(nextBookings.some((booking) => booking.status !== "COMPLETED"));
      setGallery(Array.isArray(galleryPayload) ? galleryPayload.slice(0, 8) : []);
    } catch {
      setBookings([]);
      setGallery([]);
      setHasActiveBooking(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    setLoading(true);
    void loadData(currentUser?.id);
  }, [isHydrated, currentUser?.id]);

  const activeBooking = useMemo(
    () => bookings.find((booking) => booking.status !== "COMPLETED") || null,
    [bookings],
  );

  const completedBookings = useMemo(
    () => bookings.filter((booking) => booking.status === "COMPLETED"),
    [bookings],
  );

  const activeBookingUpiLink = useMemo(
    () => buildUpiLink(activeBooking?.finalCost),
    [activeBooking?.finalCost],
  );

  const galleryItems = gallery.length ? gallery.slice(0, 4) : PLACEHOLDER_GALLERY;

  useEffect(() => {
    if (activeBooking?.rating) {
      setRatingValue(activeBooking.rating);
    } else {
      setRatingValue(0);
    }
  }, [activeBooking?.id, activeBooking?.rating]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || currentUser?.name || "",
    }));
  }, [currentUser?.name]);

  const onFetchMyAddress = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = String(position.coords.latitude.toFixed(6));
        const longitude = String(position.coords.longitude.toFixed(6));
        setForm((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
        }));
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } },
          );
          const payload = await res.json().catch(() => ({}));
          const resolvedAddress = String(payload?.display_name || "").trim();
          if (resolvedAddress) {
            setForm((prev) => ({ ...prev, address: resolvedAddress }));
            toast.success("Address fetched from GPS.");
          } else {
            toast.info("GPS coordinates fetched. Please fill address manually.");
          }
        } catch {
          toast.info("GPS fetched but address lookup failed. Please fill address manually.");
        } finally {
          setGpsLoading(false);
        }
      },
      () => {
        toast.error("Unable to fetch location. Please enter manually.");
        setGpsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const onSubmitBooking = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) {
      toast.error("Please login first.");
      return;
    }
    if (!form.fullName.trim() || !form.phoneNumber.trim() || !form.issue.trim() || !form.address.trim()) {
      toast.error("Full name, phone number, issue details and address are required.");
      return;
    }
    if (!/^\d{10}$/.test(form.phoneNumber.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }

    setBookingSubmitting(true);
    try {
      const res = await fetch(`${API}/service/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: currentUser.id,
          appliance: form.appliance,
          issue: form.issue,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber.replace(/\D/g, ""),
          address: form.address,
          lat: form.lat,
          lng: form.lng,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Booking failed.");

      toast.success("Service booking created successfully.");
      const createdBooking = payload?.booking as ServiceBooking | undefined;
      if (createdBooking) {
        setBookings((prev) => [createdBooking, ...prev.filter((booking) => booking.id !== createdBooking.id)]);
      } else {
        setBookings((prev) => [
          {
            id: `tmp-${Date.now()}`,
            appliance: form.appliance,
            issue: form.issue,
            status: "PENDING",
            scheduledAt: new Date().toISOString(),
            address: form.address || null,
            finalCost: null,
            invoiceUrl: null,
            rating: null,
            technician: null,
          },
          ...prev,
        ]);
      }
      setHasActiveBooking(true);
      setForm((prev) => ({ ...prev, issue: "" }));
      void loadData(currentUser.id);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Booking failed.");
    } finally {
      setBookingSubmitting(false);
    }
  };

  const onSubmitRating = async () => {
    if (!activeBooking?.id || ratingValue < 1) return;
    setRatingLoading(true);
    try {
      const res = await fetch(`${API}/service/${activeBooking.id}/rating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ rating: ratingValue }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Rating failed.");
      toast.success("Thanks for your feedback.");
      void loadData(currentUser?.id);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Rating failed.");
    } finally {
      setRatingLoading(false);
    }
  };

  const downloadInvoice = async (booking: ServiceBooking) => {
    if (booking.invoiceUrl) {
      window.open(booking.invoiceUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const res = await fetch(`${API}/docs/invoice`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ bookingId: booking.id, amount: booking.finalCost || 0, gst: 18 }),
    });
    if (!res.ok) {
      toast.error("Failed to generate invoice.");
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${booking.id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6 md:py-16">
      <div className="mx-auto max-w-7xl space-y-8">
        <ServiceActiveTrackerCard
          loading={loading}
          hasActiveBooking={hasActiveBooking}
          activeBooking={activeBooking}
          activeBookingUpiLink={activeBookingUpiLink}
          ratingValue={ratingValue}
          setRatingValue={setRatingValue}
          ratingLoading={ratingLoading}
          onSubmitRating={onSubmitRating}
          onDownloadInvoice={downloadInvoice}
          upiId={SHOP_UPI_ID}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900">Quick Booking Desk</h3>
          <p className="mt-1 text-sm text-slate-600">Book a technician with customer details, readable address, and GPS-assisted lookup.</p>

          <form className="mt-4 space-y-4" onSubmit={onSubmitBooking}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {APPLIANCE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const selected = form.appliance === option.label;
                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, appliance: option.label }))}
                    className={`flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                      selected
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-300"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                placeholder="Full Name"
                required
              />
              <input
                value={form.phoneNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                placeholder="Phone Number"
                inputMode="numeric"
                required
              />
            </div>

            <textarea
              value={form.issue}
              onChange={(e) => setForm((prev) => ({ ...prev, issue: e.target.value }))}
              className="min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              placeholder="Describe your appliance problem"
              required
            />

            <textarea
              value={form.address}
              onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
              className="min-h-24 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
              placeholder="Full service address (editable)"
              required
            />

            <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
              <button
                type="button"
                onClick={onFetchMyAddress}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-blue-300 bg-blue-50 px-3 py-3 text-xs font-semibold text-blue-700 transition-transform hover:bg-blue-100 active:scale-95"
              >
                {gpsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
                Fetch My Address
              </button>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
                GPS Coordinates: {form.lat && form.lng ? `${form.lat}, ${form.lng}` : "Not fetched yet"}
              </div>
            </div>

            <button
              type="submit"
              disabled={bookingSubmitting}
              className="min-h-[48px] w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-transform hover:bg-blue-700 active:scale-95 disabled:opacity-60"
            >
              {bookingSubmitting ? "Booking..." : "Confirm & Book Technician"}
            </button>
          </form>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <a href="tel:9060877595" className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">Call Technician</a>
            <a href="https://wa.me/919060877595" target="_blank" rel="noopener noreferrer" className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-emerald-700">WhatsApp</a>
            <a href="sms:+919060877595" className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-blue-700">Message</a>
          </div>
        </section>

        <ServiceHistoryCard completedBookings={completedBookings} onDownloadInvoice={downloadInvoice} />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Verified Live Repairs</h3>
              <p className="text-sm text-slate-600">Recent on-site technician work gallery.</p>
            </div>
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-blue-200 bg-blue-50">
              <Wrench className="h-5 w-5 text-blue-600" />
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {galleryItems.map((item) => (
              <article
                key={item.id}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-300"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  {item.mediaType === "video" || item.imageUrl.toLowerCase().includes(".mp4") || item.imageUrl.toLowerCase().includes(".webm") ? (
                    <video src={item.imageUrl} controls preload="metadata" className="h-full w-full object-cover" />
                  ) : (
                    <img
                      src={item.imageUrl}
                      alt={item.caption || "repair"}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(event) => {
                        const img = event.currentTarget;
                        img.onerror = null;
                        img.src = FALLBACK_GALLERY_IMAGE;
                      }}
                    />
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/60 to-transparent" />
                </div>
                <p className="px-3 pb-3 pt-2 text-sm font-medium text-slate-700">{item.caption || "Golden Refrigeration field repair"}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

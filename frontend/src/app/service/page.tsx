"use client";

import Link from "next/link";
import { FormEvent, type ComponentType, useEffect, useMemo, useRef, useState } from "react";
import { AirVent, Microwave, Refrigerator, WashingMachine, Navigation, Wrench } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import ServiceActiveTrackerCard, { type ServiceBooking } from "@/components/ServiceActiveTrackerCard";
import ServiceHistoryCard from "@/components/ServiceHistoryCard";
import { loadRazorpayScript, openRazorpayCheckout } from "@/lib/razorpay";

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
  pincode: string;
};

const API = process.env.NEXT_PUBLIC_API_URL;
const FALLBACK_GALLERY_IMAGE =
  "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?q=80&w=900&auto=format&fit=crop";

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

type EmptyServiceStateProps = {
  onBookNow: () => void;
};

const EmptyServiceState = ({ onBookNow }: EmptyServiceStateProps) => (
  <section className="rounded-2xl border border-dashed border-blue-200 bg-blue-50/70 p-6 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-blue-600 shadow-sm">
          <Wrench className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-slate-900">No active service requests.</h2>
          <p className="mt-1 text-sm text-slate-600">Book a technician to get started — your tracker will appear here instantly.</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onBookNow}
        className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-blue-600 px-5 text-sm font-semibold text-white transition-transform hover:bg-blue-700 active:scale-95"
      >
        Book a New Service
      </button>
    </div>
  </section>
);

export default function ServicePage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; name?: string; email?: string; phone?: string | null } | null>(null);
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [activeBooking, setActiveBooking] = useState<ServiceBooking | null>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [guestLookupLoading, setGuestLookupLoading] = useState(false);
  const [guestLookup, setGuestLookup] = useState({ bookingId: "", phone: "" });
  const [guestBooking, setGuestBooking] = useState<ServiceBooking | null>(null);
  const [servicePaying, setServicePaying] = useState(false);

  const [form, setForm] = useState<BookingFormState>({
    appliance: "Refrigerator",
    fullName: "",
    phoneNumber: "",
    issue: "",
    address: "",
    pincode: "",
  });

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Use AuthContext so the navbar stays in sync on refresh
  const { user: authUser } = useAuth();

  // Also keep local currentUser for backwards-compat with existing handlers
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("user");
    try {
      setCurrentUser(raw ? (JSON.parse(raw) as { id: string; name?: string; email?: string; phone?: string | null }) : null);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Keep currentUser synced with authUser from context (handles refresh correctly)
  useEffect(() => {
    if (authUser) {
      setCurrentUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone,
      });
    }
  }, [authUser]);

  // Load local guest booking if not logged in
  useEffect(() => {
    if (!isHydrated) return;
    if (!currentUser?.id) {
      const localGuestBooking = localStorage.getItem("gr_guest_booking");
      let hasDispatched = false;
      if (localGuestBooking) {
        try {
          const payload = JSON.parse(localGuestBooking);
          if (payload?.bookingId && payload?.phone) {
             hasDispatched = true;
             setGuestLookupLoading(true);
             fetch(`${API}/service/guest-booking?bookingId=${encodeURIComponent(payload.bookingId)}&phone=${encodeURIComponent(payload.phone)}`, { cache: "no-store", credentials: "include" })
               .then(res => res.json())
               .then(data => {
                  if (data?.booking) setGuestBooking(data.booking);
               })
               .finally(() => {
                 setGuestLookupLoading(false);
                 setLoading(false);
               });
          }
        } catch(e) {}
      }
      if (!hasDispatched) setLoading(false);
    }
  }, [isHydrated, currentUser?.id]);

  const loadData = async (userId?: string) => {
    if (!API) {
      setLoading(false);
      return;
    }

    try {
      const galleryPromise = fetch(`${API}/gallery`, { credentials: "include" }).then((res) =>
        res.ok ? res.json().catch(() => []) : []
      );

      if (userId) {
        const [bookingsRes, galleryPayload] = await Promise.all([
          fetch(`${API}/service/my-bookings?userId=${userId}`, {
            credentials: "include",
            cache: "no-store",
          }),
          galleryPromise,
        ]);

        if (bookingsRes.ok) {
          const bookingsPayload = await bookingsRes.json().catch(() => null);
          if (Array.isArray(bookingsPayload)) {
            const activeBookings = bookingsPayload.filter(
              (b) => !["COMPLETED", "CANCELLED"].includes(b.status)
            );
            if (activeBookings.length > 0) {
              setBookings(activeBookings);
              setActiveBooking((prev) => prev ?? activeBookings[0]);
            } else {
              setBookings([]);
              setActiveBooking(null);
            }
          }
          // If not ok or not array, preserve existing state (don't wipe tracker)
        }
        setGallery(Array.isArray(galleryPayload) ? galleryPayload.slice(0, 8) : []);
      } else {
        const galleryPayload = await galleryPromise;
        setGallery(Array.isArray(galleryPayload) ? galleryPayload.slice(0, 8) : []);
      }
    } catch {
      // Network error — preserve existing booking state, don't wipe tracker
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isHydrated) return;
    setLoading(true);
    void loadData(currentUser?.id);
  }, [isHydrated, currentUser?.id]);

  const hasActiveBookings = Array.isArray(bookings) && bookings.length > 0;

  // ── 2-second live poll: only fetch booking status (not gallery) ──────────
  const userIdRef = useRef<string | undefined>(undefined);
  useEffect(() => { userIdRef.current = currentUser?.id; }, [currentUser?.id]);

  useEffect(() => {
    if (!isHydrated || !currentUser?.id || !hasActiveBookings) return;
    if (!API) return;

    const poll = async () => {
      const uid = userIdRef.current;
      if (!uid) return;
      try {
        const res = await fetch(`${API}/service/my-bookings?userId=${uid}`, {
          credentials: "include", cache: "no-store",
        });
        if (!res.ok) return;
        const data = await res.json().catch(() => null);
        if (!Array.isArray(data)) return;
        const active = data.filter((b) => !["COMPLETED", "CANCELLED"].includes(b.status));
        if (active.length > 0) {
          setBookings(active);
          setActiveBooking((prev) => {
            const updated = active.find((b) => b.id === prev?.id);
            return updated ?? active[0];
          });
        } else {
          // All done — reload full data to show completed booking in history
          setBookings([]);
          setActiveBooking(null);
          void loadData(uid);
        }
      } catch {
        // Network blip — keep existing tracker visible, do not clear
      }
    };

    const id = setInterval(poll, 2_000);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated, currentUser?.id, hasActiveBookings]);
  // ─────────────────────────────────────────────────────────────────────────

  const completedBookings = useMemo(
    () => bookings.filter((booking) => ["COMPLETED", "CANCELLED"].includes(booking.status)),
    [bookings],
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
      phoneNumber: prev.phoneNumber || currentUser?.phone || "",
    }));
  }, [currentUser?.name, currentUser?.phone]);

  const handleGetLocation = () => {
    setIsLocating(true);
    toast.info("Fetching your location...");

    const fallbackToIPAddress = async () => {
      try {
        toast.info("GPS blocked. Trying network location...");
        const res = await fetch("https://ipapi.co/json/");
        if (!res.ok) throw new Error("Network fallback failed");
        const data = await res.json();
        
        const postal = data?.postal || "";
        const cityInfo = [data?.city, data?.region].filter(Boolean).join(", ");

        setForm((prev) => ({
          ...prev,
          address: cityInfo || prev.address,
          pincode: postal || prev.pincode,
        }));
        toast.success("Location found using network!");
      } catch (err) {
        toast.error("Could not fetch location automatically.");
      } finally {
        setIsLocating(false);
      }
    };

    if (!navigator.geolocation) {
      void fallbackToIPAddress();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          let fetchedAddress = `GPS Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          let fetchedPincode = "";

          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
              { headers: { "User-Agent": "RefriSmart-AI/1.0 (contact@refrismart.in)" } }
            );
            if (res.ok) {
              const data = await res.json();
              fetchedPincode = data?.address?.postcode || "";
              let nomAddress = data?.display_name || "";
              if (nomAddress) {
                fetchedAddress = nomAddress.replace(/, India$/i, "").replace(new RegExp(`, ${fetchedPincode}$`), "").trim();
              }
            }
          } catch (apiErr) {
            // Reverse geocoding failed (rate limit/firewall), silently keep raw GPS coordinates
          }

          setForm((prev) => ({
            ...prev,
            address: fetchedAddress || prev.address,
            pincode: fetchedPincode || prev.pincode,
          }));
          toast.success("Exact GPS location secured!");
          setIsLocating(false);
        } catch (err) {
          void fallbackToIPAddress();
        }
      },
      () => {
        // If user denies permission or browser blocks it, run the IP fallback
        void fallbackToIPAddress();
      },
      { enableHighAccuracy: true, timeout: 7000, maximumAge: 0 }
    );
  };

  const onSubmitBooking = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedPincode = form.pincode.trim();
    const SERVICE_PIN_PREFIXES = ["812", "813", "853"];
    if (!form.fullName.trim() || !form.phoneNumber.trim() || !form.issue.trim() || !form.address.trim() || !trimmedPincode) {
      toast.error("Name, phone, issue, address, and PIN code are required.");
      return;
    }
    if (!/^\d{10}$/.test(form.phoneNumber.replace(/\D/g, ""))) {
      toast.error("Please enter a valid 10-digit phone number.");
      return;
    }
    if (!/^\d{6}$/.test(trimmedPincode)) {
      toast.error("PIN code must be a 6-digit number.");
      return;
    }
    if (!SERVICE_PIN_PREFIXES.some((prefix) => trimmedPincode.startsWith(prefix))) {
      toast.error("Sorry, we currently do not serve this area.");
      return;
    }

    setBookingSubmitting(true);
    try {
      const res = await fetch(`${API}/service/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: currentUser?.id,
          guestName: currentUser?.id ? undefined : form.fullName.trim(),
          guestPhone: currentUser?.id ? undefined : form.phoneNumber.replace(/\D/g, ""),
          appliance: form.appliance,
          issue: form.issue,
          fullName: form.fullName,
          phoneNumber: form.phoneNumber.replace(/\D/g, ""),
          address: form.address,
          pincode: trimmedPincode,
          lat: undefined,
          lng: undefined,
        }),
      });

      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Booking failed.");

      toast.success("Service booking created successfully.");
      const createdBookingInfo = payload?.booking;
      if (!createdBookingInfo) {
        throw new Error("Booking could not be confirmed. Please try again.");
      }
      
      const createdBooking = {
        ...createdBookingInfo,
        technician: payload?.assignedTechnician || null,
      } as ServiceBooking;

      if (currentUser?.id) {
        setBookings((prev) => [createdBooking, ...prev]);
        setActiveBooking(createdBooking);
        void loadData(currentUser.id);
      } else {
        setGuestBooking(createdBooking);
        localStorage.setItem("gr_guest_booking", JSON.stringify({ bookingId: createdBooking.id, phone: form.phoneNumber.replace(/\D/g, "") }));
      }
      setForm((prev) => ({ ...prev, issue: "" }));
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

  const onSubmitGuestLookup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedBookingId = guestLookup.bookingId.trim();
    const cleanedPhone = guestLookup.phone.replace(/\D/g, "");
    if (!trimmedBookingId || cleanedPhone.length !== 10) {
      toast.error("Booking ID and a valid 10-digit phone number are required.");
      return;
    }
    if (!API) {
      toast.error("Service API not configured.");
      return;
    }

    setGuestLookupLoading(true);
    setGuestBooking(null);
    try {
      const res = await fetch(
        `${API}/service/guest-booking?bookingId=${encodeURIComponent(trimmedBookingId)}&phone=${encodeURIComponent(cleanedPhone)}`,
        { credentials: "include" },
      );
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.error || "Unable to find booking.");
      const booking = payload?.booking as ServiceBooking | undefined;
      if (!booking) throw new Error("Booking details not available.");
      setGuestBooking(booking);
      localStorage.setItem("gr_guest_booking", JSON.stringify({ bookingId: booking.id, phone: cleanedPhone }));
    } catch (error: unknown) {
      setGuestBooking(null);
      toast.error(error instanceof Error ? error.message : "Unable to find booking.");
    } finally {
      setGuestLookupLoading(false);
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

  const handleServicePayment = async () => {
    if (!activeBooking?.id) return;
    if (!API) {
      toast.error("Service API not configured.");
      return;
    }
    if (!currentUser?.id) {
      toast.error("Please login to pay.");
      return;
    }
    if (activeBooking.status !== "PAYMENT_PENDING" || Number(activeBooking.finalCost || 0) <= 0) {
      toast.error("Payment is not available yet for this booking.");
      return;
    }

    setServicePaying(true);
    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady) {
        toast.error("Failed to load Razorpay checkout.");
        return;
      }

      const orderRes = await fetch(`${API}/booking/${activeBooking.id}/razorpay`, {
        method: "POST",
        credentials: "include",
      });
      const orderPayload = await orderRes.json().catch(() => ({}));
      if (!orderRes.ok) {
        toast.error(orderPayload?.error || "Unable to start Razorpay payment.");
        return;
      }

      const razorpayOrder = orderPayload?.razorpayOrder;
      const keyId = orderPayload?.keyId;
      if (!razorpayOrder?.id || !keyId) {
        toast.error("Razorpay order not initialized.");
        return;
      }

      const paymentResponse = await openRazorpayCheckout({
        key: keyId,
        amount: Number(razorpayOrder.amount || 0),
        currency: razorpayOrder.currency || "INR",
        name: "Golden Refrigeration",
        description: `Service payment - ${activeBooking.appliance}`,
        order_id: razorpayOrder.id,
        prefill: {
          name: currentUser?.name,
          email: currentUser?.email,
        },
      });

      const verifyRes = await fetch(`${API}/booking/${activeBooking.id}/razorpay/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(paymentResponse),
      });
      const verifyPayload = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) {
        toast.error(verifyPayload?.error || "Payment verification failed.");
        return;
      }

      toast.success("Payment verified. Service completed.");
      void loadData(currentUser?.id);
    } catch (error: unknown) {
      const message = String((error as Error)?.message || "").toLowerCase();
      if (message.includes("cancel")) {
        toast.error("Payment cancelled.");
      } else {
        toast.error("Payment could not be completed.");
      }
    } finally {
      setServicePaying(false);
    }
  };

  const handleScrollToBooking = () => {
    if (typeof window === "undefined") return;
    const target = document.getElementById("quick-booking-desk");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="min-h-screen pt-20 md:pt-24 pb-16 flex flex-col font-sans bg-slate-50">
      
      {/* PREMIUM BACKGROUND HEADER */}
      <section className="relative flex w-full flex-col items-center justify-center overflow-hidden bg-slate-950 py-20 md:py-32 mb-10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.5)] border-b border-slate-800">
        <div className="absolute inset-0 z-0">
          {/* Guaranteed working high-res Unsplash image for AC / Industrial Repair */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-100"
            style={{ backgroundImage: `url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=2000&auto=format&fit=crop')` }}
          />
          {/* Minimal gradient at the top so the image is 100% visible, fading only at the bottom text boundary */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/30 to-slate-950/90"></div>
          <div className="absolute inset-0 bg-blue-600/5 mix-blend-overlay"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center flex flex-col items-center gap-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-slate-900/60 backdrop-blur-md px-5 py-2 text-sm font-semibold text-blue-300 shadow-lg mb-1">
            <Wrench className="w-4 h-4" />
            <span>Industrial Grade Service</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white tracking-tight drop-shadow-[0_5px_8px_rgba(0,0,0,0.8)] leading-[1.1]">
            Book a <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">Certified Technician</span>
          </h1>
          <p className="text-slate-100 text-lg md:text-2xl font-semibold max-w-3xl mt-2 drop-shadow-[0_4px_4px_rgba(0,0,0,0.9)] bg-slate-950/20 backdrop-blur-sm rounded-lg py-2 px-4">
            Schedule a doorstep visit for your AC, Refrigerator, or Washing Machine. Fast response, guaranteed repair.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-10 md:gap-14">
        {loading || !hasMounted ? (
          <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
            <div className="flex items-center justify-center gap-3 text-lg font-semibold text-slate-600">
              <span className="h-6 w-6 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
              Loading your service tracker...
            </div>
          </section>
        ) : (activeBooking || guestBooking) ? (
          <ServiceActiveTrackerCard
            loading={loading}
            hasActiveBooking={true}
            activeBooking={(activeBooking || guestBooking)!}
            ratingValue={ratingValue}
            setRatingValue={setRatingValue}
            ratingLoading={ratingLoading}
            onSubmitRating={onSubmitRating}
            onDownloadInvoice={downloadInvoice}
            onPayWithRazorpay={handleServicePayment}
            paying={servicePaying}
            canPay={Boolean(currentUser?.id)}
          />
        ) : (
          <EmptyServiceState onBookNow={handleScrollToBooking} />
        )}

        <section
          id="quick-booking-desk"
          className="rounded-[2.5rem] border border-slate-100 bg-white p-8 md:p-12 shadow-2xl shadow-blue-900/5 flex flex-col gap-8"
        >
          <div className="border-b border-slate-100 pb-6">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-600 font-bold mb-2">Schedule Request</p>
            <h3 className="text-3xl font-black text-slate-900">Quick Booking Desk</h3>
          </div>
          {(activeBooking || guestBooking) ? (
            <div className="flex flex-col items-center justify-center p-8 bg-blue-50/50 rounded-2xl border border-blue-100/60 shadow-inner">
              <div className="bg-blue-100/50 text-blue-600 p-4 rounded-full mb-4">
                <Wrench className="w-8 h-8" />
              </div>
              <h4 className="text-xl font-bold text-blue-900 text-center mb-2">
                Active Request In Progress
              </h4>
              <p className="text-sm font-medium text-blue-700/80 text-center max-w-md">
                You already have an active service request being processed. Please wait for the current request to complete or be cancelled before booking an entirely new one.
              </p>
            </div>
          ) : currentUser?.id ? (
            <form className="w-full flex flex-col gap-8" onSubmit={onSubmitBooking}>
              <div className="grid grid-cols-2 gap-4 md:gap-6 sm:grid-cols-4">
                {APPLIANCE_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const selected = form.appliance === option.label;
                  return (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, appliance: option.label }))}
                      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 p-4 transition-all duration-300 ${
                        selected
                          ? "border-blue-500 bg-blue-50 shadow-md shadow-blue-100 scale-105"
                          : "border-slate-100 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-white"
                      }`}
                    >
                      <Icon className={`h-8 w-8 ${selected ? "text-blue-600" : "text-slate-400"}`} />
                      <span className={`text-sm font-bold ${selected ? "text-blue-800" : "text-slate-500"}`}>{option.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="grid gap-6 md:gap-8 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Full Name</label>
                  <input
                    value={form.fullName}
                    onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                    className={`w-full rounded-2xl border border-slate-200 px-5 py-4 text-base text-slate-900 outline-none transition ${currentUser?.name ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'}`}
                    placeholder="John Doe"
                    readOnly={Boolean(currentUser?.name)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Phone Number</label>
                  <input
                    value={form.phoneNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                    className={`w-full rounded-2xl border border-slate-200 px-5 py-4 text-base text-slate-900 outline-none transition ${currentUser?.phone ? 'bg-slate-100 cursor-not-allowed opacity-80' : 'bg-slate-50 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50'}`}
                    placeholder="9876543210"
                    inputMode="numeric"
                    readOnly={Boolean(currentUser?.phone)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Description of Issue</label>
                <textarea
                  value={form.issue}
                  onChange={(e) => setForm((prev) => ({ ...prev, issue: e.target.value }))}
                  className="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50 resize-y"
                  placeholder="E.g., The AC is blowing warm air and making a rattling noise..."
                  required
                />
              </div>

              <div className="grid gap-6 md:gap-8 sm:grid-cols-3">
                <div className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between ml-1 mb-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Service Address</label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      disabled={isLocating}
                      className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50/50 hover:bg-blue-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors border border-blue-100 disabled:opacity-50"
                    >
                      <Navigation className="w-3 h-3" />
                      {isLocating ? "Locating..." : "Auto-Locate"}
                    </button>
                  </div>
                  <input
                    value={form.address}
                    onChange={(e) => setForm((prev) => ({ ...prev, address: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    placeholder="House No, Landmark, Street"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">PIN Code</label>
                  <input
                    value={form.pincode}
                    onChange={(e) => setForm((prev) => ({ ...prev, pincode: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-50"
                    placeholder="813210"
                    inputMode="numeric"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={bookingSubmitting}
                className="mt-4 w-full rounded-2xl bg-blue-600 py-5 text-lg font-black tracking-wide text-white transition-all hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-900/20 active:scale-95 disabled:opacity-60"
              >
                {bookingSubmitting ? "Processing..." : "Confirm & Book Technician"}
              </button>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center bg-slate-50 rounded-2xl border border-slate-200 mt-4">
              <h4 className="text-2xl font-black text-slate-900 mb-3">Authentication Required</h4>
              <p className="text-slate-600 mb-8 max-w-md text-sm font-medium leading-relaxed">
                To guarantee priority tracking and verify technical dispatch, you must securely log in with your mobile number before booking.
              </p>
              <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                Login / Register to Book
              </Link>
            </div>
          )}
        </section>

        {!currentUser?.id && (
          <section className="rounded-[2.5rem] border border-slate-100 bg-white p-8 md:p-12 shadow-xl shadow-slate-200/40 flex flex-col gap-8">
            <div className="border-b border-slate-100 pb-6">
              <h3 className="text-2xl font-black text-slate-900">Track Guest Booking</h3>
              <p className="mt-1 text-sm text-slate-500">Already booked? Enter your ID to check status.</p>
            </div>

            <form className="w-full flex flex-col md:flex-row gap-6" onSubmit={onSubmitGuestLookup}>
              <input
                value={guestLookup.bookingId}
                onChange={(e) => setGuestLookup((prev) => ({ ...prev, bookingId: e.target.value }))}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="Booking ID"
                required
              />
              <input
                value={guestLookup.phone}
                onChange={(e) => setGuestLookup((prev) => ({ ...prev, phone: e.target.value }))}
                className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-base text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white"
                placeholder="Phone Number"
                inputMode="numeric"
                required
              />
              <button
                type="submit"
                disabled={guestLookupLoading}
                className="rounded-2xl bg-slate-900 px-8 py-4 text-base font-bold text-white transition-transform hover:bg-slate-800 active:scale-95 disabled:opacity-60 whitespace-nowrap"
              >
                {guestLookupLoading ? "Checking..." : "Track Status"}
              </button>
            </form>

            {guestBooking && (
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-sm text-slate-700 mt-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <p><span className="font-bold text-slate-500 uppercase text-xs mr-2 border-b border-slate-200">Appliance</span> <br/> {guestBooking.appliance}</p>
                  <p><span className="font-bold text-slate-500 uppercase text-xs mr-2 border-b border-slate-200">Status</span> <br/> <strong className="text-emerald-700">{guestBooking.status.replace(/_/g, " ")}</strong></p>
                  <p className="md:col-span-2"><span className="font-bold text-slate-500 uppercase text-xs mr-2 border-b border-slate-200">Issue</span> <br/> {guestBooking.issue}</p>
                  <p><span className="font-bold text-slate-500 uppercase text-xs mr-2 border-b border-slate-200">Scheduled</span> <br/> {new Date(guestBooking.scheduledAt).toLocaleString("en-IN")}</p>
                  <p><span className="font-bold text-slate-500 uppercase text-xs mr-2 border-b border-slate-200">Technician</span> <br/> {guestBooking.technician?.name || "Assigning..."}</p>
                </div>
              </div>
            )}
          </section>
        )}

        <ServiceHistoryCard completedBookings={completedBookings} onDownloadInvoice={downloadInvoice} />
      </div>
    </main>
  );
}

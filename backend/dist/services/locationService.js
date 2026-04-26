const TIMEOUT_MS = 10_000;
const normalizePincode = (value) => String(value || "").replace(/\D/g, "").slice(0, 6);
const fetchWithTimeout = async (url, options, ms = TIMEOUT_MS) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);
    try {
        return await fetch(url, { ...options, signal: controller.signal });
    }
    finally {
        clearTimeout(timer);
    }
};
const extractAddress = (payload, pincode) => {
    const address = payload.address || {};
    const primaryLine = [address.house_number, address.road].filter(Boolean).join(" ").trim();
    const formatted = [
        primaryLine,
        address.neighbourhood || address.suburb || address.residential || address.village,
        address.city || address.town || address.municipality || address.county || address.state_district,
        address.state,
    ]
        .filter(Boolean)
        .join(", ")
        .trim();
    const fallback = String(payload.display_name || "").trim();
    const rawAddress = formatted || fallback;
    return rawAddress
        .replace(/\s*,\s*India\s*$/i, "")
        .replace(new RegExp(`\\s*,\\s*${pincode}\\s*$`), "")
        .trim();
};
export const reverseGeocodeCoordinates = async (latitude, longitude) => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new Error("VALIDATION");
    }
    const params = new URLSearchParams({
        format: "jsonv2",
        lat: String(latitude),
        lon: String(longitude),
        addressdetails: "1",
    });
    const response = await fetchWithTimeout(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`, {
        headers: {
            "Accept": "application/json",
            "Accept-Language": "en",
            "User-Agent": "RefriSmart-AI/1.0 (service-booking-location)",
        },
    });
    if (!response.ok) {
        throw new Error(`HTTP_${response.status}`);
    }
    const payload = (await response.json().catch(() => ({})));
    const displayName = String(payload.display_name || "");
    const matchedPincode = displayName.match(/\b\d{6}\b/);
    const pincode = normalizePincode(payload.address?.postcode || matchedPincode?.[0] || "");
    const address = extractAddress(payload, pincode) || `GPS Location: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    return {
        address,
        pincode,
        latitude,
        longitude,
    };
};

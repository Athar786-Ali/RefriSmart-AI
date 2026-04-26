export const RAW_SERVICE_STATUSES = [
    "PENDING",
    "ASSIGNED",
    "ESTIMATE_APPROVED",
    "OUT_FOR_REPAIR",
    "REPAIRING",
    "FIXED",
    "PAYMENT_PENDING",
    "COMPLETED",
    "CANCELLED",
];
export const DISPLAY_SERVICE_STATUSES = [
    "PENDING",
    "ASSIGNED",
    "ON_THE_WAY",
    "REPAIRING",
    "PAYMENT_PENDING",
    "COMPLETED",
    "CANCELLED",
];
const DISPLAY_STATUS_MAP = {
    PENDING: "PENDING",
    ASSIGNED: "ASSIGNED",
    ESTIMATE_APPROVED: "ASSIGNED",
    OUT_FOR_REPAIR: "ON_THE_WAY",
    REPAIRING: "REPAIRING",
    FIXED: "PAYMENT_PENDING",
    PAYMENT_PENDING: "PAYMENT_PENDING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
};
const DISPLAY_STATUS_LABELS = {
    PENDING: "Pending",
    ASSIGNED: "Assigned",
    ON_THE_WAY: "On The Way",
    REPAIRING: "Repairing",
    PAYMENT_PENDING: "Payment",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
};
export const toRawServiceStatus = (status) => {
    const normalized = String(status || "").trim().toUpperCase();
    if (!normalized)
        return null;
    if (normalized === "ON_THE_WAY")
        return "OUT_FOR_REPAIR";
    if (RAW_SERVICE_STATUSES.includes(normalized)) {
        return normalized;
    }
    return null;
};
export const toDisplayServiceStatus = (status) => {
    const rawStatus = toRawServiceStatus(status) ?? "PENDING";
    return DISPLAY_STATUS_MAP[rawStatus];
};
export const getDisplayServiceStatusLabel = (status) => DISPLAY_STATUS_LABELS[toDisplayServiceStatus(status)];
export const isAwaitingServicePayment = (status) => toDisplayServiceStatus(status) === "PAYMENT_PENDING";
export const isClosedServiceStatus = (status) => {
    const displayStatus = toDisplayServiceStatus(status);
    return displayStatus === "COMPLETED" || displayStatus === "CANCELLED";
};

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
] as const;

export type RawServiceStatus = (typeof RAW_SERVICE_STATUSES)[number];

export const DISPLAY_SERVICE_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "ON_THE_WAY",
  "REPAIRING",
  "PAYMENT_PENDING",
  "COMPLETED",
  "CANCELLED",
] as const;

export type DisplayServiceStatus = (typeof DISPLAY_SERVICE_STATUSES)[number];

const DISPLAY_STATUS_MAP: Record<RawServiceStatus, DisplayServiceStatus> = {
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

const DISPLAY_STATUS_LABELS: Record<DisplayServiceStatus, string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  ON_THE_WAY: "On The Way",
  REPAIRING: "Repairing",
  PAYMENT_PENDING: "Payment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const toRawServiceStatus = (status?: string | null): RawServiceStatus | null => {
  const normalized = String(status || "").trim().toUpperCase();
  if (!normalized) return null;
  if (normalized === "ON_THE_WAY") return "OUT_FOR_REPAIR";
  if ((RAW_SERVICE_STATUSES as readonly string[]).includes(normalized)) {
    return normalized as RawServiceStatus;
  }
  return null;
};

export const toDisplayServiceStatus = (status?: string | null): DisplayServiceStatus => {
  const rawStatus = toRawServiceStatus(status) ?? "PENDING";
  return DISPLAY_STATUS_MAP[rawStatus];
};

export const getDisplayServiceStatusLabel = (status?: string | null) =>
  DISPLAY_STATUS_LABELS[toDisplayServiceStatus(status)];

export const isAwaitingServicePayment = (status?: string | null) =>
  toDisplayServiceStatus(status) === "PAYMENT_PENDING";

export const isClosedServiceStatus = (status?: string | null) => {
  const displayStatus = toDisplayServiceStatus(status);
  return displayStatus === "COMPLETED" || displayStatus === "CANCELLED";
};

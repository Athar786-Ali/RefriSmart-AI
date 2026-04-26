"use client";

export const DISPLAY_SERVICE_STATUSES = [
  "PENDING",
  "ASSIGNED",
  "ON_THE_WAY",
  "REPAIRING",
  "PAYMENT_PENDING",
  "COMPLETED",
  "CANCELLED",
] as const;

export type ServiceDisplayStatus = (typeof DISPLAY_SERVICE_STATUSES)[number];

const RAW_TO_DISPLAY_STATUS: Record<string, ServiceDisplayStatus> = {
  PENDING: "PENDING",
  ASSIGNED: "ASSIGNED",
  ESTIMATE_APPROVED: "ASSIGNED",
  OUT_FOR_REPAIR: "ON_THE_WAY",
  ON_THE_WAY: "ON_THE_WAY",
  REPAIRING: "REPAIRING",
  FIXED: "PAYMENT_PENDING",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
};

const STATUS_LABELS: Record<ServiceDisplayStatus, string> = {
  PENDING: "Pending",
  ASSIGNED: "Assigned",
  ON_THE_WAY: "On The Way",
  REPAIRING: "Repairing",
  PAYMENT_PENDING: "Payment",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const getServiceDisplayStatus = (booking: { status?: string | null; displayStatus?: string | null }) => {
  const directDisplayStatus = String(booking.displayStatus || "").trim().toUpperCase();
  if (DISPLAY_SERVICE_STATUSES.includes(directDisplayStatus as ServiceDisplayStatus)) {
    return directDisplayStatus as ServiceDisplayStatus;
  }

  const rawStatus = String(booking.status || "").trim().toUpperCase();
  return RAW_TO_DISPLAY_STATUS[rawStatus] || "PENDING";
};

export const getServiceStatusLabel = (booking: { status?: string | null; displayStatus?: string | null }) =>
  STATUS_LABELS[getServiceDisplayStatus(booking)];

export const isAwaitingServicePayment = (booking: { status?: string | null; displayStatus?: string | null }) =>
  getServiceDisplayStatus(booking) === "PAYMENT_PENDING";

export const isClosedDisplayStatus = (booking: { status?: string | null; displayStatus?: string | null }) => {
  const displayStatus = getServiceDisplayStatus(booking);
  return displayStatus === "COMPLETED" || displayStatus === "CANCELLED";
};

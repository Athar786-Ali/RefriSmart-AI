export const ORDER_STATUS_STEPS = ["PLACED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED"] as const;

export const ALL_ORDER_STATUSES = ["PLACED", "DISPATCHED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED"] as const;

export type OrderStatus = (typeof ALL_ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PLACED: "Order Placed",
  DISPATCHED: "Dispatched",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const ORDER_STATUS_NORMALIZATION_MAP: Record<string, OrderStatus> = {
  PLACED: "PLACED",
  ORDER_PLACED: "PLACED",
  DISPATCHED: "DISPATCHED",
  OUT_FOR_DELIVERY: "OUT_FOR_DELIVERY",
  OUTFORDELIVERY: "OUT_FOR_DELIVERY",
  DELIVERED: "DELIVERED",
  CANCELLED: "CANCELLED",
};

export const normalizeOrderStatus = (value: unknown): OrderStatus => {
  const normalized = String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return ORDER_STATUS_NORMALIZATION_MAP[normalized] || "PLACED";
};

export const normalizeOrderApiPayload = <T extends { status?: unknown; orderStatus?: unknown }>(order: T) => {
  const { orderStatus: _legacyOrderStatus, ...rest } = order;
  return {
    ...rest,
    status: normalizeOrderStatus(order?.status ?? order?.orderStatus),
  };
};

export const getOrderStepIndex = (status: OrderStatus) => {
  if (status === "CANCELLED") return 0;
  const index = ORDER_STATUS_STEPS.findIndex((step) => step === status);
  return index >= 0 ? index : 0;
};

export const isFinalOrderStatus = (status: OrderStatus) => status === "DELIVERED" || status === "CANCELLED";

export type ProductType = "NEW" | "REFURBISHED";

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number | string;
  images?: string[] | string | null;
  isUsed?: boolean;
  productType?: ProductType;
  conditionScore?: number | null;
  ageMonths?: number | null;
  warrantyType?: "BRAND" | "SHOP" | null;
  warrantyExpiry?: string | null;
  warrantyCertificateUrl?: string | null;
  stockQty?: number | null;
  createdAt?: string | null;
};

export type NormalizedProduct = Product & { normalizedType: ProductType };

export type DiagnosisItem = {
  id: string;
  appliance: string;
  issue: string;
  aiDiagnosis: string;
  estimatedCostRange?: string | null;
  mediaUrl?: string | null;
  mediaType?: "image" | "video" | null;
  createdAt?: string;
  customer?: {
    id?: string;
    name?: string;
    email?: string;
  } | null;
  guestName?: string | null;
  guestPhone?: string | null;
};

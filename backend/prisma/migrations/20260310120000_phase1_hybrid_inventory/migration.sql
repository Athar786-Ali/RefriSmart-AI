-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('NEW', 'REFURBISHED');

-- CreateEnum
CREATE TYPE "WarrantyType" AS ENUM ('BRAND', 'SHOP');

-- AlterTable
ALTER TABLE "Product"
ADD COLUMN "productType" "ProductType" NOT NULL DEFAULT 'NEW',
ADD COLUMN "ageMonths" INTEGER,
ADD COLUMN "warrantyType" "WarrantyType",
ADD COLUMN "warrantyExpiry" TIMESTAMP(3),
ADD COLUMN "warrantyCertificateUrl" TEXT;

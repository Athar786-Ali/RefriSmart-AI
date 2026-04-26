CREATE TABLE IF NOT EXISTS "DiagnosisLog" (
  "id" UUID NOT NULL,
  "customerId" UUID,
  "guestName" TEXT,
  "guestPhone" TEXT,
  "appliance" TEXT NOT NULL,
  "issue" TEXT NOT NULL,
  "diagnosis" TEXT NOT NULL,
  "estimatedCostRange" TEXT,
  "mediaUrl" TEXT,
  "mediaType" TEXT DEFAULT 'image',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "DiagnosisLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "DiagnosisLog"
  ADD CONSTRAINT "DiagnosisLog_customerId_fkey"
  FOREIGN KEY ("customerId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "DiagnosisLog_customerId_createdAt_idx"
  ON "DiagnosisLog"("customerId", "createdAt" DESC);

CREATE INDEX IF NOT EXISTS "DiagnosisLog_createdAt_idx"
  ON "DiagnosisLog"("createdAt" DESC);

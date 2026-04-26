import { randomUUID } from "node:crypto";
import { prisma } from "../config/prisma.js";
let diagnosisSchemaEnsured = false;
export const ensureDiagnosisLogSchema = async () => {
    if (diagnosisSchemaEnsured)
        return;
    await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "DiagnosisLog" (
      "id" UUID PRIMARY KEY,
      "customerId" UUID NULL REFERENCES "User"("id") ON DELETE SET NULL,
      "guestName" TEXT NULL,
      "guestPhone" TEXT NULL,
      "appliance" TEXT NOT NULL,
      "issue" TEXT NOT NULL,
      "diagnosis" TEXT NOT NULL,
      "estimatedCostRange" TEXT NULL,
      "mediaUrl" TEXT NULL,
      "mediaType" TEXT NULL DEFAULT 'image',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
    await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "DiagnosisLog_customerId_createdAt_idx"
    ON "DiagnosisLog" ("customerId", "createdAt" DESC)
  `);
    await prisma.$executeRawUnsafe(`
    CREATE INDEX IF NOT EXISTS "DiagnosisLog_createdAt_idx"
    ON "DiagnosisLog" ("createdAt" DESC)
  `);
    diagnosisSchemaEnsured = true;
};
export const createDiagnosisLog = async (input) => {
    await ensureDiagnosisLogSchema();
    const rows = await prisma.$queryRaw `
    INSERT INTO "DiagnosisLog"
    (
      "id",
      "customerId",
      "guestName",
      "guestPhone",
      "appliance",
      "issue",
      "diagnosis",
      "estimatedCostRange",
      "mediaUrl",
      "mediaType"
    )
    VALUES
    (
      ${randomUUID()},
      ${input.customerId || null},
      ${input.guestName || null},
      ${input.guestPhone || null},
      ${input.appliance},
      ${input.issue},
      ${input.diagnosis},
      ${input.estimatedCostRange || null},
      ${input.mediaUrl || null},
      ${input.mediaType || null}
    )
    RETURNING "id"
  `;
    return rows[0]?.id || null;
};
export const listDiagnosisLogs = async (customerId) => {
    await ensureDiagnosisLogSchema();
    if (customerId) {
        return prisma.$queryRaw `
      SELECT
        d."id",
        d."customerId",
        d."guestName",
        d."guestPhone",
        d."appliance",
        d."issue",
        d."diagnosis",
        d."estimatedCostRange",
        d."mediaUrl",
        d."mediaType",
        d."createdAt",
        u."name" AS "customerName",
        u."email" AS "customerEmail"
      FROM "DiagnosisLog" d
      LEFT JOIN "User" u ON u."id" = d."customerId"
      WHERE d."customerId" = ${customerId}
      ORDER BY d."createdAt" DESC
    `;
    }
    return prisma.$queryRaw `
    SELECT
      d."id",
      d."customerId",
      d."guestName",
      d."guestPhone",
      d."appliance",
      d."issue",
      d."diagnosis",
      d."estimatedCostRange",
      d."mediaUrl",
      d."mediaType",
      d."createdAt",
      u."name" AS "customerName",
      u."email" AS "customerEmail"
    FROM "DiagnosisLog" d
    LEFT JOIN "User" u ON u."id" = d."customerId"
    ORDER BY d."createdAt" DESC
  `;
};

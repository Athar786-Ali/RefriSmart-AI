import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Request } from "express";
import { cloudinary } from "../config/cloudinary.js";

type UploadFolder = "gallery" | "diagnosis" | "sell";

type TempFileInput = {
  filePath: string;
  mimeType?: string | null;
  originalName?: string | null;
  folder: UploadFolder;
  resourceType?: "image" | "video";
};

type DataUrlInput = {
  dataUrl: string;
  originalName?: string | null;
  folder: UploadFolder;
  resourceType?: "image" | "video";
};

const LOCAL_UPLOADS_ROOT = path.resolve(process.cwd(), "uploads");
const DATA_URL_PATTERN = /^data:(image|video)\/([a-zA-Z0-9.+-]+);base64,/;

const MIME_EXTENSION_MAP: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
  "video/x-matroska": "mkv",
};

const isCloudinaryConfigured = () =>
  Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);

const sanitizeFileName = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9.\-_]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

const getExtension = (mimeType?: string | null, originalName?: string | null, fallback = "bin") => {
  const normalizedMime = String(mimeType || "").toLowerCase();
  if (MIME_EXTENSION_MAP[normalizedMime]) {
    return MIME_EXTENSION_MAP[normalizedMime];
  }

  const originalExt = path.extname(String(originalName || "")).replace(/^\./, "").toLowerCase();
  return originalExt || fallback;
};

const getResourceType = (mimeType?: string | null, explicitType?: "image" | "video") => {
  if (explicitType) return explicitType;
  return String(mimeType || "").toLowerCase().startsWith("video/") ? "video" : "image";
};

const ensureUploadDir = async (folder: UploadFolder) => {
  const targetDir = path.join(LOCAL_UPLOADS_ROOT, folder);
  await fs.mkdir(targetDir, { recursive: true });
  return targetDir;
};

const toLocalUrl = (folder: UploadFolder, fileName: string) => `/uploads/${folder}/${fileName}`;

export const toAbsoluteMediaUrl = (req: Request, rawUrl: string | null | undefined) => {
  const value = String(rawUrl || "").trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  const prefix = value.startsWith("/") ? value : `/${value}`;
  return `${req.protocol}://${req.get("host")}${prefix}`;
};

const persistLocallyFromBuffer = async (
  buffer: Buffer,
  folder: UploadFolder,
  mimeType?: string | null,
  originalName?: string | null,
) => {
  const dir = await ensureUploadDir(folder);
  const ext = getExtension(mimeType, originalName, "bin");
  const baseName = sanitizeFileName(path.basename(String(originalName || ""), path.extname(String(originalName || "")))) || folder;
  const fileName = `${baseName}-${randomUUID()}.${ext}`;
  const absolutePath = path.join(dir, fileName);
  await fs.writeFile(absolutePath, buffer);
  return { url: toLocalUrl(folder, fileName), resourceType: getResourceType(mimeType) };
};

const persistLocallyFromTempFile = async (input: TempFileInput) => {
  const dir = await ensureUploadDir(input.folder);
  const ext = getExtension(input.mimeType, input.originalName, input.resourceType === "video" ? "mp4" : "jpg");
  const baseName = sanitizeFileName(path.basename(String(input.originalName || ""), path.extname(String(input.originalName || "")))) || input.folder;
  const fileName = `${baseName}-${randomUUID()}.${ext}`;
  const absolutePath = path.join(dir, fileName);
  await fs.rename(input.filePath, absolutePath);
  return { url: toLocalUrl(input.folder, fileName), resourceType: getResourceType(input.mimeType, input.resourceType) };
};

export const storeMediaFromDataUrl = async (input: DataUrlInput) => {
  const match = input.dataUrl.match(DATA_URL_PATTERN);
  if (!match) {
    throw new Error("Invalid media data URL.");
  }

  const mimeType = `${match[1]}/${match[2]}`.toLowerCase();
  const resourceType = getResourceType(mimeType, input.resourceType);
  const base64 = input.dataUrl.slice(match[0].length);
  const buffer = Buffer.from(base64, "base64");

  if (isCloudinaryConfigured()) {
    try {
      const uploaded = await cloudinary.uploader.upload(input.dataUrl, {
        folder: `refri-smart/${input.folder}`,
        resource_type: resourceType,
      });
      return {
        url: uploaded.secure_url,
        resourceType,
      };
    } catch (error) {
      console.warn("Cloudinary upload failed, using local storage fallback.", error);
    }
  }

  return persistLocallyFromBuffer(buffer, input.folder, mimeType, input.originalName);
};

export const storeMediaFromTempFile = async (input: TempFileInput) => {
  const resourceType = getResourceType(input.mimeType, input.resourceType);

  if (isCloudinaryConfigured()) {
    try {
      const uploaded = await cloudinary.uploader.upload(input.filePath, {
        folder: `refri-smart/${input.folder}`,
        resource_type: resourceType,
      });
      await fs.unlink(input.filePath).catch(() => {});
      return {
        url: uploaded.secure_url,
        resourceType,
      };
    } catch (error) {
      console.warn("Cloudinary upload failed, using local storage fallback.", error);
    }
  }

  return persistLocallyFromTempFile(input);
};

export const removeStoredMedia = async (rawUrl: string | null | undefined) => {
  const value = String(rawUrl || "").trim();
  if (!value) return;

  if (value.startsWith("/uploads/")) {
    const relativePath = value.replace(/^\/+/, "");
    await fs.unlink(path.resolve(process.cwd(), relativePath)).catch(() => {});
    return;
  }

  if (!value.includes("res.cloudinary.com") || !value.includes("/upload/")) {
    return;
  }

  try {
    const cleanUrl = value.split("?")[0];
    const uploadIndex = cleanUrl.indexOf("/upload/");
    const rawPath = cleanUrl.slice(uploadIndex + "/upload/".length);
    const segments = rawPath.split("/").filter(Boolean);

    while (segments[0] && (segments[0].includes(",") || segments[0].includes(":") || segments[0].startsWith("f_") || segments[0].startsWith("q_") || segments[0].startsWith("c_") || segments[0].startsWith("w_"))) {
      segments.shift();
    }
    if (segments[0] && /^v\d+$/.test(segments[0])) {
      segments.shift();
    }

    const publicId = segments.join("/").replace(/\.[^/.]+$/, "");
    if (!publicId) return;
    const resourceType = /\.(mp4|webm|mov|mkv)$/i.test(cleanUrl) ? "video" : "image";
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.warn("Media cleanup failed.", error);
  }
};

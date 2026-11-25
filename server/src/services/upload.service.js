import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { cloudinaryEnabled, env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export const UPLOAD_DIR = path.resolve("uploads");
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

if (cloudinaryEnabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true,
  });
}

// Files are kept in memory, validated, then forwarded to Cloudinary (or disk in local development).
export const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
    cb(ok ? null : new ApiError(400, "Upload a JPG, PNG or WebP image."), ok);
  },
});

// The declared mimetype comes from the client, so also check the file's actual signature.
function detectImageType(buf) {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buf.subarray(0, 4).toString() === "RIFF" && buf.subarray(8, 12).toString() === "WEBP") return "webp";
  return null;
}

export async function saveImage(file, folder) {
  const ext = detectImageType(file.buffer);
  if (!ext) throw new ApiError(400, "That file doesn't look like a valid image.");

  if (cloudinaryEnabled) {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: `campusconnect/${folder}`, resource_type: "image" }, (err, res) =>
          err ? reject(err) : resolve(res)
        )
        .end(file.buffer);
    });
    return { url: result.secure_url, publicId: result.public_id };
  }

  const name = `${crypto.randomUUID()}.${ext}`;
  await fs.mkdir(path.join(UPLOAD_DIR, folder), { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, folder, name), file.buffer);
  return { url: `${env.serverUrl}/uploads/${folder}/${name}`, publicId: `local:${folder}/${name}` };
}

export async function deleteImage(image) {
  if (!image?.publicId) return;
  try {
    if (image.publicId.startsWith("local:")) {
      const rel = image.publicId.slice(6);
      const target = path.resolve(UPLOAD_DIR, rel);
      if (target.startsWith(UPLOAD_DIR + path.sep)) await fs.unlink(target); // guard against path traversal
    } else if (cloudinaryEnabled) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  } catch (err) {
    console.warn("Could not delete old image:", err.message);
  }
}

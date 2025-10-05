import JSZip from "jszip";

export async function getCoverImageBase64(zip: JSZip, coverPath: string) {
  if (!coverPath) return null;

  const file = zip.file(coverPath);
  if (!file) return null;

  const base64 = await file.async("base64");

  // Guess mime type from extension
  const ext = coverPath.split(".").pop()?.toLowerCase();
  const mime =
    ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";

  return `data:${mime};base64,${base64}`;
}

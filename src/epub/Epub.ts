import JSZip from "jszip";
import type { EpubBook } from "./types";

export class Epub implements EpubBook {
  metadata: EpubBook["metadata"];
  chapters: EpubBook["chapters"];
  resources: EpubBook["resources"];
  toc: EpubBook["toc"];

  private zip!: JSZip;

  constructor(zip: JSZip, book: EpubBook) {
    Object.defineProperty(this, "zip", {
      value: zip,
      enumerable: false, // 👈 hides from logs
      writable: false,
    });
    this.metadata = book.metadata;
    this.chapters = book.chapters;
    this.resources = book.resources;
    this.toc = book.toc;
  }

  /**
   * Returns the cover image as a data URL (base64) if available.
   */
  async getCoverImageData(): Promise<string | null> {
    const coverPath = this.metadata.cover;
    if (!coverPath) return null;

    const file = this.zip.file(coverPath);
    if (!file) return null;

    const base64 = await file.async("base64");

    // Guess mime type from extension
    const ext = coverPath.split(".").pop()?.toLowerCase();
    const mime =
      ext === "png" ? "image/png" : ext === "gif" ? "image/gif" : "image/jpeg";

    return `data:${mime};base64,${base64}`;
  }

  /**
   * Returns a chapter’s HTML string by ID or index.
   */
  getChapter(identifier: string | number) {
    if (typeof identifier === "number") return this.chapters[identifier];
    return this.chapters.find((ch) => ch.id === identifier);
  }

  /**
   * Fetches a raw file from the EPUB zip.
   */
  async getFile(path: string): Promise<ArrayBuffer | null> {
    const file = this.zip.file(path);
    if (!file) return null;
    return await file.async("arraybuffer");
  }
}

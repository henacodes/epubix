import JSZip from "jszip";
import type { EpubBook } from "./types";
import { getCoverImageBase64 } from "./coverImage";

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
    if (!this.metadata.cover) {
      return null;
    }
    return getCoverImageBase64(this.zip, this.metadata.cover);
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

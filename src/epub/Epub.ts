import JSZip from "jszip";
import type { EpubBook, EpubChapter } from "./types";
import { getCoverImageBase64 } from "./coverImage";
import { resolveHrefPath } from "./href";

export class Epub implements EpubBook {
  metadata: EpubBook["metadata"];
  chapters: EpubBook["chapters"];
  resources: EpubBook["resources"];
  toc: EpubBook["toc"];
  opfFolder?: EpubBook["opfFolder"];

  private zip!: JSZip;
  private normalizedChapterMap: Map<string, number> = new Map();

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
    this.opfFolder = book.opfFolder;

    // Build normalizedChapterMap for fast lookups (normalize each chapter href the same way)
    const base = this.opfFolder ?? "";
    for (let i = 0; i < this.chapters.length; i++) {
      const ch = this.chapters[i];
      // resolveHrefPath will normalize path and ignore fragment if present
      const { normalized } = resolveHrefPath(base, ch.href);
      if (!this.normalizedChapterMap.has(normalized)) {
        this.normalizedChapterMap.set(normalized, i);
      }
    }
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
   * Resolve a TOC/manifest href into a normalized path and the fragment, and find the
   * matching chapter index (if any).
   *
   * Returns:
   *  { chapterIndex?: number, fragment?: string, normalizedPath: string }
   */

  resolveHref(href: string): {
    chapterIndex?: number;
    fragment?: string;
    normalizedPath: string;
  } {
    const base = this.opfFolder ?? "";
    const { normalized, fragment } = resolveHrefPath(base, href);
    const chapterIndex = this.normalizedChapterMap.get(normalized);
    return { chapterIndex, fragment, normalizedPath: normalized };
  }

  /**
   * Return the chapter object and fragment for a given href (TOC/manifest href).
   * If no chapter is matched, chapter will be undefined but fragment is still returned.
   */
  getChapterByHref(href: string): { chapter?: EpubChapter; fragment?: string } {
    const { chapterIndex, fragment } = this.resolveHref(href);
    if (chapterIndex === undefined) return { chapter: undefined, fragment };
    return { chapter: this.chapters[chapterIndex], fragment };
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

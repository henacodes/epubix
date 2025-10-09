import JSZip from "jszip";
import { Epub } from "../epub/Epub";
import type { EpubBook } from "../epub/types";
import { describe, test, expect } from "vitest";

describe("Epub.resolveHref / getChapterByHref", () => {
  const zip = new JSZip();

  const book: EpubBook = {
    metadata: { title: "Test Book" },
    chapters: [
      {
        id: "ch1",
        title: "Chapter 1",
        content: "<p>ch1</p>",
        href: "Text/14_Chapter_3.html",
      },
      {
        id: "ch2",
        title: "Chapter 2",
        content: "<p>ch2</p>",
        href: "./Text/15_Chapter_4.html",
      },
      {
        id: "ch3",
        title: "ch3",
        content: "<p>ch3</p>",
        href: "../other/16.html",
      },
    ],
    resources: {},
    toc: [],
    opfFolder: "OEBPS/",
  };

  const epub = new Epub(zip as any, book);

  test("resolveHref finds chapter by normalized path (same form)", () => {
    const r = epub.resolveHref("Text/14_Chapter_3.html#s7");
    expect(r.chapterIndex).toBe(0);
    expect(r.fragment).toBe("s7");
    expect(r.normalizedPath).toBe("OEBPS/Text/14_Chapter_3.html");
  });

  test("resolveHref finds chapter when chapter href contains ./", () => {
    const r = epub.resolveHref("Text/15_Chapter_4.html");
    expect(r.chapterIndex).toBe(1);
    expect(r.fragment).toBeUndefined();
    expect(r.normalizedPath).toBe("OEBPS/Text/15_Chapter_4.html");
  });

  test("resolveHref with ../ segments resolves correctly", () => {
    const r = epub.resolveHref("../other/16.html#part");
    expect(r.chapterIndex).toBe(2);
    expect(r.fragment).toBe("part");
  });

  test("getChapterByHref returns the chapter object and fragment", () => {
    const res = epub.getChapterByHref("Text/14_Chapter_3.html#s7");
    expect(res.chapter).toBeDefined();
    expect(res.chapter?.id).toBe("ch1");
    expect(res.fragment).toBe("s7");
  });

  test("unmatched href returns undefined chapter but still returns fragment", () => {
    const res = epub.getChapterByHref("does/not/exist.html#frag");
    expect(res.chapter).toBeUndefined();
    expect(res.fragment).toBe("frag");
  });

  test("resolveHref decodes percent-encoded fragment", () => {
    const r = epub.resolveHref("Text/14_Chapter_3.html#s7%20hello");
    expect(r.fragment).toBe("s7 hello");
  });
});

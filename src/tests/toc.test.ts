import { describe, it, expect, beforeAll } from "vitest";
import JSZip from "jszip";
import { JSDOM } from "jsdom";
import { parseToc } from "../epub/toc";
import type { OpfData } from "../epub/types";

beforeAll(() => {
  // Provide a DOMParser implementation for the parser (jsdom)
  const { window } = new JSDOM("");
  // @ts-ignore - assign DOMParser to global for the parser to use
  global.DOMParser = window.DOMParser;
});

describe("parseToc", () => {
  it("parses NCX (EPUB2) with nested navPoint children correctly", async () => {
    const zip = new JSZip();

    const ncx = `<?xml version="1.0" encoding="utf-8"?>
      <ncx xmlns="http://www.daisy.org/z3986/2005/ncx/">
        <navMap>
          <navPoint id="np1" playOrder="1">
            <navLabel><text>Part 8</text></navLabel>
            <content src="part8.xhtml"/>
            <navPoint id="np1.1" playOrder="2">
              <navLabel><text>Chapter 1</text></navLabel>
              <content src="chapter1.xhtml"/>
              <navPoint id="np1.1.1" playOrder="3">
                <navLabel><text>1.1</text></navLabel>
                <content src="1.1.xhtml"/>
              </navPoint>
              <navPoint id="np1.1.2" playOrder="4">
                <navLabel><text>1.2</text></navLabel>
                <content src="1.2.xhtml"/>
              </navPoint>
            </navPoint>
          </navPoint>
        </navMap>
      </ncx>`;

    // Put ncx file at path "OEBPS/toc.ncx"
    zip.file("OEBPS/toc.ncx", ncx);

    const opfData: OpfData = {
      manifest: {
        ncx: {
          href: "toc.ncx",
          mediaType: "application/x-dtbncx+xml",
        } as any,
      } as any,
      spine: [],
      opfFolder: "OEBPS/",
    } as any;

    const toc = await parseToc(zip, opfData);

    expect(toc).toEqual([
      {
        title: "Part 8",
        href: "part8.xhtml",
        children: [
          {
            title: "Chapter 1",
            href: "chapter1.xhtml",
            children: [
              { title: "1.1", href: "1.1.xhtml" },
              { title: "1.2", href: "1.2.xhtml" },
            ],
          },
        ],
      },
    ]);
  });

  it("parses EPUB3 nav.xhtml with nested lists correctly", async () => {
    const zip = new JSZip();

    const nav = `<?xml version="1.0" encoding="utf-8"?>
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
        <body>
          <nav epub:type="toc">
            <ol>
              <li>
                <a href="part8.xhtml">Part 8</a>
                <ol>
                  <li>
                    <a href="chapter1.xhtml">Chapter 1</a>
                    <ol>
                      <li><a href="1.1.xhtml">1.1</a></li>
                      <li><a href="1.2.xhtml">1.2</a></li>
                    </ol>
                  </li>
                </ol>
              </li>
            </ol>
          </nav>
        </body>
      </html>`;

    zip.file("OPS/nav.xhtml", nav);

    const opfData: OpfData = {
      manifest: {
        nav: {
          href: "nav.xhtml",
          mediaType: "application/xhtml+xml",
          properties: "nav",
        } as any,
      } as any,
      spine: [],
      opfFolder: "OPS/",
    } as any;

    const toc = await parseToc(zip, opfData);

    expect(toc).toEqual([
      {
        title: "Part 8",
        href: "part8.xhtml",
        children: [
          {
            title: "Chapter 1",
            href: "chapter1.xhtml",
            children: [
              { title: "1.1", href: "1.1.xhtml" },
              { title: "1.2", href: "1.2.xhtml" },
            ],
          },
        ],
      },
    ]);
  });

  it("falls back to spine ordering when no TOC is present", async () => {
    const zip = new JSZip();
    // No toc files added to the zip

    const opfData: OpfData = {
      manifest: {
        item1: {
          href: "chapter1.xhtml",
          mediaType: "application/xhtml+xml",
          id: "chapter1",
        } as any,
        item2: {
          href: "chapter2.xhtml",
          mediaType: "application/xhtml+xml",
          id: "chapter2",
        } as any,
      } as any,
      spine: [{ idref: "item1" }, { idref: "item2" }] as any,
      opfFolder: "",
    } as any;

    const toc = await parseToc(zip, opfData);

    expect(toc).toEqual([
      { title: "chapter1", href: "chapter1.xhtml" },
      { title: "chapter2", href: "chapter2.xhtml" },
    ]);
  });
});

import JSZip from "jszip";
import type { OpfData, TocEntry } from "./types";

export async function parseToc(
  zip: JSZip,
  opfData: OpfData
): Promise<TocEntry[]> {
  const { manifest, spine, opfFolder } = opfData;

  // EPUB 2 (NCX)
  const ncxItem = Object.values(manifest).find(
    (i) => i.mediaType === "application/x-dtbncx+xml"
  );
  if (ncxItem) {
    const ncxFile = zip.file(opfFolder + ncxItem.href);
    if (!ncxFile) return [];
    const ncxText = await ncxFile.async("text");
    const parser = new DOMParser();
    const ncxDoc = parser.parseFromString(ncxText, "application/xml");

    function parseNavPoints(nodes: NodeListOf<Element>): TocEntry[] {
      const entries: TocEntry[] = [];
      nodes.forEach((np) => {
        const textNode = np.querySelector("navLabel > text");
        const contentNode = np.querySelector("content");
        if (!textNode || !contentNode) return;
        const children = np.querySelectorAll("navPoint");
        entries.push({
          title: textNode.textContent || "",
          href: contentNode.getAttribute("src") || "",
          children: children.length > 0 ? parseNavPoints(children) : undefined,
        });
      });
      return entries;
    }

    return parseNavPoints(ncxDoc.querySelectorAll("navMap > navPoint"));
  }

  // EPUB 3 (nav.xhtml)
  const navItem = Object.values(manifest).find(
    (i: any) =>
      i.mediaType === "application/xhtml+xml" && i.properties === "nav"
  );
  if (navItem) {
    const navFile = zip.file(opfFolder + navItem.href);
    if (!navFile) return [];
    const navText = await navFile.async("text");
    const parser = new DOMParser();
    const navDoc = parser.parseFromString(navText, "application/xhtml+xml");

    const nav = navDoc.querySelector(
      'nav[epub\\:type="toc"], nav[role="doc-toc"]'
    );
    if (!nav) return [];

    function parseNavList(
      items: HTMLCollection | NodeListOf<Element>
    ): TocEntry[] {
      const entries: TocEntry[] = [];
      for (let i = 0; i < items.length; i++) {
        const li = items.item(i) as Element;
        if (!li) continue;
        const a = li.querySelector("a");
        if (!a) continue;
        const childOl = li.querySelector("ol, ul");
        entries.push({
          title: a.textContent?.trim() || "",
          href: a.getAttribute("href") || "",
          children: childOl ? parseNavList(childOl.children as any) : undefined,
        });
      }
      return entries;
    }

    const topOl = nav.querySelector("ol");
    return topOl ? parseNavList(topOl.children as any) : [];
  }

  // Fallback
  return spine.map((item) => ({
    title: manifest[item.idref]?.id || item.idref,
    href: manifest[item.idref]?.href || "",
  }));
}

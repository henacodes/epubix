import JSZip from "jszip";
import type { OpfData, TocEntry } from "./types";

function isElementNavPoint(el: Element) {
  const local = (el.localName || el.tagName || "").toLowerCase();
  return local === "navpoint";
}

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

    function parseNavPoints(
      nodes: NodeListOf<Element> | Element[]
    ): TocEntry[] {
      const nodeArr = Array.from(nodes);

      const entries: TocEntry[] = [];

      for (const np of nodeArr) {
        if (!isElementNavPoint(np)) continue;

        const textNode = np.querySelector("navLabel > text");
        const contentNode = np.querySelector("content");
        const title = (textNode?.textContent || "").trim();
        const href = contentNode?.getAttribute("src") || "";

        // Find immediate child navPoint elements (do not use querySelectorAll which returns descendants)
        const childElements = Array.from(np.children).filter(isElementNavPoint);

        entries.push({
          title,
          href,
          children:
            childElements.length > 0
              ? parseNavPoints(childElements)
              : undefined,
        });
      }

      return entries;
    }

    const topNavMap = ncxDoc.querySelectorAll("navMap > navPoint");
    return parseNavPoints(topNavMap);
  }

  // EPUB 3 (nav.xhtml)
  const navItem = Object.values(manifest).find((i: any) => {
    if (!i.mediaType?.includes("xhtml")) return false;
    const props = (i.properties || "").split(/\s+/).filter(Boolean);
    return (
      props.includes("nav") || props.includes("toc") || i.properties === "nav"
    );
  });

  if (navItem) {
    const navFile = zip.file(opfFolder + navItem.href);
    if (!navFile) return [];
    const navText = await navFile.async("text");
    const parser = new DOMParser();
    const navDoc = parser.parseFromString(navText, "application/xhtml+xml");

    const nav =
      navDoc.querySelector('nav[epub\\:type="toc"]') ||
      navDoc.querySelector('nav[role="doc-toc"]') ||
      navDoc.querySelector('nav[type="toc"]') ||
      navDoc.querySelector("nav");

    if (!nav) return [];

    function parseNavList(
      items: HTMLCollection | NodeListOf<Element> | Element[]
    ): TocEntry[] {
      const arr = Array.isArray(items) ? items : Array.from(items as any);
      const entries: TocEntry[] = [];

      for (const node of arr) {
        // we expect <li> elements here when walking an <ol>/<ul>
        const li = node as Element;
        if (!li) continue;

        const a =
          li.querySelector("a") ||
          li.querySelector("a[href]") ||
          li.querySelector("[href]"); // fallback to any element with href-like attribute
        if (!a) {
          // If no anchor, skip this li (could be a heading or something else)
          continue;
        }

        const title = (a.textContent || "").trim();
        const href = a.getAttribute("href") || "";

        // Only parse immediate child ol/ul (do not use querySelectorAll to avoid descendants)
        const childOl = Array.from(li.children).find((c) => {
          const name = (c.localName || c.tagName || "").toLowerCase();
          return name === "ol" || name === "ul";
        }) as Element | undefined;

        const childItems = childOl ? Array.from(childOl.children) : [];
        entries.push({
          title,
          href,
          children:
            childItems.length > 0 ? parseNavList(childItems) : undefined,
        });
      }

      return entries;
    }

    const topOl = nav.querySelector("ol, ul");
    return topOl ? parseNavList(Array.from(topOl.children)) : [];
  }

  // Fallback: use spine ordering
  return spine.map((item) => ({
    title: manifest[item.idref]?.id || item.idref,
    href: manifest[item.idref]?.href || "",
  }));
}

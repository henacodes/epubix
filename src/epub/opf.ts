import JSZip from "jszip";
import type { EpubMetadata, ManifestItem, SpineItem, OpfData } from "./types";

export async function parseOpf(zip: JSZip, opfPath: string): Promise<OpfData> {
  const contentFile = zip.file(opfPath);
  if (!contentFile) throw new Error(`OPF file not found: ${opfPath}`);

  const contentText = await contentFile.async("text");
  const parser = new DOMParser();
  const doc = parser.parseFromString(contentText, "application/xml");

  const metadataNode = doc.querySelector("metadata");
  const metadata: EpubMetadata = {
    title: metadataNode?.querySelector("title")?.textContent || undefined,
    author: metadataNode?.querySelector("creator")?.textContent || undefined,
    language: metadataNode?.querySelector("language")?.textContent || undefined,
    identifier:
      metadataNode?.querySelector("identifier")?.textContent || undefined,
    cover:
      metadataNode
        ?.querySelector("meta[name='cover']")
        ?.getAttribute("content") || undefined,
  };

  const manifest: Record<string, ManifestItem> = {};
  doc.querySelectorAll("manifest > item").forEach((item) => {
    const id = item.getAttribute("id");
    const href = item.getAttribute("href");
    const mediaType = item.getAttribute("media-type") || "";
    if (id && href) manifest[id] = { id, href, mediaType };
  });

  const spine: SpineItem[] = Array.from(doc.querySelectorAll("spine > itemref"))
    .map((i) => i.getAttribute("idref"))
    .filter(Boolean)
    .map((idref) => ({ idref: idref! }));

  const opfFolder = opfPath.substring(0, opfPath.lastIndexOf("/") + 1);

  return { metadata, manifest, spine, opfFolder };
}

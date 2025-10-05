import { Epub } from "./Epub";
import { loadEpub, getOpfPath } from "./loader";
import { parseOpf } from "./opf";
import { parseToc } from "./toc";
import type { EpubBook, EpubChapter, EpubResource } from "./types";

export async function loadEpubBook(
  file: File | Blob | ArrayBuffer
): Promise<Epub> {
  const zip = await loadEpub(file);
  const opfPath = await getOpfPath(zip);
  const opfData = await parseOpf(zip, opfPath);
  const { metadata, manifest, spine, opfFolder } = opfData;

  // chapters
  const chapters: EpubChapter[] = [];
  for (const item of spine) {
    const manifestItem = manifest[item.idref];
    if (!manifestItem) continue;
    const chapterFile = zip.file(opfFolder + manifestItem.href);
    if (!chapterFile) continue;
    const content = await chapterFile.async("text");
    chapters.push({
      id: item.idref,
      title: manifestItem.id,
      content,
      href: manifestItem.href,
    });
  }

  // resources
  const resources: Record<string, EpubResource> = {};
  for (const key in manifest) {
    const item = manifest[key];
    if (!item.mediaType.startsWith("image") && item.mediaType !== "text/css")
      continue;
    const resourceFile = zip.file(opfFolder + item.href);
    if (!resourceFile) continue;
    const content = await resourceFile.async(
      item.mediaType.startsWith("image") ? "base64" : "text"
    );
    resources[item.id] = { id: item.id, type: item.mediaType, content };
  }

  // toc
  const toc = await parseToc(zip, opfData);

  const book = { metadata, chapters, resources, toc };

  return new Epub(zip, book);
}

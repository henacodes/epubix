import { getCoverImageBase64 } from "./coverImage";
import { Epub } from "./Epub";
import { extractEpub, getOpfPath } from "./loader";
import { parseOpf, parseOpfMetadata } from "./opf";
import { parseToc } from "./toc";
import type { EpubChapter, EpubInputTypes, EpubResource } from "./types";

export async function loadEpubBook(file: EpubInputTypes): Promise<Epub> {
  const zip = await extractEpub(file);
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
export async function loadEpubMetadata(file: EpubInputTypes) {
  const zip = await extractEpub(file);
  const opfPath = await getOpfPath(zip);

  let metadata = await parseOpfMetadata(zip, opfPath);
  let coverImageBase64: string | null = null;
  if (metadata.cover) {
    coverImageBase64 = await getCoverImageBase64(zip, metadata.cover);
  }

  return {
    ...metadata,
    coverBase64: coverImageBase64,
  };
}

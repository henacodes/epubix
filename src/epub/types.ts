export type EpubInputTypes = File | ArrayBuffer | Blob;

export interface EpubMetadata {
  title?: string;
  author?: string;
  language?: string;
  identifier?: string;
  cover?: string;
}

export interface ManifestItem {
  id: string;
  href: string;
  mediaType: string;
}

export interface SpineItem {
  idref: string;
}

export interface OpfData {
  metadata: EpubMetadata;
  manifest: Record<string, ManifestItem>;
  spine: SpineItem[];
  opfFolder: string;
}

export interface TocEntry {
  title: string;
  href: string;
  children?: TocEntry[];
}

export interface EpubChapter {
  id: string;
  title: string;
  content: string;
  href: string;
}

export interface EpubResource {
  id: string;
  type: string;
  content: string | ArrayBuffer;
}

export interface EpubBook {
  metadata: EpubMetadata;
  chapters: EpubChapter[];
  resources: Record<string, EpubResource>;
  toc: TocEntry[];
}

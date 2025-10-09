# 📚 epubix

A simple TypeScript utility library for parsing EPUB files.  
Extract metadata, chapters, TOC, and resources from EPUB 2 & 3 files — framework-agnostic and ready for the web.

---

## ✨ Features

- 📖 Load EPUB files from `File`, `Blob`, or `ArrayBuffer`.
- 🪶 Extract **metadata** (title, author, language, identifier, cover).
- 📚 Parse **chapters** (content + href).
- 🧭 Parse **TOC** (nested table of contents).
- 🔗 Robust href resolution: handles `./`, `../`, duplicate slashes and percent-encoded fragments.
- 🧰 Utility helpers to split/normalize TOC/manifest hrefs.
- 🧪 Unit tests (Jest + ts-jest + jsdom).

---

## 📦 Installation

```bash
npm install epubix
# or
yarn add epubix
```

## 🚀 Usage

### Full EPUB Loading (returns Epub instance)

The library now returns an `Epub` instance that exposes helpers to reliably map TOC hrefs (including fragment variations) back to the correct chapter and anchor.

```ts
import { loadEpubBook } from "epubix";

const file = (document.querySelector("input[type='file']") as HTMLInputElement)
  .files![0];
const epub = await loadEpubBook(file); // returns Epub instance

console.log(epub.metadata); // { title, author, language, cover, ... }
console.log(epub.chapters); // [{ id, title, href, content }, ...]
console.log(epub.toc); // [{ title, href, children }, ...]
console.log(epub.opfFolder); // e.g. "OEBPS/" — base folder used to resolve hrefs
```

### Resolve TOC href → chapter index + fragment

Use `epub.resolveHref(href)` or `epub.getChapterByHref(href)` to map TOC entries to the correct chapter and anchor.

```ts
// href could be "Text/14_Chapter_3.html#s7" or "./Text/14_Chapter_3.html#s7"
const { chapterIndex, fragment, normalizedPath } = epub.resolveHref(
  "Text/14_Chapter_3.html#s7"
);

// chapterIndex is the index in epub.chapters (may be undefined if not matched)
// fragment is decoded (e.g. "s7")
// normalizedPath is the resolved zip path (e.g. "OEBPS/Text/14_Chapter_3.html")

// Or get the chapter object directly
const { chapter, fragment: frag } = epub.getChapterByHref(
  "Text/14_Chapter_3.html#s7"
);
if (chapter) {
  // render chapter.content, then scroll to anchor `frag`
}
```

This resolves:

- Relative segments (`./`, `../`)
- Duplicate slashes (collapsed)
- Leading slashes removed
- Percent-decoded fragments

---

## 🤝 Contributing

Contributions welcome — bug reports, tests or PRs. If you add features that affect path normalization, please include unit tests to cover `resolveHrefPath` and `Epub.resolveHref`.

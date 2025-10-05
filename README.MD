# 📚 epubix

A simple **TypeScript utility library** for parsing EPUB files.  
Extract **metadata**, **chapters**, **TOC**, and **resources** from EPUB 2 & 3 files — framework-agnostic and ready for the web.

---

## ✨ Features

- 📖 Load EPUB files from `File`, `Blob`, or `ArrayBuffer`.
- 🪶 Extract **metadata** (title, author, language, identifier, cover).
- 📚 Parse **chapters** (content + href).
- 🧭 Parse **TOC** (nested table of contents).
- 🖼️ Extract **resources** (CSS, images, etc.).

---

## 📦 Installation

```bash
npm install epubix
# or
yarn add epubix
```

## 🚀 Usage

### Full EPUB Loading

```ts
import { loadEpubBook } from "epubix";

const file = document.querySelector("input[type='file']").files[0];
const book = await loadEpubBook(file);

console.log(book.metadata); // { title, author, language, cover, ... }
console.log(book.chapters); // [{ href, content }, ...]
console.log(book.toc); // [{ title, href, children }, ...]
```

### Quick Metadata Only (for covers, lists, etc.)

If you only need to display book covers or titles

```ts
import { loadEpubMetadata } from "epubix";

const file = document.querySelector("input[type='file']").files[0];
const metadata = await loadEpubMetadata(file);

console.log(metadata.title);
console.log(metadata.cover);
// the base64 format of the cover image is included by default if it exists
console.log(metadata.coverBase64);
```

### Using the Epub Class (with helpers)

```ts
import { loadEpubBook } from "epubix";

const file = document.querySelector("input[type='file']").files[0];
const epub = await loadEpubBook(file); // returns the Epub class
let coverImg = await epub.getCoverImageData(); // Returns a Blob URL or data URI for display if it exists
```

So you can use it directly in your markup
<img src={coverImg} alt="Book cover" />

## 🤝 Contributing

Contributions are greatly appreciated.

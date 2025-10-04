# epubix

A simple **TypeScript utility library** for parsing EPUB files.  
Extract **metadata, chapters, TOC, and resources** from EPUB 2 & 3 files with ease.

---

## Features

- Load EPUB files from **File, Blob, or ArrayBuffer**.
- Extract **metadata**: title, author, language, cover, identifier.
- Parse **chapters** with content and href.
- Parse **TOC** (table of contents) for nested chapters.
- Extract **resources** (images, CSS, etc.).
- Framework-agnostic core, ready for web projects.

---

## Installation

```bash
npm install epubix
# or
yarn add epubix
```

## Usage

```ts
import { loadEpubBook } from "epub-utils";

// Assuming `file` is a File, Blob, or ArrayBuffer
const book = await loadEpubBook(file);

console.log(book.metadata);
console.log(book.chapters);
console.log(book.toc);
console.log(book.resources);
```

# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.2.3] - 2025-10-09

### Added

- Exposed `opfFolder` on the `Epub`/book object so consumers can resolve manifest/TOC hrefs relative to the OPF file location.
- New href utilities: `splitHref(href)` and `resolveHrefPath(opfFolder, href)` to consistently split, decode, resolve, and normalize TOC/manifest hrefs (handles `./`, `../`, duplicate slashes and percent-encoded fragments).
- `Epub.resolveHref(href)` — resolves any TOC/manifest href into:
  - `normalizedPath` (zip path resolved against `opfFolder`),
  - `fragment` (decoded),
  - `chapterIndex` (index in `epub.chapters`, if any).
- `Epub.getChapterByHref(href)` — returns `{ chapter?, fragment? }` for quick consumer use.
- Precomputed `normalizedChapterMap` in `Epub` constructor for O(1) lookup by normalized path.
- Unit tests for href utilities and Epub resolver behaviors (vitest).

### Changed

- `loadEpubBook` / book construction now includes `opfFolder` in the returned book object passed to `new Epub(...)`.
- Normalization behavior strengthened:
  - Duplicate slashes collapsed.
  - Leading slashes removed.
  - `../` and `./` segments resolved via the URL-based resolver (with fake origin).
  - Fragment identifiers percent-decoded for consistent matching.

Example - mapping a TOC entry to a chapter and scrolling to an anchor:

```ts
const { chapterIndex, fragment } = epub.resolveHref(tocEntry.href);
const idx = chapterIndex ?? 0;
renderChapter(epub.chapters[idx].content);
if (fragment) {
  const el =
    container.querySelector(`#${CSS.escape(fragment)}`) ||
    container.querySelector(`a[name="${fragment}"]`);
  if (el) el.scrollIntoView({ behavior: "smooth" });
}
```

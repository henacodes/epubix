// Utilities for working with toc/manifest hrefs and fragments.
// - splitHref splits href into path and fragment (decodes fragment).
// - resolveHrefPath resolves a (possibly relative) href against an opfFolder
//   and returns a normalized path (no leading slash) and fragment.
//
// These use the URL API with a fake base to resolve `..` and `.` segments reliably.

export function splitHref(href: string): { path: string; fragment?: string } {
  const i = href.indexOf("#");
  if (i === -1) return { path: href };
  return {
    path: href.slice(0, i),
    fragment: decodeURIComponent(href.slice(i + 1)),
  };
}

/**
 * Resolve a href (which may contain `../` or `./` or a fragment) relative to opfFolder.
 * Returns a normalized path (POSIX-like, no leading slash) and the decoded fragment (if any).
 *
 * Examples:
 *  resolveHrefPath("OEBPS/", "Text/14.html#s7") -> { normalized: "OEBPS/Text/14.html", fragment: "s7" }
 *  resolveHrefPath("OEBPS/", "../cover.jpg") -> { normalized: "cover.jpg" }
 */
export function resolveHrefPath(
  opfFolder: string,
  href: string
): { normalized: string; fragment?: string } {
  const { path, fragment } = splitHref(href);

  // Normalize opfFolder: remove leading slash(es), keep trailing slash if non-empty
  const folder = opfFolder
    ? opfFolder.replace(/^\/+/, "").replace(/\/+$/, "") + "/"
    : "";

  // Use URL with a fake origin so the browser resolves ../ and ./ segments reliably.
  // Prepend base so relative paths are resolved relative to the opfFolder.
  const fakeBase = "http://epub.local/" + folder; // harmless fake origin
  // The URL constructor will return pathname with a leading slash. e.g. "/OEBPS/Text/14.html"
  const resolvedPathname = new URL(path, fakeBase).pathname;

  // Strip leading slash(es) to match zip internal paths (EPUB uses POSIX paths)
  let normalized = resolvedPathname.replace(/^\/+/, "");

  // Collapse duplicate slashes (e.g. "Text//14.html" -> "Text/14.html")
  normalized = normalized.replace(/\/+/g, "/");

  return { normalized, fragment };
}

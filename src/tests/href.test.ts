import { splitHref, resolveHrefPath } from "../epub/href";
import { describe, test, expect } from "vitest";
describe("href-utils", () => {
  test("splitHref without fragment", () => {
    const r = splitHref("Text/14_Chapter_3.html");
    expect(r.path).toBe("Text/14_Chapter_3.html");
    expect(r.fragment).toBeUndefined();
  });

  test("splitHref with fragment (decoded)", () => {
    const r = splitHref("Text/14_Chapter_3.html#s7%20with%20space");
    expect(r.path).toBe("Text/14_Chapter_3.html");
    expect(r.fragment).toBe("s7 with space");
  });

  test("resolveHrefPath resolves relative to opfFolder and strips leading slash", () => {
    const res = resolveHrefPath("OEBPS/", "Text/14_Chapter_3.html#s7");
    expect(res.normalized).toBe("OEBPS/Text/14_Chapter_3.html");
    expect(res.fragment).toBe("s7");
  });

  test("resolveHrefPath resolves `..` segments correctly", () => {
    // opfFolder = OEBPS/Text/ -> ../cover.jpg should resolve to OEBPS/cover.jpg
    const res = resolveHrefPath("OEBPS/Text/", "../cover.jpg");
    expect(res.normalized).toBe("OEBPS/cover.jpg");
    expect(res.fragment).toBeUndefined();

    // opfFolder = OEBPS/ -> ../cover.jpg should resolve to cover.jpg (above root)
    const res2 = resolveHrefPath("OEBPS/", "../cover.jpg");
    expect(res2.normalized).toBe("cover.jpg");
  });

  test("resolveHrefPath handles opfFolder empty", () => {
    const res = resolveHrefPath("", "Text/14.html#frag");
    expect(res.normalized).toBe("Text/14.html");
    expect(res.fragment).toBe("frag");
  });

  test("resolveHrefPath normalizes extra slashes", () => {
    const res = resolveHrefPath("/OEBPS//", "./Text//14.html#s");
    expect(res.normalized).toBe("OEBPS/Text/14.html");
    expect(res.fragment).toBe("s");
  });
});

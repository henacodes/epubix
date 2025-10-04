import JSZip from "jszip";

export async function loadEpub(
  file: File | Blob | ArrayBuffer
): Promise<JSZip> {
  let arrayBuffer: ArrayBuffer;

  if (file instanceof File || file instanceof Blob) {
    arrayBuffer = await file.arrayBuffer();
  } else {
    arrayBuffer = file;
  }

  return await JSZip.loadAsync(arrayBuffer);
}

export async function getOpfPath(zip: JSZip): Promise<string> {
  const containerFile = zip.file("META-INF/container.xml");
  if (!containerFile) throw new Error("container.xml not found");

  const containerText = await containerFile.async("text");
  const parser = new DOMParser();
  const doc = parser.parseFromString(containerText, "application/xml");

  const rootfilePath = doc.querySelector("rootfile")?.getAttribute("full-path");
  if (!rootfilePath) throw new Error("Rootfile path missing");

  return rootfilePath;
}

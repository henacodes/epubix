import { loadEpubBook, loadEpubMetadata } from ".";

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const metadataDiv = document.getElementById("metadata")!;
const chapterDiv = document.getElementById("chapter")!;

fileInput.addEventListener("change", async () => {
  if (!fileInput.files?.[0]) return;
  const file = fileInput.files[0];
  const epub = await loadEpubBook(file);

  let coverImg = await epub.getCoverImageData();

  let onlyEpubMetadata = await loadEpubMetadata(file);

  console.log("the EPUB file", epub);

  console.log("EPUB metadata", onlyEpubMetadata);

  metadataDiv.innerHTML = `<h2>${epub.metadata.title || "No title"}</h2>
    <p>Author: ${epub.metadata.author || "Unknown"}</p>
    <p>Language: ${epub.metadata.language || "Unknown"}</p>
    <img src=${coverImg}  />
    `;

  if (epub.chapters.length > 0) {
    chapterDiv.innerHTML = epub.chapters[5].content;
  } else {
    chapterDiv.innerHTML = "<p>No chapters found</p>";
  }
});

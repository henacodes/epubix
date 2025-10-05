import { loadEpubBook } from ".";

const fileInput = document.getElementById("fileInput") as HTMLInputElement;
const metadataDiv = document.getElementById("metadata")!;
const chapterDiv = document.getElementById("chapter")!;

fileInput.addEventListener("change", async () => {
  if (!fileInput.files?.[0]) return;
  const epub = await loadEpubBook(fileInput.files[0]);

  let coverImg = await epub.getCoverImageData();

  console.log("the EPUB file", epub);

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

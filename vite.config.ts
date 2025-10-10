import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  plugins: [
    dts({
      insertTypesEntry: true, // add "types" entry to package.json automatically (optional)
      outDir: "dist",
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "epubix",
      formats: ["es", "cjs", "umd"],
      fileName: (format) => {
        if (format === "es") return "epubix.js";
        if (format === "cjs") return "epubix.cjs.js";
        if (format === "umd") return "epubix.umd.cjs";
        return `epubix.${format}.js`;
      },
    },
    rollupOptions: {
      external: ["jszip"],
      output: {
        globals: {
          jszip: "JSZip",
        },
      },
    },
    outDir: "dist",
  },
});

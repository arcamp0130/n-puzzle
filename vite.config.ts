import { defineConfig } from "vite";

// Vite configuration to bundle project
export default defineConfig({
    root: "./public",
    build: {
        outDir: "../dist/public",
        emptyOutDir: true,
    }
})
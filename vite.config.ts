import { defineConfig } from "vite"
import { resolve } from "path"

// Vite configuration to bundle project
export default defineConfig(({ mode }) => ({
    root: "./public",
    build: {
        outDir: "../dist/public",
        emptyOutDir: true,
        sourcemap: mode === 'development',
    },
    css: {
        devSourcemap: true,
    },
    resolve: {
        alias: {
            "@sass": resolve(__dirname, "./src/sass"),
        },
    },
}))
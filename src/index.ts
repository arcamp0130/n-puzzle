import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import { router } from "./routes/index.route.ts"
import { PORT, ENVIROMENT } from "./secrets.ts"

const app = express()

// Get current directory from relative url path
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Solving static path to serve files
const staticPath = ENVIROMENT === "production"
    ? path.join(__dirname, "../dist/public")    // prod
    : path.join(__dirname, "../public")         // dev

// using express configurations
app.use(express.static(staticPath))
app.use("/", router);

// launching server
app.listen(PORT, () => {
    console.log(`${ENVIROMENT} server's running at http://localhost:${PORT}`)
})
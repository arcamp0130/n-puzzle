import express from "express"
import { fileURLToPath } from "url"
import { PORT, ENVIROMENT } from "./secrets.ts"
import path from "path"

const app = express()

// Get current directory from relative url path
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Solving static path to serve files
const staticPath = ENVIROMENT === "production"
    ? path.join(__dirname, "../dist/public")    // prod
    : path.join(__dirname, "../public")         // dev

const router = express.Router()

// router to root
router.get("/", (_: express.Request, res: express.Response) => {
    res.sendFile("index.html", { root: "public" })
})

// using express configurations
app.use(express.static(staticPath))
app.use("/", router);

// launching server
app.listen(PORT, () => {
    console.log(`${ENVIROMENT} server's running at http://localhost:${PORT}`)
})
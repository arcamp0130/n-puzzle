import express, { Router } from "express"

const router = Router()
const rootDir = 'public'

// router to root
router.get("/", (_: express.Request, res: express.Response) => {
    res.sendFile("index.html", { root: rootDir })
})

export { router }

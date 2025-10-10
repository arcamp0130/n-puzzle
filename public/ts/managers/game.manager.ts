import { htmlManager } from "./managers.index"

export default class gameManager {
    private static instance: gameManager
    private board: number[][] = []
    private boardSize: number = 4
    private htmlMgr: htmlManager = htmlManager.Instance

    // Private constructor to prevent direct instantiation
    private constructor() {

    }

    public static get Instance(): gameManager {
        if (!gameManager.instance) {
            gameManager.instance = new gameManager()
        }
        return gameManager.instance
    }

}
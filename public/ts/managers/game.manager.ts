import { Board } from "../types/game.types"

export default class gameManager {
    private static instance: gameManager
    private board: Board = []
    private boardSize: number = 4

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
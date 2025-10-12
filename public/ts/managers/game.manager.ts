import { Board } from "../types/game.types"
import { Problem, PQueue } from "../classes/classes.index"

export default class GameManager {
    private static instance: GameManager
    private board: Board = []
    private boardSize: number = 4

    // Private constructor to prevent direct instantiation
    private constructor() {

    }

    public static get Instance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager()
        }
        return GameManager.instance
    }
}
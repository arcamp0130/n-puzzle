import { Board, GameResponse } from "../types/game.types"
import { Problem, PQueue } from "../classes/classes.index"
import { HTMLManager } from "../managers/managers.index"

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

    public async solve(): Promise<GameResponse> {
        const pQueue = new PQueue<Board>()

        // Mock behaivor
        await HTMLManager.delay(2000)
        return {
            message: "[Mock] Solved!",
            success: true
        } as GameResponse

    }
}
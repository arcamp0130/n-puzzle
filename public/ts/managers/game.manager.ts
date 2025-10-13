import { Board, GameResponse, SlotCoords } from "../types/game.types"
import { Problem, PQueue } from "../classes/classes.index"
import { HTMLManager } from "../managers/managers.index"

export default class GameManager {
    private static instance: GameManager
    private board: Board = []
    private boardSize: number = 4

    public static defaultGoal: Board =
       [[1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0]]

    // Private constructor to prevent direct instantiation
    private constructor() {

    }

    public static get Instance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager()
        }
        return GameManager.instance
    }

    private manhattan(coords_1: SlotCoords, coords_2: SlotCoords) {
        // |x_1 - x_2| + |y_1 - y_2| = d
    }

    private heuristic(state: Board, goal: Board = GameManager.defaultGoal) {
        // Use Manhattan repeatedly for each coordinate 
    }

    public async solve(problem: Problem): Promise<GameResponse> {
        const pQueue = new PQueue<Board>()

        // Mock behaivor
        await HTMLManager.delay(2000)
        return {
            message: "[Mock] Solved!",
            success: true
        } as GameResponse

    }
}
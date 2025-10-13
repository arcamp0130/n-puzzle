import { Board, GameResponse, SlotCoords } from "../types/game.types"
import { Problem, PQueue } from "../classes/classes.index"
import { HTMLManager } from "../managers/managers.index"

export default class GameManager {
    private static instance: GameManager
    // private board: Board = []
    // private boardSize: number = 4

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

    private async aStar (problem: Problem): Promise<GameResponse> {
        const openList: PQueue<Board> = new PQueue<Board>()
        const closeList: Set<Board> = new Set<Board>()

        openList.enqueue(problem.board, 0)

        // While openList is not empty
        while (openList.size() > 0) {
            // Ensure exiting when openList empty
            if (openList.peek() === undefined) break 
            const state: Board = openList.dequeue() as Board

            if (problem.isGoal(state)) return {
                success: true,
                message: "Problem was same as goal... This' not a puzzle!"
            } as GameResponse
            
        }

        // Mock
        return {
            success: false,
            message: "[Mock] No solution found"
        } as GameResponse
    }

    public async solve(problem: Problem): Promise<GameResponse> {
        await HTMLManager.delay(2000)
        try {
            return await this.aStar(problem)
        } catch (error) {
            return {
                success: false,
                message: "Something went wrong while solving."
            } as GameResponse
        }

    }
}
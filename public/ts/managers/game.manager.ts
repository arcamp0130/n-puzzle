import { Board, GameResponse, SlotCoords } from "../types/game.types"
import { Problem, PQueue } from "../classes/classes.index"
import { HTMLManager } from "../managers/managers.index"

export default class GameManager {
    private static instance: GameManager

    // Store goal positions for O(1) lookup
    private static goalPositions: Map<number, SlotCoords> = new Map()

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

    // Initialize goal positions --> O(n^2)
    private initGoalPositions(goal: Board, size: number): void {
        if (GameManager.goalPositions.size === 0)
            for (let i = 0; i < size; i++)
                for (let j = 0; j < size; j++) {
                    const value = goal[i][j]
                    if (value !== 0)  // Don't store empty tile
                        GameManager.goalPositions.set(value, { y: i, x: j })

                }
    }

    private clearGoalPositions(): void {
        GameManager.goalPositions.clear()
    }

    private manhattan(coords_1: SlotCoords, coords_2: SlotCoords): number {
        return Math.abs(coords_1.x - coords_2.x) + Math.abs(coords_1.y - coords_2.y)
    }

    private heuristic(state: Board, goal: Board = GameManager.defaultGoal) {
        // Use Manhattan repeatedly for each coordinate 
    }

    private async aStar(problem: Problem): Promise<GameResponse> {
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
        this.initGoalPositions(problem.goal, problem.boardSize)
        try {
            return await this.aStar(problem)
        } catch (error) {
            return {
                success: false,
                message: "Something went wrong while solving."
            } as GameResponse
        } finally {
            this.clearGoalPositions()
        }

    }
}
import { Board, BoardState, GameResponse, PQueueItem } from "../types/game.types"
import { SlotCoords } from "../types/html.types"
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

    private expandMoves(size: number, emptyPos: SlotCoords): Array<SlotCoords> {
        const expanded: Array<SlotCoords> = []
        const calculated: Array<SlotCoords> = [
            { x: emptyPos.x + 1, y: emptyPos.y },
            { x: emptyPos.x - 1, y: emptyPos.y },
            { x: emptyPos.x, y: emptyPos.y + 1 },
            { x: emptyPos.x, y: emptyPos.y - 1 }
        ]

        for (const position of calculated) {
            // Pass if calculated not in valid range
            if (position.x < 0 || position.x >= size ||
                position.y < 0 || position.y >= size) continue
            expanded.push(position)
        }

        return expanded
    }

    private getEmptyPos(board: Board): SlotCoords | undefined {
        for (const row of board)
            for (const val of row)
                if (val === 0) return {
                    x: row.indexOf(val),
                    y: board.indexOf(row)
                }

        return undefined
    }

    private swap(empty: SlotCoords, slot: SlotCoords, board: Board): Board {
        // Create a deep copy of the board
        const newBoard: Board = board.map(row => [...row]);

        // Perform swap on the copy
        const slotVal: number = newBoard[slot.y][slot.x]
        const emptyVal: number = newBoard[empty.y][empty.x]

        newBoard[empty.y][empty.x] = slotVal
        newBoard[slot.y][slot.x] = emptyVal

        return newBoard
    }

    private manhattan(coords_1: SlotCoords, coords_2: SlotCoords): number {
        return Math.abs(coords_1.x - coords_2.x) + Math.abs(coords_1.y - coords_2.y)
    }

    private heuristic(state: Board, size: number): number {
        let h: number = 0

        // For each value in state board (except 0 which is empty)
        for (let i = 0; i < size; i++)
            for (let j = 0; j < size; j++) {
                const value = state[i][j]
                if (value === 0) continue; // Skip empty slot

                // look for position of value in goal
                const goalPos: SlotCoords = GameManager.goalPositions.get(value)!

                // Add Manhattan distance between current and goal positions
                h += this.manhattan({ x: j, y: i }, goalPos)
            }

        return h
    }

    private async aStar(problem: Problem): Promise<GameResponse> {
        const openList: PQueue<Board> = new PQueue<Board>();
        const closedSet: Set<string> = new Set(); // Using serialized boards for comparison
        let gScore: Map<string, number> = new Map();

        // Initialize starting node
        const startBoard = problem.board;
        const startKey = JSON.stringify(startBoard);
        gScore.set(startKey, 0);
        openList.enqueue(startBoard, this.heuristic(startBoard, problem.boardSize));

        while (openList.size() > 0) {
            await HTMLManager.delay(500) // Prevent UI block

            const current: PQueueItem<Board> = openList.dequeue()!
            if (!current) break

            const currentBoard = current.element
            const currentKey = JSON.stringify(current.element)

            if (problem.isGoal(currentBoard)) return {
                success: true,
                message: "Problem solved!"
            } as GameResponse


            // If wasn't solution
            closedSet.add(currentKey)

            // Get empty slot positon
            const emptyPos: SlotCoords | undefined = this.getEmptyPos(current.element)

            // Unable to find solution if no empty position available
            if (!emptyPos) continue

            // Expand next available moves
            const moves: Array<SlotCoords> = this.expandMoves(problem.boardSize, emptyPos)

            for (const move of moves) {
                const nextBoard: Board = this.swap(emptyPos, move, current.element)
                const nextKey: string = JSON.stringify(nextBoard)

                if (problem.isGoal(nextBoard)) return {
                    success: true,
                    message: "Problem solved!"
                }

                if (closedSet.has(nextKey)) continue

                const gTentative = gScore.get(currentKey)! + 1

                // If a better score was found
                if (!gScore.has(nextKey) || gTentative < gScore.get(nextKey)!) {
                    gScore.set(nextKey, gTentative)
                    const fScore = gTentative + this.heuristic(nextBoard, problem.boardSize)

                    if (!gScore.has(nextKey))
                        openList.enqueue(nextBoard, fScore, current.element)
                    else
                        openList.updatePriority(nextBoard, fScore, currentBoard, Problem.compareBoards)
                }
            }
        }

        return {
            success: false,
            message: "No solution found"
        } as GameResponse
    }

    public async solve(problem: Problem): Promise<GameResponse> {
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
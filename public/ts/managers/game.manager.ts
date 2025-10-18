import { Board, GameResponse, PQueueItem } from "../types/game.types"
import { SlotCoords } from "../types/html.types"
import { Problem, PQueue } from "../classes/classes.index"
import { HTMLManager } from "../managers/managers.index"
import { threadCpuUsage } from "process"

export default class GameManager {
    private static instance: GameManager
    private static boardSize: number | null
    private static readonly error: Error = new Error(
        "Internal error!"
    )

    // Store goal positions for O(1) lookup
    private static goalPositions: Map<number, SlotCoords> = new Map()

    public static defaultGoal: Board =
        [[1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0]]

    // Private constructor to prevent direct instantiation
    private constructor() { }

    public static get Instance(): GameManager {
        if (!GameManager.instance) {
            GameManager.instance = new GameManager()
        }
        return GameManager.instance
    }

    /// HELPERS
    /// Several private methods are here in order to encapsulate and isolate
    /// some functions that are key to solve the given n-puzzle.
    /// Some of these helpers only hides a minor implementation and make this
    /// project a verbose one, others hides more complex implementations that
    /// are frequently performed in this A* algorithm, such as expanding and
    /// swapping possitons.
    /// This set of helpers make this project more verbose and allow devs to
    /// better read and undersand each implementation.
    /// 

    private initGoalPositions(goal: Board): void {
        if (!GameManager.boardSize)
            throw GameManager.error

        // If not initialized yet
        if (GameManager.goalPositions.size === 0)
            for (let i = 0; i < GameManager.boardSize; i++)
                for (let j = 0; j < GameManager.boardSize; j++) {
                    const value = goal[i][j]
                    if (value !== 0)  // Don't store empty tile
                        GameManager.goalPositions.set(value, { y: i, x: j })

                }
    }

    private clearGoalPositions(): void {
        GameManager.goalPositions.clear()
    }

    private async avoidLockedUI(): Promise<void> {
        await HTMLManager.delay(5) // Prevent UI to lock
    }

    private expandMoves(emptyPos: SlotCoords): Array<SlotCoords> {
        if (!GameManager.boardSize)
            throw GameManager.error

        const expanded: Array<SlotCoords> = []
        const calculated: Array<SlotCoords> = [
            { x: emptyPos.x + 1, y: emptyPos.y },
            { x: emptyPos.x - 1, y: emptyPos.y },
            { x: emptyPos.x, y: emptyPos.y + 1 },
            { x: emptyPos.x, y: emptyPos.y - 1 }
        ]

        for (const position of calculated) {
            // Skip if calculated coordinates aren't in valid ranges
            if (position.x < 0 || position.x >= GameManager.boardSize ||
                position.y < 0 || position.y >= GameManager.boardSize) continue
            expanded.push(position)
        }

        return expanded
    }

    private getEmptyPos(board: Board): SlotCoords | undefined {
        if (!GameManager.boardSize || !board)
            throw GameManager.error

        for (const row of board)
            for (const val of row)
                if (val === 0) return {
                    x: row.indexOf(val),
                    y: board.indexOf(row)
                }

        return undefined
    }

    private swap(empty: SlotCoords, slot: SlotCoords, board: Board): Board {
        if (!GameManager.boardSize || !board)
            throw GameManager.error

        // Create a deep copy of the board
        const newBoard: Board = board.map(row => [...row])

        // Perform swap on the copy
        const slotVal: number = newBoard[slot.y][slot.x]
        const emptyVal: number = newBoard[empty.y][empty.x]

        newBoard[empty.y][empty.x] = slotVal
        newBoard[slot.y][slot.x] = emptyVal

        return newBoard
    }

    private manhattan(coords_1: SlotCoords, coords_2: SlotCoords): number {
        if (!coords_1 || !coords_2)
            throw GameManager.error

        return Math.abs(coords_1.x - coords_2.x) + Math.abs(coords_1.y - coords_2.y)
    }

    private heuristic(state: Board): number {
        if (!GameManager.boardSize)
            throw GameManager.error

        let h: number = 0

        // For each value in state board (except 0 which is empty)
        for (let i = 0; i < GameManager.boardSize; i++)
            for (let j = 0; j < GameManager.boardSize; j++) {
                const value = state[i][j]
                if (value === 0) continue // Skip empty slot

                // look for position of value in goal
                const goalPos: SlotCoords = GameManager.goalPositions.get(value)!

                // Add Manhattan distance between current and goal positions
                h += this.manhattan({ x: j, y: i }, goalPos)
            }

        return h
    }

    private async backtrack(
        goalBoard: Board,
        parentsList: Map<string, Board>,
        startBoard: Board
    ): Promise<Array<SlotCoords>> {
        if (!GameManager.boardSize || !goalBoard || !startBoard || !parentsList)
            throw GameManager.error

        // Ensure exiting from backtrack
        parentsList.delete(Problem.serializeBoard(startBoard))

        const pathCoords: Array<SlotCoords> = []
        let current: Board | undefined = goalBoard
        let currentEmpty: SlotCoords | undefined = this.getEmptyPos(current)

        // if (!currentEmpty) return []
        // pathCoords.unshift(currentEmpty)

        while (Problem.serializeBoard(current) !== Problem.serializeBoard(startBoard)) {
            await this.avoidLockedUI() // Prevent UI to lock

            const currentKey = Problem.serializeBoard(current)
            const parent = parentsList.get(currentKey)

            if (!parent) break // Safety check

            currentEmpty = this.getEmptyPos(current)

            if (!currentEmpty) break // Safety check
            pathCoords.unshift(currentEmpty) // Add to beginning of array

            current = parent
        }

        return pathCoords
    }

    /// CORE METHODS
    /// Both methods are highly important for game resolution. 'aStar', as its
    /// name suggests, contains each step that A* should follow in order to
    /// attempt to solve given n-puzzle, which contains main data structures
    /// built within this project (Prioroty queue, Problem, etc.).
    /// 
    /// On the other hand, we have 'solve' public method. This' the one that
    /// exposes game and gives to aStar all required data to solve given problem.
    /// 

    private async aStar(problem: Problem): Promise<GameResponse> {
        if (!GameManager.boardSize || !problem || !problem.board || !problem.goal)
            throw GameManager.error // Safety check

        /// Data structures to use along execution
        // Priority Queue
        const openList: PQueue<Board> = new PQueue<Board>()

        // Serialized boards for comparison
        const closedSet: Set<string> = new Set()

        // "Board Key": Parent
        const parentsList: Map<string, Board> = new Map()

        // "Board Key": cost
        let gScore: Map<string, number> = new Map()

        //  Conuter limits -> 0 <= n <= 10000
        let iterations: number = 0
        const maxIterations: number = 10000

        // Initialize A* with initial board
        const startBoard = problem.board
        const startKey = Problem.serializeBoard(startBoard)
        gScore.set(startKey, 0)
        openList.enqueue(startBoard, this.heuristic(startBoard))

        while (openList.size() > 0 && iterations < maxIterations) {
            await this.avoidLockedUI() // Prevent UI to freeze
            console.log("Iteration") // Only to observe behaivor in console

            const current: PQueueItem<Board> | undefined = openList.dequeue()
            if (!current) break // Safety check

            const currentBoard = current.element
            const currentKey = Problem.serializeBoard(current.element)

            if (problem.isGoal(currentBoard)) {
                // From solution to problem
                const solution = await this.backtrack(currentBoard, parentsList, problem.board)
                return {
                    success: true,
                    message: iterations == 0
                        ? "This' not even a problem..."
                        : `Problem solved in ${solution.length} move${solution.length == 1 ? "" : "s"}!`,
                    solution: solution
                }
            }

            // If wasn't solution
            closedSet.add(currentKey)

            // Get empty slot positon
            const emptyPos: SlotCoords | undefined = this.getEmptyPos(currentBoard)

            // Unable to find solution if no empty position available
            if (!emptyPos) continue

            // Expand next available moves
            const moves: Array<SlotCoords> = this.expandMoves(emptyPos)

            iterations++

            // Analyze new possible movements
            for (const move of moves) {
                const nextBoard: Board = this.swap(emptyPos, move, currentBoard)
                const nextKey: string = Problem.serializeBoard(nextBoard)

                // Skip if we've already processed this state
                if (closedSet.has(nextKey)) continue

                // Calculate new path cost: f(x) = g(x) + h(x)
                const gTentative = 1 + gScore.get(currentKey)!

                // Only update parent and score if we find a better path
                if (!gScore.has(nextKey) || gTentative < gScore.get(nextKey)!) {
                    gScore.set(nextKey, gTentative)
                    parentsList.set(nextKey, currentBoard)  // Set parent relationship only when we find a better path

                    // Check if this is the goal state
                    if (problem.isGoal(nextBoard)) {
                        const solution = await this.backtrack(nextBoard, parentsList, problem.board)
                        return {
                            success: true,
                            message: iterations == 0
                                ? "This' not even a problem..."
                                : `Problem solved in ${solution.length} move${solution.length == 1 ? "" : "s"}!`,
                            solution: solution
                        }
                    }

                    const fScore = gTentative + this.heuristic(nextBoard)
                    const existingCost = openList.costOf(nextBoard, Problem.compareBoards)

                    if (!existingCost)
                        openList.enqueue(nextBoard, fScore, currentBoard)
                    else if (existingCost > fScore)
                        openList.updatePriority(nextBoard, fScore, currentBoard, Problem.compareBoards)
                }
            }
        }

        // If no solution was found or max iterations reached
        throw new Error(
            iterations === maxIterations
                ? "Max iterations reached."
                : "No solution found."
        )
    }

    public async solve(problem: Problem): Promise<GameResponse> {
        try {
            // Start defining problem constraints to A*
            GameManager.boardSize = problem.boardSize
            this.initGoalPositions(problem.goal)

            return await this.aStar(problem) // Try to solve problem
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                solution: undefined
            } as GameResponse
        } finally {
            this.clearGoalPositions()
            GameManager.boardSize = null
        }
    }
}
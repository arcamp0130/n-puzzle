import { GameResponse, PQueueItem } from "../types/game.types"
import { Board, SlotCoords } from "../types/shared.types"
import { Problem, PQueue } from "../classes/classes.index"
import { HTMLManager } from "../managers/managers.index"

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

    /**
     * Pre-calculates all goal positions when game starts in order to simplify
     * complexity when consulting goal game tokens positions
     * @param goal An n-sized board, same as `GameManager.boardSize`.
     */
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

    /**
     * Empties goal game tokens positions when search ends. 
     */
    private clearGoalPositions(): void {
        GameManager.goalPositions.clear()
    }

    /**
     * Adds a 5ms delay when called in order to prevent UI to lock, usefull when solving game.
     */
    private async avoidLockedUI(): Promise<void> {
        await HTMLManager.delay(5) // Prevent UI to lock
    }

    /**
     * Generates a list of new movements that are valid within game board in order to swap empty 
     * slot (zero value) with any surrounding game token (different of zero).
     * @param emptyPos Argument of type `SlotCoords` that represents the coordinates of current
     * empty slot to expand it. 
     * @returns An array of `SlotCoords` that containts a valid list of possible swaps
     * between given `emptySlot` and game token.
     */
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

    /**
     * A function that gets current position of empty slot in a board (cell with zero-value).
     * @param board An n*n matrix that represents a board with a cell with value zero.
     * @returns A `SlotCoords` value which represents current position of empty cell (zero value)
     * or `undefined` if none found. If `undefined` is returned, an internal error is present.
     */
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

    /**
     * Swaps two values in a given board in order to swap a game token with empty slot.
     * @param empty Coordinates of empty slot.
     * @param slot Coordinates of game token to swap with empty slot.
     * @param board A board to work with and swap both slot and empty positions values.
     * @returns A new board that represents a new state with swapped game tokens. 
     */
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

    /**
     * Calculates Manhattan distance between two points in a board. Here we usually
     * compare current game token position in a given state with its counterpart
     * within goal board (goal position).
     * 
     * `|x_1 - x_2| + |y_1 - y_2|`
     * @param coords_1 Coordinates of first position.
     * @param coords_2 Coordinates of second position.
     * @returns A number that represents manhattan distance between both coordinates.
     */
    private manhattan(coords_1: SlotCoords, coords_2: SlotCoords): number {
        if (!coords_1 || !coords_2)
            throw GameManager.error

        return Math.abs(coords_1.x - coords_2.x) + Math.abs(coords_1.y - coords_2.y)
    }

    /**
     * A given heuristic to calculate how costly is this node when exploring a graph (n-puzzle graph).
     * @param state Current board to calculate its cost if attempting to evaluate at A*.
     * @returns A number that represents the cost if trying to evaluate.
     */
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

    /**
     * This method is only used when A* found a path to reach a given goal. 
     * @param goalBoard The board that A* attempted to reach.
     * @param parentsList The generated list of board parents to allow a proper backtrack
     * @param startBoard The initial board of the problem, where A* started from.
     * @returns An arranged list of `SlotCoords`, from start to end (goal), which represents
     * the _journey_ that the empty slot did.
     */
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

    /**
     * This method implement an A* search alogirthm to attempt to solve a given
     * n-puzzle problem that user has submitted from UI. It always uses a 5ms delay
     * to avoid UI to lock (see `avoidLockedUI` method).
     * @param problem An instance of `Problem` class.
     * @returns an object of `GameResponse` type with success status, message and
     * solution (if any).
     */
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

        // "Board Key": g cost
        let gScore: Map<string, number> = new Map()

        //  Conuter limits -> 0 <= n <= 10000
        let iterations: number = 0
        const maxIterations: number = 10000

        // Initialize A* with initial board
        const startBoard = problem.board
        const startKey = Problem.serializeBoard(startBoard)
        gScore.set(startKey, 0)
        openList.enqueue(startBoard, this.heuristic(startBoard))

        // Search while not empty queue and max iterations not reached yet.
        while (!openList.isEmpty() && iterations < maxIterations) {
            await this.avoidLockedUI() // Prevent UI to freeze
            // Only to observe behaivor in console
            // Consider replacing it with a circle progress indicator or countdow
            console.log("Iteration")

            const current: PQueueItem<Board> | undefined = openList.dequeue()
            if (!current) break // Safety check

            const currentBoard = current.element
            const currentKey = Problem.serializeBoard(current.element)

            // If solution found right after dequeue
            if (problem.isGoal(currentBoard)) {
                const solution = await this.backtrack(currentBoard, parentsList, problem.board)
                return {
                    success: true,
                    message: iterations === 0
                        ? "This' not even a problem..."
                        : `Problem solved in ${solution.length} move${solution.length == 1 ? "" : "s"}!`,
                    solution: solution
                }
            }

            // If wasn't solution
            closedSet.add(currentKey)

            // Get empty slot positon from current board
            const emptyPos: SlotCoords | undefined = this.getEmptyPos(currentBoard)

            // Unable to find solution if no empty position available
            if (!emptyPos) continue

            // Expand next available moves
            const moves: Array<SlotCoords> = this.expandMoves(emptyPos)

            iterations++

            // Analyze next movements
            for (const move of moves) {
                const nextBoard: Board = this.swap(emptyPos, move, currentBoard)
                const nextKey: string = Problem.serializeBoard(nextBoard)

                // Skip if we've already processed this state
                if (closedSet.has(nextKey)) continue

                // Calculate new g(x) likely to be used
                const gTentative = 1 + gScore.get(currentKey)!

                // Only update parent and score if we've found a better path
                if (!gScore.has(nextKey) || gTentative < gScore.get(nextKey)!) {
                    gScore.set(nextKey, gTentative)
                    parentsList.set(nextKey, currentBoard)  // Set parent relationship only when we find a better path

                    // Check if this is the goal state
                    if (problem.isGoal(nextBoard)) {
                        const solution = await this.backtrack(nextBoard, parentsList, problem.board)
                        return {
                            success: true,
                            message: iterations === 0
                                ? "This' not even a problem..."
                                : `Problem solved in ${solution.length} move${solution.length == 1 ? "" : "s"}!`,
                            solution: solution
                        }
                    }

                    // Calculate new f score with gScore and heuristic
                    // f(x) = g(x) + h(x)
                    const fScore = gTentative + this.heuristic(nextBoard)
                    const existingCost = openList.costOf(nextBoard, Problem.compareBoards)

                    // Update cost or enqueue new element when needed
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

    /**
     * Exposes A* implementation to allow user to submit their board (problem) and
     * allow algorithm to solve it. In this sense, A* starts searching a path to solve
     * a given problem. Check `GameReponse` type to get to know more about return type.
     * @param problem An instance of `Problem` class properly initialized.
     * @returns A response of type `GameResponse` with status from solution.
     */
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
            // Clear constraints of A*
            this.clearGoalPositions()
            GameManager.boardSize = null
        }
    }
}
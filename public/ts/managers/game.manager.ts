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

    private async backtrack(
        goalBoard: Board,
        parentsList: Map<string, Board>,
        startBoard: Board
    ): Promise<Array<string>> {
        // Ensure exiting from backtrack
        parentsList.delete(Problem.serializeBoard(startBoard))

        const pathKeys: Array<string> = []
        let current: Board | undefined = goalBoard

        pathKeys.unshift(Problem.serializeBoard(current))

        while (Problem.serializeBoard(current) !== Problem.serializeBoard(startBoard)) {
            await HTMLManager.delay(5) // Prevent UI to lock

            const currentKey = Problem.serializeBoard(current);
            const parent = parentsList.get(currentKey);

            if (!parent) break; // Safety check
            const parentKey = Problem.serializeBoard(parent);

            pathKeys.unshift(parentKey); // Add to beginning of array
            current = parent;
        }
        return pathKeys;
    }

    private async aStar(problem: Problem): Promise<GameResponse> {
        const openList: PQueue<Board> = new PQueue<Board>()
        const closedSet: Set<string> = new Set() // Using serialized boards for comparison
        const parentsList: Map<string, Board> = new Map() // "Board Key": Parent
        let gScore: Map<string, number> = new Map()

        // Initialize starting node
        const startBoard = problem.board;
        const startKey = Problem.serializeBoard(startBoard);
        gScore.set(startKey, 0);
        openList.enqueue(startBoard, this.heuristic(startBoard, problem.boardSize));

        let iterations: number = 0
        const maxIterations: number = 10000
        
        while (openList.size() > 0 && iterations < maxIterations) {
            await HTMLManager.delay(5) // Prevent UI block

            const current: PQueueItem<Board> | undefined = openList.dequeue()
            if (!current) break // Safety check

            const currentBoard = current.element
            const currentKey = Problem.serializeBoard(current.element)

            if (problem.isGoal(currentBoard)) {
                // From solution to problem
                const solution = await this.backtrack(currentBoard, parentsList, problem.board);
                return {
                    success: true,
                    message: iterations == 0
                        ? "This' not even a problem..."
                        : `Problem solved in ${solution.length} move${solution.length == 1 ? "" : "s"}!`,
                    solutionKeys: solution
                };
            }

            // If wasn't solution
            closedSet.add(currentKey)

            // Get empty slot positon
            const emptyPos: SlotCoords | undefined = this.getEmptyPos(currentBoard)

            // Unable to find solution if no empty position available
            if (!emptyPos) continue

            // Expand next available moves
            const moves: Array<SlotCoords> = this.expandMoves(problem.boardSize, emptyPos)

            iterations++

            for (const move of moves) {
                const nextBoard: Board = this.swap(emptyPos, move, currentBoard)
                const nextKey: string = Problem.serializeBoard(nextBoard)

                // Skip if we've already processed this state
                if (closedSet.has(nextKey)) continue

                // Calculate new path cost
                const gTentative = gScore.get(currentKey)! + 1

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
                            solutionKeys: solution
                        }
                    }

                    const fScore = gTentative + this.heuristic(nextBoard, problem.boardSize)
                    const existingCost = openList.costOf(nextBoard, Problem.compareBoards)

                    if (!existingCost)
                        openList.enqueue(nextBoard, fScore, currentBoard)
                    else if (existingCost > fScore)
                        openList.updatePriority(nextBoard, fScore, currentBoard, Problem.compareBoards)
                }
            }
        }

        return {
            success: false,
            message: iterations > maxIterations ? "Max iterations reached." : "No solution found.",
            solution: []
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
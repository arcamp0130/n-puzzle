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
        const slotVal: number = board[slot.y][slot.x]
        const emptyVal: number = board[empty.y][empty.x]

        board[empty.y][empty.x] = slotVal
        board[slot.y][slot.x] = emptyVal
        // 0 is always empty slot

        return board
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
        const openList: PQueue<Board> = new PQueue<Board>()
        const closeList: PQueue<Board> = new PQueue<Board>()
        const discovered: Set<Board> = new Set<Board>()
        const visited: Set<Board> = new Set<Board>() // Visited states, no parents
        let iterator: number = 0

        openList.enqueue(problem.board, 0)
        closeList.enqueue(problem.board, 0)

        // While openList is not empty
        while (openList.size() > 0) {
            await HTMLManager.delay(500) // Prevent UI to block
            // Ensure exiting when openList empty
            if (openList.peek() === undefined) break
            const current: PQueueItem<Board> = openList.dequeue()!

            if (problem.isGoal(current.element)) return {
                success: true,
                message: "Problem solved!"
            } as GameResponse

            iterator++
            const emptyPos: SlotCoords | undefined = this.getEmptyPos(current.element)

            // Unable to find solution if no empty position available
            if (emptyPos === undefined) break

            const newMoves: Array<SlotCoords> = this.expandMoves(problem.boardSize, emptyPos)
            for (const move of newMoves) {
                const descendant: Board = this.swap(emptyPos, move, current.element)
                const newCost = iterator + this.heuristic(descendant, problem.boardSize)

                // If alredy visited
                if (visited.has(descendant)) {
                    const cost: number | undefined
                        = closeList.costOf(descendant, Problem.compareBoards)

                    // Return to open list if new cost is lower
                    if (cost !== undefined && cost > newCost) {
                        openList.enqueue(descendant, newCost)
                        closeList.remove(descendant, Problem.compareBoards)
                        continue // next move
                    }

                }

                // If alredy discovered
                if (discovered.has(descendant)) {
                    const cost: number | undefined
                        = openList.costOf(descendant, Problem.compareBoards)

                    // Update cost element in open list if new cost is lower
                    if (cost !== undefined && cost > newCost) {
                        openList.updatePriority(
                            descendant,             // new state
                            newCost,                // new cost
                            current.element,        // parent
                            Problem.compareBoards   // compare function
                        )
                        continue // next move
                    }
                }
                // console.log("Not visited or discovered")
                // If not visited or discovered yet, add to open list and mark discovered
                openList.enqueue(descendant, newCost)
                discovered.add(descendant)
            }
            // add current to closeList and mark as visited
            closeList.enqueue(current.element, current.cost, current.parent)
            visited.add(current.element)

        }

        // Mock
        return {
            success: false,
            message: "[Mock] No solution found"
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
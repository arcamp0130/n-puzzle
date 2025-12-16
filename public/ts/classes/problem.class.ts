import { Board } from "../types/shared.types"

export default class Problem {
    public readonly board: Board
    public readonly boardSize: number
    public readonly goal: Board
    public static readonly defaultGoal: Board = [
        [1, 2, 3, 4],
        [5, 6, 7, 8],
        [9, 10, 11, 12],
        [13, 14, 15, 0]
    ]

    /**
     * ## Constructor.
     * `Problem` class should be instantiated when user wants to submit problem to
     * algorithm and let it solve provided board.
     * @param board A n*n matrix board, where n is the same as `boardSize` argument.
     * @param boardSize The size of the board provided by client (a square).
     * @param goal Optional. A n*n board to reach when attempting to solve problem.
     */
    public constructor(board: Board, boardSize: number, goal?: Board,) {
        this.board = board
        this.boardSize = boardSize
        this.goal = goal || Problem.defaultGoal
    }

    /**
     * Serializes provided board into a string in order to generate a 'key' for
     * each possible board, therefore algorithm becomes more efficient when comparing
     * boards.
     * @param board a n*n matrix board.
     * @returns a `string` containing serialized board
     */
    public static serializeBoard(board: Board): string {
        return board.map(row => row.join(',')).join('|');
    }

    /**
     * Compares two given boards —no previously serialized— to know if both
     * of them are the same or diferent ones.
     * @param first first n*n matrix board to compare
     * @param second second n*n matrix board to compare
     * @returns `true` if both boards are equal, otherwise `false`.
     */
    public static compareBoards = function (
        first: Board,
        second: Board
    ): boolean {
        if (!first || !second) return false;
        return Problem.serializeBoard(first) === Problem.serializeBoard(second);
    }

    /**
     * Compares a no-serialized board with goal board previously defined at the
     * beggining of problem creation in order to know if provided board is the same
     * as the goal.
     * @param state a n*n matrix board
     * @returns `true` if given board is the same as the goal, otherwise `false`.
     */
    public isGoal(state: Board): boolean {
        return Problem.compareBoards(state, this.goal)
    }
}
import { Board } from "../types/game.types"
import { GameManager } from "../managers/managers.index"

export default class Problem {
    public readonly board: Board
    public readonly boardSize: number
    public readonly goal: Board

    public constructor(board: Board, boardSize: number, goal?: Board,) {
        this.board = board
        this.boardSize = boardSize
        this.goal = goal || GameManager.defaultGoal
    }

    public static serializeBoard(board: Board): string {
        return board.map(row => row.join(',')).join('|');
    }

    public static compareBoards = function (
        first: Board,
        second: Board
    ): boolean {
        if (!first || !second) return false;
        return Problem.serializeBoard(first) === Problem.serializeBoard(second);
    }

    public isGoal(state: Board): boolean {
        return Problem.compareBoards(state, this.goal)
    }
}
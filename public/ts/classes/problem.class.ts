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

    public isGoal(state: Board) {
        return state === this.goal
    }
}
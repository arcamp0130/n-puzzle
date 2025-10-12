import { Board } from "../types/game.types"

export default class Problem {
    public readonly board: Board
    public readonly boardSize: number
    public readonly goal: Board

    public constructor(board: Board, boardSize: number, goal: Board,) {
        this.board = board
        this.boardSize = boardSize
        this.goal = goal
    }

    public isGoal(state: Board) {
        return state === this.goal
    }
}
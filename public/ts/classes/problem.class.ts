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

    public static compareStates = function (
        first: Board,
        second: Board = GameManager.defaultGoal
    ) : boolean {

        // Serialize both states to compare
        const jsonFirst = JSON.stringify(first)
        const jsonSecond = JSON.stringify(second)

        return jsonFirst === jsonSecond
    }

    public isGoal(state: Board): boolean {
        return Problem.compareStates(state, this.goal)
    }
}
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

    public static compareBoards = function (
        first: Board,
        second: Board
    ): boolean {
        if (!first || !second) return false;
        
        // Compare dimensions first
        if (first.length !== second.length) return false;
        
        // Compare each row
        for (let i = 0; i < first.length; i++) {
            if (first[i].length !== second[i].length) return false;
            for (let j = 0; j < first[i].length; j++) {
                if (first[i][j] !== second[i][j]) return false;
            }
        }
        return true;
    }

    public isGoal(state: Board): boolean {
        return Problem.compareBoards(state, this.goal)
    }
}
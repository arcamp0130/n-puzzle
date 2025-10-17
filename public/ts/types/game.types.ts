import { SlotCoords } from "./html.types"

export type Board = number[][]

export interface PQueueItem<T> {
    element: T
    cost: number
    parent?: T
}

export interface BoardState {
    element: Board
    parent?: Board
}

export interface GameResponse {
    message: string
    success: boolean
    solution?: Array<SlotCoords>  // Array of board states from initial to goal
}

import { SlotCoords } from "./html.types"

export enum MoveWith {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right'
}

export type Board = number[][]

export interface PQueueItem<T> {
    element: T
    cost: number
    parent?: Board
}

export interface GameResponse {
    message: string
    success: boolean
}

export { SlotCoords }
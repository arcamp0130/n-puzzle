import { SlotCoords } from "./html.types"

export type Board = number[][]

export type PQueueItem<T> = {
    element: T
    cost: number
    parent?: T
}

export type GameResponse = {
    message: string
    success: boolean
    solution?: Array<SlotCoords>  // Array of emptySlot positions
}

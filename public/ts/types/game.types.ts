import { SlotCoords } from "./shared.types"

export type PQueueItem<T> = {
    element: T
    cost: number
    parent?: T
}

export type GameResponse = {
    message: string
    success: boolean
    solution?: Array<SlotCoords>
}

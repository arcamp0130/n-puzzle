export type Board = number[][]

export interface PQueueItem<T> {
    element: T
    cost: number
}

export interface GameResponse {
    message: string
    success: boolean
}
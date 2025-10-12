export type Board = number[][]

export interface PQueueItem<T> {
    element: T
    cost: number
}
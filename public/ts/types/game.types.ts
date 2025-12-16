export type PQueueItem<T> = {
    element: T
    cost: number
    parent?: T
}

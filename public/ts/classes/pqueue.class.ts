import { PQueueItem } from "../types/game.types"

export default class PQueue<T> {
    private items: PQueueItem<T>[] = []

    constructor() { }

    // Binary search to arrange array. Lower-cost element at pos 0
    public enqueue(element: T, cost: number): void {

    }

    // Extract first item's element in array
    public dequeue(): T | undefined {
        return this.items.shift()?.element
    }

    public peek(): T | undefined {
        return this.items[0]?.element
    }

    public contains(
        element: T,
        compare: (a: T, b: T) => boolean
    ): boolean {
        return true // Placeholder
    }

    // True if found and replaced
    public updatePriotity(
        element: T,
        cost: number,
        compare: (a: T, b: T) => boolean
    ): boolean {
        return true // Placeholder
    }

    public size(): number {
        return this.items.length
    }

    public isEmpty(): boolean {
        return this.items.length === 0
    }

    public clear(): void {
        this.items = []
    }

}
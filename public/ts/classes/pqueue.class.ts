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
    public updatePriority(
        element: T,
        newCost: number,
        compare: (a: T, b: T) => boolean
    ): boolean {
        const index = this.items.findIndex(
            (item: PQueueItem<T>) => compare(item.element, element)
        )

        // If no coincidence found, exit with false
        if (index === -1) return false

        // First, remove element in array
        this.items.splice(index, 1)

        // Now, queue again removed element
        this.enqueue(element, newCost)

        // Exit with true if element replaced
        return true

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
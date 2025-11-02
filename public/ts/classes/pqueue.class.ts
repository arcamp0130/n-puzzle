import { PQueueItem } from "../types/game.types"

export default class PQueue<T> {
    private items: PQueueItem<T>[]

    /**
     * ## Constructor
     * Initializes and created a new priority queue with an empty array
     * of elements which will be arranged based on a cost/weight that represents
     * how expensive is explore given element or node.
     * 
     * You must specify a type for elements in queue.
     */
    constructor() { this.items = [] }

    /**
     * Binary search to arrange array and insert new element.
     * @param element An object with the same type as PQueue `T` type. 
     * @param cost f(x) — Weight of provided element (node)
     * @param parent If any, a parent with the same type as `element` 
     */
    public enqueue(element: T, cost: number, parent?: T): void {
        // Build new item
        const newItem: PQueueItem<T> = { element, cost, parent }

        // Indexes of both ends of array
        let low: number = 0
        let high: number = this.size() - 1

        // Find point to insert new element
        while (low < high) {
            const mid: number = Math.floor(
                (high - low) / 2 // Distance between both points, divided
            ) + low // Fix 'low' substraction to get actual index

            // If a same-cost element was found, stop searching
            if (this.items[mid].cost === cost) {
                low = mid
                break // while
            }

            if (this.items[mid].cost > cost)
                high = mid - 1
            else
                low = mid + 1
        }

        // Insert new element at the found index
        this.items.splice(low, 0, newItem)
    }

    /**
     * Searches, removes and returns first element in queue.
     * @returns The first element on priority list. `undefined` if no one available
     */
    public dequeue(): PQueueItem<T> | undefined {
        return this.items.shift()
    }

    /**
     * With a `T` type target, searches along items in queue to attempt to remove given target.
     * @param target An element of the same type as PQueue `T` type.
     * @param compare A comparison function to compare both target and each element in queue.
     * @returns `true` if target found and removed, `false` otherwise.
     */
    public remove(
        target: T,
        compare: (a: T, b: T) => boolean
    ): boolean {
        const index = this.items.findIndex(
            (item: PQueueItem<T>) => compare(item.element, target)
        )

        // If no coincidence found, exit with false
        if (index === -1) return false

        // Remove element in array
        // Exit with true if correctly removed
        this.items.splice(index, 1)
        return true

    }

    /**
     * Checks queue and attempts to return first element in queue.
     * @returns First element in queue without removing it. `undefined` if no one.
     */
    public peek(): T | undefined {
        return this.items[0]?.element
    }

    /**
     * Tries to find and retrive cost of provided element without removing or modifying it.
     * @param element A target of the same type as PQueue `T` type.
     * @param compare A comparison function to compare both target and each element in queue
     * @returns A `number` value to given target if found, `undefined` otherwise.
     */
    public costOf(element: T, compare: (a: T, b: T) => boolean): number | undefined {
        let cost: number | undefined = undefined

        this.items.forEach((item: PQueueItem<T>) => {
            if (compare(item.element, element))
                cost = item.cost
        })

        return cost
    }

    /**
     * Tries to find a coincidence of provided target within queue. 
     * @param target A target of the same type as PQueue `T` type.
     * @param compare A comparison function to compare both target and each element in queue
     * @returns `true` if any element found, `false` otherwise.
     */
    public contains(
        target: T,
        compare: (a: T, b: T) => boolean
    ): boolean {
        return this.items.some(
            (item: PQueueItem<T>) => compare(item.element, target)
        )
    }

    /**
     * Tries to find and update priority of given target within queue by looking up along whole queue.
     * @param element A target of the same type as PQueue `T` type to update its cost.
     * @param newCost A new `number` value which represents `element`'s new cost.
     * @param parent A new parent of `element`.
     * @param compare A compare function to attempt to find element in queue and continue if any coincidence.
     * @returns `true` if target found and updated cost, `false` otherwise.
     */
    public updatePriority(
        element: T,
        newCost: number,
        parent: T,
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

    /**
     * Gets current size of queue
     * @returns size of queue
     */
    public size(): number {
        return this.items.length
    }

    /**
     * Check if there's any element in queue.
     * @returns `true` if no elements in queue, `false` otherwise.
     */
    public isEmpty(): boolean {
        return this.items.length === 0
    }

    /**
     * Can be used as destructor of this queue.
     * Removes all elements in queue without retrieving them. 
     * 
     * #### **Use with caution. All data so far will be lost.**
     */
    public clear(): void {
        this.items = []
    }

}
import { PQueueItem } from "../types/game.types"

export default class PQueue<T> {
    private items: PQueueItem<T>[] = []

    constructor() { }

    public enqueue(element: T, cost: number): void {

    }

    public dequeue(): void {

    }

    public peek(): void {

    }

    public contains(): void {

    }

    public updatePriotity(): void {
        
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
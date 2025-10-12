import { PQueueItem } from "../types/game.types"

export default class PQueue<T> {
    private items: PQueueItem<T>[] = []

    constructor() {}
}
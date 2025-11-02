export type Board = number[][]

export type SlotCoords = {
    x: number,
    y: number
}

export type GameResponse = {
    message: string
    success: boolean
    solution?: Array<SlotCoords>
}
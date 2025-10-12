export enum AlertStatus {
    IDLE = "idle",
    SUCCESS = "success",
    ERROR = "error",
    WARNING = "warning"
}

export enum SlotStatus {
    FILL = "fill",
    EMPTY = "empty"
}

export type Alert = {
    status: AlertStatus,
    message: string
}

export type Slot = {
    x: number,
    y: number,
    value: string,
    status: SlotStatus
}

export interface SlotCoords {
    x: number,
    y: number
}
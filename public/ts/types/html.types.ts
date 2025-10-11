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
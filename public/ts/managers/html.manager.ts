import { Alert, AlertStatus, Slot, SlotStatus } from "../types/html.types"

export default class htmlManager {
    private static instance: htmlManager
    public static stepDelay: number = 100
    
    private boardSize: number = 4
    private defaultAlert: Alert = {
        status: AlertStatus.IDLE,
        message: "Start playing!"
    }
    private readonly alert: {
        container: HTMLElement,
        message: HTMLElement
    }
    private readonly board: HTMLElement
    private readonly cover: HTMLElement
    private readonly buttons: { [key: string]: HTMLButtonElement }

    // Private constructor to prevent direct instantiation
    private constructor() {
        this.board = document.querySelector("#board") as HTMLElement
        this.buttons = {
            "solve": document.querySelector("button#solve") as HTMLButtonElement,
            "reset": document.querySelector("button#reset") as HTMLButtonElement,
            "random": document.querySelector("button#random") as HTMLButtonElement,
        }
        this.alert = {
            container: document.querySelector(".alert") as HTMLElement,
            message: document.querySelector("#message") as HTMLElement
        }
        this.cover = document.querySelector("#cover") as HTMLElement,
        this.init()
    }

    public static get Instance(): htmlManager {
        if (!htmlManager.instance) {
            htmlManager.instance = new htmlManager()
        }
        return htmlManager.instance
    }

    private init(): void {
        this.generateGame()
        this.addButtonsListeners()
        this.updateAlert(this.defaultAlert)
    }

    private async delay(ms: number | null = null): Promise<void> {
        return new Promise(_ => setTimeout(_, ms || htmlManager.stepDelay));
    }

    private toggleCover(): void {
        this.cover.style.display
        = this.cover.style.display === "flex" ? "none" : "flex"
    }

    private toggleInputs() {
        for (const button in this.buttons) {
            this.buttons[button].disabled = !this.buttons[button].disabled
        }
        this.toggleCover();
    }

    private async solveGame(): Promise<void> {
        this.toggleInputs() // Disabled
        this.updateAlert({
            status: AlertStatus.IDLE,
            message: "Solving..."
        } as Alert)

        // Mock behaivor
        await this.delay(1000)

        this.toggleInputs() // Enabled

        // Mock behaivor
        this.updateAlert({
            status: AlertStatus.SUCCESS,
            message: "Solved!"
        } as Alert)
    }

    private async mixBoard(): Promise<void> {
        this.toggleInputs() // Disable
        this.updateAlert({
            status: AlertStatus.IDLE,
            message: "Mixing..."
        } as Alert)

        // Mock behaivor
        await this.delay(1000)
        this.toggleInputs() // Enabled
        this.updateAlert({
            status: AlertStatus.IDLE,
            message: "Mixed!"
        } as Alert)
    }

    private restartGame(): void {
        this.generateGame()
        this.updateAlert(this.defaultAlert)
    }

    private isValidSwap(empty: Slot, slot: Slot): boolean {
        if (empty.value === slot.value) return false

        // Expand empty slot coordinates to find coincidence
        if (empty.x === slot.x && (empty.y - 1 === slot.y || empty.y + 1 === slot.y) ||
            empty.y === slot.y && (empty.x - 1 === slot.x || empty.x + 1 === slot.x))
            return true

        return false;
    }

    private swapEmptyWith(slot: HTMLElement): void {
        const empty = this.board.querySelector(
            `span.slot[data-status="${SlotStatus.EMPTY}"]`
        ) as HTMLElement

        // Used to temporary store original values
        const emptySlot: Slot = {
            x: parseInt(empty.dataset.x as string),
            y: parseInt(empty.dataset.y as string),
            value: empty.innerHTML,
            status: empty.dataset.status as SlotStatus
        }
        const slotPos: Slot = {
            x: parseInt(slot.dataset.x as string),
            y: parseInt(slot.dataset.y as string),
            value: slot.innerHTML,
            status: slot.dataset.status as SlotStatus
        }

        if (!this.isValidSwap(emptySlot, slotPos)) {
            const illegalMove: Alert = {
                status: AlertStatus.WARNING,
                message: `Can't move ${slotPos.value}`
            }
            this.updateAlert(illegalMove)
            return
        }

        empty.innerHTML = slotPos.value
        empty.dataset.status = slotPos.status

        slot.innerHTML = emptySlot.value
        slot.dataset.status = emptySlot.status

        this.updateAlert(this.defaultAlert)
    }

    private updateAlert(newAlert: Alert) {
        this.alert.container.dataset.status = newAlert.status
        this.alert.message.innerHTML = newAlert.message
    }

    private generateGame(): void {
        const slot = document.createElement("span")
        const lastSlotVal = this.boardSize * this.boardSize

        slot.classList.add("slot")
        this.board.innerHTML = ""

        // Generating gameboard
        for (let i = 0; i < this.boardSize; i++) { // y possition
            for (let j = 0; j < this.boardSize; j++) { // x possition
                const index = (i * this.boardSize) + (j + 1)
                slot.innerHTML = ""
                slot.dataset.y = `${i}`
                slot.dataset.x = `${j}`

                if (index !== lastSlotVal) {
                    slot.innerHTML = `${index}`
                    slot.dataset.status = SlotStatus.FILL
                } else {
                    slot.dataset.status = SlotStatus.EMPTY
                }

                this.board.appendChild(slot.cloneNode(true))

            } // end x pos
        } // end y pos

        this.addSlotsListeners()
    }

    private addSlotsListeners() {
        const slots = document.querySelectorAll("span.slot") as NodeListOf<HTMLElement>
        slots.forEach(slot => {
            slot.addEventListener("click", () =>
                this.swapEmptyWith(slot)
            )
        })
    }

    private addButtonsListeners() {
        this.buttons["solve"].addEventListener("click", async () =>
            await this.solveGame()
        )
        this.buttons["reset"].addEventListener("click", () =>
            this.restartGame()
        )
        this.buttons["random"].addEventListener("click", async () =>
            await this.mixBoard()
        )

    }
}
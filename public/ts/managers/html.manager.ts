import { Alert, AlertStatus, Slot, SlotStatus, SlotCoords } from "../types/html.types"

export default class htmlManager {
    private static instance: htmlManager
    public static stepDelay: number = 200

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
    private readonly movesInput: HTMLInputElement

    // Private constructor to prevent direct instantiation
    private constructor() {
        this.board = document.querySelector("#board") as HTMLElement
        this.movesInput = document.querySelector("#mix-moves") as HTMLInputElement
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

    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    private toggleCover(): void {
        this.cover.style.display
            = this.cover.style.display === "flex" ? "none" : "flex"
    }

    private toggleInputs() {
        this.movesInput.disabled = !this.movesInput.disabled
        for (const button in this.buttons) {
            this.buttons[button].disabled = !this.buttons[button].disabled
        }
        this.toggleCover();
    }

    private expandEmpty(empty: SlotCoords): Array<SlotCoords> {
        const neigbhors: Array<SlotCoords> = [
            { x: empty.x - 1, y: empty.y } as SlotCoords,
            { x: empty.x + 1, y: empty.y } as SlotCoords,
            { x: empty.x, y: empty.y - 1 } as SlotCoords,
            { x: empty.x, y: empty.y + 1 } as SlotCoords
        ]

        const expanded: Array<SlotCoords> = []
        for (const slot of neigbhors) {
            if (slot.x < 0 || slot.x >= this.boardSize ||
                slot.y < 0 || slot.y >= this.boardSize)
                continue

            expanded.push(slot)
        }

        return expanded
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

    private async randomMix(): Promise<void> {
        const emptySlot = this.board.querySelector(
            `span.slot[data-status="${SlotStatus.EMPTY}"]`
        ) as HTMLElement
        const coords: SlotCoords = {
            x: parseInt(emptySlot.dataset.x as string),
            y: parseInt(emptySlot.dataset.y as string)
        }
        const expanded: Array<SlotCoords> = this.expandEmpty(coords)
        const randIndex = this.randomInt(0, expanded.length - 1)
        const randSlot = this.board.querySelector(
            `span.slot[data-x="${expanded[randIndex].x}"][data-y="${expanded[randIndex].y}"]`
        ) as HTMLElement

        // Skip valid movement because of 'expandEmpty' return 
        this.swapEmptyWith(randSlot, false)

        await this.delay()  // Prevent UI to lock
    }

    private async mixBoard(): Promise<void> {
        const mixMoves: number = parseInt(this.movesInput.value)
        if (isNaN(mixMoves) || mixMoves <= 0 || mixMoves > 1000) {
            this.updateAlert({
                status: AlertStatus.ERROR,
                message: `Moves must be a number between 1 and 1000`
            } as Alert)
            return
        }

        this.toggleInputs() // Disable
        this.updateAlert({
            status: AlertStatus.IDLE,
            message: `Moving board ${mixMoves} times` 
        } as Alert)

        for (let i = 0; i < mixMoves; i++)
            await this.randomMix()

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

        const slotCoords: SlotCoords = {
            x: slot.x,
            y: slot.y
        } as SlotCoords

        const neigbhors: Array<SlotCoords> = this.expandEmpty({
            x: empty.x,
            y: empty.y
        } as SlotCoords)

        for (const slot of neigbhors)
            if (slot.x === slotCoords.x && slot.y === slotCoords.y)
                return true

        return false;
    }

    private swapEmptyWith(slot: HTMLElement, fromClient: boolean = true): void {
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
        if (fromClient)
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
        
        if (fromClient)
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
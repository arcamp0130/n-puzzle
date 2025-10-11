import { Alert, AlertStatus, SlotStatus } from "../types/html.types"

export default class htmlManager {
    private static instance: htmlManager
    private board: HTMLElement
    private boardSize: number = 4
    private defaultAlert: Alert = {
        status: AlertStatus.IDLE,
        message: "Start playing!"
    }
    private readonly alert: {
        container: HTMLElement,
        message: HTMLElement
    }
    public readonly buttons: { [key: string]: HTMLButtonElement }
    public stepDelay: number = 100

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

    // Mocking solve and mix delay

    private async solveGame(): Promise<void> {
        await new Promise(_ => setTimeout(_, this.stepDelay))
        console.log("Solving game")
    }

    private async mixBoard(): Promise<void> {
        await new Promise(_ => setTimeout(_, this.stepDelay))
        console.log("Mixing board")
    }

    private restartGame(): void {
        this.generateGame()
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
            if (slot.dataset.status !== SlotStatus.EMPTY)
                slot.addEventListener("click", () =>
                    console.log(`Piece ${slot.innerHTML} clicked`)
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
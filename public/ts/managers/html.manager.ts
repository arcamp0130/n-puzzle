export default class htmlManager {
    private static instance: htmlManager
    private board: HTMLElement
    private boardSize: number = 4
    public stepDelay: number = 100
    public readonly buttons: { [key: string]: HTMLButtonElement }

    // Private constructor to prevent direct instantiation
    private constructor() {
        this.board = document.querySelector("#board") as HTMLElement
        this.buttons = {
            "solve": document.querySelector("button#solve") as HTMLButtonElement,
            "reset": document.querySelector("button#reset") as HTMLButtonElement,
            "random": document.querySelector("button#random") as HTMLButtonElement,
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
        this.addButtonsListeners();
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
                    slot.dataset.status = "fill"
                } else {
                    slot.dataset.status = "empty"
                }

                this.board.appendChild(slot.cloneNode(true))

            } // end x pos
        } // end y pos

        this.addSlotsListeners()
    }

    private addSlotsListeners() {
        const slots = document.querySelectorAll("span.slot") as NodeListOf<HTMLElement>
        slots.forEach(slot => {
            if (slot.dataset.status !== "empty")
                slot.addEventListener("click", () =>
                    console.log(`Piece ${slot.innerHTML} clicked` )
                )
        })
    }

    private addButtonsListeners() {
        this.buttons["solve"].addEventListener("click", async () =>
            await this.solveGame()
        )
        this.buttons["reset"].addEventListener("click", () =>
            this.generateGame()
        )
        this.buttons["random"].addEventListener("click", async () =>
            await this.mixBoard()
        )

    }
}
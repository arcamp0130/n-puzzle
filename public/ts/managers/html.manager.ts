export default class htmlManager {
    private static instance: htmlManager
    private board: HTMLElement
    private boardSize: number = 4
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
    }

    private generateGame(): void {
        const slot = document.createElement("span")
        slot.classList.add("slot")
        this.board.innerHTML = ""

        // Generating gameboard
        for (let i = 0; i < this.boardSize; i++) { // y possition
            for (let j = 0; j < this.boardSize; j++) { // x possition
                const index = (i * this.boardSize) + (j + 1)
                slot.innerHTML = ""
                slot.dataset.y = `${i}`
                slot.dataset.x = `${j}`

                if (index !== this.boardSize * this.boardSize) {
                    slot.innerHTML = `${index}`
                    slot.dataset.status = "fill"
                } else {
                    slot.dataset.status = "empty"
                }

                this.board.appendChild(slot.cloneNode(true))

            } // end x pos
        } // end y pos
    }
}
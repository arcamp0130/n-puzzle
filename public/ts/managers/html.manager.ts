import { Alert, AlertStatus, Slot, SlotStatus } from "../types/html.types"
import { Board, SlotCoords, GameResponse } from "../types/shared.types"
import { Problem } from "../classes/classes.index"
import { GameManager } from "./managers.index"

export default class HTMLManager {
    private static instance: HTMLManager
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

    /// CORE METHODS
    /// The following core functions are essential to properly intantiate this class
    /// following a singleton design pattern, generate game board on screen, toggle
    /// several element in screen, such as inputs and board cover, among other
    /// functions.
    /// 

    public static get Instance(): HTMLManager {
        if (!HTMLManager.instance) {
            HTMLManager.instance = new HTMLManager()
        }
        return HTMLManager.instance
    }

    /**
     * Initialize UI to allow user to interact with game.
     * @returns nothing
     */
    private init(): void {
        this.generateGame()
        this.addButtonsListeners()
        this.updateAlert(this.defaultAlert)
    }

    /**
     * Generates and paints a solved game on-screen by removing the previous
     * one and replacing it with the solved one.
     * @returns nothing
     */
    private generateGame(): void {
        const slot = document.createElement("span")
        // Precalculate slot value to actually be zero
        const lastSlotVal = this.boardSize * this.boardSize

        slot.classList.add("slot")
        this.board.innerHTML = "" // Clear board

        // Generating board
        for (let y = 0; y < this.boardSize; y++) { // y possition
            for (let x = 0; x < this.boardSize; x++) { // x possition
                // Calculate slot value
                const index = (y * this.boardSize) + (x + 1)
                slot.innerHTML = "" // Clear slot data
                slot.dataset.y = `${y}`
                slot.dataset.x = `${x}`

                if (index !== lastSlotVal) {
                    slot.innerHTML = `${index}`
                    slot.dataset.status = SlotStatus.FILL
                } else {
                    slot.dataset.status = SlotStatus.EMPTY
                }

                // Add game token in board
                this.board.appendChild(slot.cloneNode(true))

            } // end x pos
        } // end y pos

        this.addSlotsListeners()
    }


    /// ADD LISTENERS
    /// As part of game initialization, is required to append listeners to
    /// several elements in DOM, these being game slots and buttons.
    /// These are only two methods, and addSlotListeners is the only one that
    /// is called more than once.
    /// 

    /**
     * Gets all slots in board and append a click listener to attempt to
     * swap clicked slot with the empty one. No arguments or return.
     * 
     */
    private addSlotsListeners(): void {
        const slots = document.querySelectorAll("span.slot") as NodeListOf<HTMLElement>
        slots.forEach(slot => {
            slot.addEventListener("click", () =>
                this.swapEmptyWith(slot)
            )
        })
    }

    /**
     * Called once in page lifespan.
     * 
     * Appends click listeners to solve, reset and mix buttons to allow client
     * to interact with game.
     * @returns nothing
     */
    private addButtonsListeners(): void {
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


    /// TOGGLE 
    /// These methods are used to disable and enable, when required, buttons,
    /// text fields (mix movements) and board cover, so user can't modify any game
    /// parameter when any algorithm is in execution.
    /// 

    /**
     * Activates or deactivates invisible cover to allow or avoid client to modify
     * board and set a new problem.
     * @returns nothing
     */
    private toggleCover(): void {
        this.cover.style.display
            = this.cover.style.display === "flex" ? "none" : "flex"
    }

    /**
     * Activates or deactivates buttons and text fields on screen to allow or avoid
     * client to attempt to mix or reset board, or submbit problem. Also calls to
     * `toggleCover` to apply same changes.
     * @returns nothing
     */
    private toggleInputs(): void {
        this.movesInput.disabled = !this.movesInput.disabled
        for (const button in this.buttons) {
            this.buttons[button].disabled = !this.buttons[button].disabled
        }
        this.toggleCover();
    }


    /// HELPERS
    /// Lots of main methods are included here, some with an easy and short
    /// logic, others quite complex.
    /// 
    /// These helpers are important to allow several methods to work properly
    /// and avoid rewritting code. Larger helpers are used to handle board
    /// auto-mix.
    /// 

    /**
     * Stops any execution to add a time gap and, after elapsed time, resume proccess.
     * @param ms time to pause proccess (miliseconds).
     * @returns nothing
     */
    public static async delay(ms: number | null = null): Promise<void> {
        return new Promise(_ => setTimeout(_, ms || HTMLManager.stepDelay));
    }

    /**
     * Generates a random integer in range, including ends.
     * @param min lower limit.
     * @param max upper limit.
     * @returns a random integer.
     */
    private randomInt(min: number, max: number): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Updates alert on UI to notify client about anything that user must
     * know about the game.
     * @param newAlert An object of type `Alert`.
     * @returns nothing
     */
    private updateAlert(newAlert: Alert): void {
        this.alert.container.dataset.status = newAlert.status
        this.alert.message.innerHTML = newAlert.message
    }

    /**
     * Generates a list of available slots to swap with given empty slot on UI.
     * @param empty position of empty slot in UI.
     * @returns A list of coordinates of valid moves from empty slot.
     */
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

    /**
     * Compares two slots and checks if are able to swap. In this sense, `empty` parammeter
     * MUST be an empty slot.
     * @param empty (suposed) empty slot.
     * @param slot Slot to swap with (suposed) empty.
     * @returns `true` if it's a valid swap, `false` otherwise.
     */
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

    /**
     * Attempts to swap an slot in UI with empty slot.
     * @param slot An slot `span` element from board to attempt to swap with empty slot.
     * @param fromClient Specify if swap has been attemptted by client. Defaults to `true`.
     * @returns nothing
     */
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

    /**
     * Randomly mixes any valid game token with empty slot.
     * @returns nothing
     */
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

        await HTMLManager.delay()  // Prevent UI to lock
    }
    
    /**
     * Generates board on UI as a matrix.
     * @returns Board on UI as matrix
     */
    private getBoardMatrix(): Board {
        const slots: NodeListOf<HTMLSpanElement>
            = this.board.querySelectorAll(
                "span.slot"
            ) as NodeListOf<HTMLSpanElement>

        // Initialize matrix with an n*n matrix
        const matrix: Board =
            Array(this.boardSize).fill(0).map(() =>
                Array(this.boardSize).fill(0))

        for (const slot of slots) {
            const coords: SlotCoords = {
                x: parseInt(slot.dataset.x as string),
                y: parseInt(slot.dataset.y as string)
            } as SlotCoords
            const val = parseInt(slot.innerHTML) || 0

            matrix[coords.y][coords.x] = val
        }

        return matrix
    }

    /**
     * Only called if a solution to problem was found. Shows, to client, the discovered solution, found by algorithm.
     * @param solution An arranged array of coordinates that represent the 'journey' done by the empty slot.
     * @returns nothing
     */
    private async paintSolution(solution: Array<SlotCoords>): Promise<void> {
        let i: number = 0
        for (const coordinate of solution) {
            const slot: HTMLElement | null = this.board.querySelector(
                `span.slot[data-x="${coordinate.x}"][data-y="${coordinate.y}"]`
            )

            if (!slot) throw new Error("Something went wrong while showing solution"); // Safety check

            this.updateAlert({
                status: AlertStatus.WARNING,
                message: `${solution.length - i} moves left`
            } as Alert)
            this.swapEmptyWith(slot, false)

            await HTMLManager.delay() // Await slot to swap on-screen
            i++
        }
    }

    /// ACTIONS
    /// These methods are called when solve, restart and mix buttons are
    /// pressed. May be called more than once, but they only have a single
    /// reference within this file.
    /// 

    /**
     * Called when client clicks the solve button on screen. Attempts to get a
     * solution to the submitted problem and, if solution found, invokes method
     * to show solution on screen. Handling exceptions.
     * @returns nothing
     */
    private async solveGame(): Promise<void> {
        const GameMgr = GameManager.Instance
        this.toggleInputs() // Disabled
        this.updateAlert({
            status: AlertStatus.IDLE,
            message: "Solving..."
        } as Alert)

        const res: GameResponse = await GameMgr.solve(new Problem(
            this.getBoardMatrix(),
            this.boardSize,
        ))

        try {
            if (res.success && res.solution)
                await this.paintSolution(res.solution)

            this.updateAlert({
                status: res.success ? AlertStatus.SUCCESS : AlertStatus.ERROR,
                message: res.message
            } as Alert)
        } catch (error: any) {
            this.updateAlert({
                status: AlertStatus.ERROR,
                message: error.message
            } as Alert)
        }

        this.toggleInputs() // Enabled
    }

    /**
     * Called when user wants to restart board on screen. This method cleans
     * and re-generates game tokens for each slot in board, adding required
     * and setting page on its initial state.
     * @returns nothing
     */
    private restartGame(): void {
        this.generateGame()
        this.updateAlert(this.defaultAlert)
    }

    /**
     * Recursively, swaps empty slot on screen with any surrounding game token,
     * randomly selected, for a certain amount of moves defined by client.
     * 
     * Disables inputs > swaps n times > re-enables inputs
     * @returns nothing
     */
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
}
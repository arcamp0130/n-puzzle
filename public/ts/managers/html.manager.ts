export default class htmlManager {
    private static instance: htmlManager
    private board: HTMLElement
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

    private init() {
        console.log("htmlManager initialized")
        this.board.innerHTML = ""
    }

    public static get Instance(): htmlManager {
        if (!htmlManager.instance) {
            htmlManager.instance = new htmlManager()
        }
        return htmlManager.instance
    }
}
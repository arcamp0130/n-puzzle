import '@sass/styles.scss'
import { htmlManager, gameManager } from './managers/managers.index'

function startPage(): void {
    // Initializing game by force-instatiating all managers
    htmlManager.Instance
    gameManager.Instance
}

startPage()

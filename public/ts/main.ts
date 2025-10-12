import '@sass/styles.scss'
import { HTMLManager, GameManager } from './managers/managers.index'

function startPage(): void {
    // Initializing game by force-instatiating all managers
    HTMLManager.Instance
    GameManager.Instance
}

startPage()

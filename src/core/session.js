import { GameState } from './GameState.js'

export const session = {
  gameState: new GameState(),
}

if (session.gameState.hasSave()) {
  session.gameState.load()
}

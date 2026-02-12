import { computed, reactive } from 'vue'
import type { Game, GameId, GameTypeId, PlayerId } from '../../domain/scorekeeper/scorekeeper'
import {
  addPlayer,
  addRound,
  createGame,
  getScoreTable,
  redo,
  renamePlayer,
  undo,
} from '../../domain/scorekeeper/scorekeeper'
import {
  loadScorekeeperGames,
  saveScorekeeperGames,
} from '../../services/storage/scorekeeper-storage'
import { createScorekeeperCloudSyncClient } from '../../services/sync/scorekeeper-cloud-sync'
import { GAME_TYPES } from './game-types'

interface ScorekeeperState {
  games: Game[]
}

const state = reactive<ScorekeeperState>({
  games: [],
})

let persistTimer: ReturnType<typeof setTimeout> | undefined
const cloudSyncClient = createScorekeeperCloudSyncClient()

const schedulePersist = () => {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    saveScorekeeperGames(state.games)
  }, 150)
}

const replaceGame = (next: Game) => {
  const idx = state.games.findIndex(g => g.id === next.id)
  if (idx >= 0) state.games.splice(idx, 1, next)
  else state.games.unshift(next)
  schedulePersist()
}

export const scorekeeperStore = {
  state,
  gameTypes: GAME_TYPES,
  getGameById: (id: GameId) => computed(() => state.games.find(g => g.id === id)),
  getScoreTable: (game: Game) => computed(() => getScoreTable(game)),
  hydrateFromLocal: () => {
    state.games = loadScorekeeperGames()
  },
  isCloudSyncAvailable: () => cloudSyncClient.isAvailable(),
  pullFromCloud: async () => {
    if (!cloudSyncClient.isAvailable()) return
    const games = await cloudSyncClient.pullGames()
    if (!games) return
    state.games = games
    schedulePersist()
  },
  pushToCloud: async () => {
    if (!cloudSyncClient.isAvailable()) return
    await cloudSyncClient.pushGames(state.games)
  },

  createGame: (typeId: GameTypeId, playerNames: string[]) => {
    const type = GAME_TYPES.find(t => t.id === typeId)
    const game = createGame({
      typeId,
      config: type?.defaultConfig ?? {},
      players: playerNames.map(name => ({ name })),
    })
    replaceGame(game)
    return game
  },

  addPlayer: (gameId: GameId, name: string) => {
    const game = state.games.find(g => g.id === gameId)
    if (!game) throw new Error('对局不存在')
    replaceGame(addPlayer(game, name))
  },

  renamePlayer: (gameId: GameId, playerId: PlayerId, nextName: string) => {
    const game = state.games.find(g => g.id === gameId)
    if (!game) throw new Error('对局不存在')
    replaceGame(renamePlayer(game, playerId, nextName))
  },

  addRound: (gameId: GameId, deltas: Record<PlayerId, number>, note?: string) => {
    const game = state.games.find(g => g.id === gameId)
    if (!game) throw new Error('对局不存在')
    replaceGame(addRound(game, { deltas, note }))
  },

  undo: (gameId: GameId) => {
    const game = state.games.find(g => g.id === gameId)
    if (!game) throw new Error('对局不存在')
    replaceGame(undo(game))
  },

  redo: (gameId: GameId) => {
    const game = state.games.find(g => g.id === gameId)
    if (!game) throw new Error('对局不存在')
    replaceGame(redo(game))
  },
}

export type GameTypeId = 'generic' | 'mahjong' | 'poker'

export type PlayerId = string
export type RoundId = string
export type GameId = string

export interface Player {
  id: PlayerId
  name: string
  createdAt: number
}

export interface RoundEvent {
  id: RoundId
  createdAt: number
  note?: string
  deltas: Record<PlayerId, number>
}

export interface Game {
  id: GameId
  typeId: GameTypeId
  createdAt: number
  config: Record<string, unknown>
  players: Player[]
  rounds: RoundEvent[]
  // cursor 表示已生效的回合数量，用于实现撤销/重做（参见 docs/requirements/scorekeeper.md“分数记录”）
  cursor: number
}

export interface CreateGameInput {
  id?: GameId
  typeId: GameTypeId
  config?: Record<string, unknown>
  players: Array<{ id?: PlayerId; name: string }>
  now?: number
}

export interface AddRoundInput {
  id?: RoundId
  deltas: Record<PlayerId, number>
  note?: string
  now?: number
}

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`

export const createGame = (input: CreateGameInput): Game => {
  const now = input.now ?? Date.now()
  const players: Player[] = input.players.map(p => ({
    id: p.id ?? createId('p'),
    name: p.name.trim(),
    createdAt: now,
  }))

  if (players.length < 2) {
    throw new Error('创建对局至少需要 2 名玩家')
  }
  if (players.some(p => !p.name)) {
    throw new Error('玩家名称不能为空')
  }

  return {
    id: input.id ?? createId('g'),
    typeId: input.typeId,
    createdAt: now,
    config: input.config ?? {},
    players,
    rounds: [],
    cursor: 0,
  }
}

export const addPlayer = (game: Game, name: string, now?: number, id?: PlayerId): Game => {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('玩家名称不能为空')

  const createdAt = now ?? Date.now()
  const nextPlayer: Player = { id: id ?? createId('p'), name: trimmed, createdAt }
  return { ...game, players: [...game.players, nextPlayer] }
}

export const renamePlayer = (game: Game, playerId: PlayerId, nextName: string): Game => {
  const trimmed = nextName.trim()
  if (!trimmed) throw new Error('玩家名称不能为空')

  const found = game.players.some(p => p.id === playerId)
  if (!found) throw new Error('玩家不存在')

  return {
    ...game,
    players: game.players.map(p => (p.id === playerId ? { ...p, name: trimmed } : p)),
  }
}

export const removePlayer = (game: Game, playerId: PlayerId): Game => {
  const usedInAnyRound = game.rounds.some(r => {
    const delta = r.deltas[playerId]
    return typeof delta === 'number' && delta !== 0
  })
  if (usedInAnyRound) {
    throw new Error('该玩家已参与有效计分，禁止删除')
  }
  return { ...game, players: game.players.filter(p => p.id !== playerId) }
}

const validateRound = (game: Game, deltas: Record<PlayerId, number>) => {
  const playerIdSet = new Set(game.players.map(p => p.id))
  for (const [playerId, delta] of Object.entries(deltas)) {
    if (!playerIdSet.has(playerId)) throw new Error('回合包含未知玩家')
    if (!Number.isFinite(delta)) throw new Error('回合分数变更必须为有限数字')
  }
  const hasNonZero = Object.values(deltas).some(v => v !== 0)
  if (!hasNonZero) throw new Error('回合至少需要一项非零分数变更')
}

export const addRound = (game: Game, input: AddRoundInput): Game => {
  validateRound(game, input.deltas)
  const now = input.now ?? Date.now()

  // 在撤销状态下新增回合时，需要丢弃 cursor 之后的“已撤销回合”，保证事件流单向前进
  const appliedRounds = game.rounds.slice(0, game.cursor)
  const nextRound: RoundEvent = {
    id: input.id ?? createId('r'),
    createdAt: now,
    note: input.note?.trim() || undefined,
    deltas: { ...input.deltas },
  }

  const nextRounds = [...appliedRounds, nextRound]
  return { ...game, rounds: nextRounds, cursor: nextRounds.length }
}

export const undo = (game: Game): Game => {
  if (game.cursor <= 0) return game
  return { ...game, cursor: game.cursor - 1 }
}

export const redo = (game: Game): Game => {
  if (game.cursor >= game.rounds.length) return game
  return { ...game, cursor: game.cursor + 1 }
}

export const getAppliedRounds = (game: Game) => game.rounds.slice(0, game.cursor)
export const getUndoneRounds = (game: Game) => game.rounds.slice(game.cursor)

export const getScoreTable = (game: Game): Record<PlayerId, number> => {
  const totals: Record<PlayerId, number> = {}
  for (const p of game.players) totals[p.id] = 0

  for (const round of getAppliedRounds(game)) {
    for (const [playerId, delta] of Object.entries(round.deltas)) {
      totals[playerId] = (totals[playerId] ?? 0) + delta
    }
  }
  return totals
}

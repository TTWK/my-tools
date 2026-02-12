import type { Game } from '../../domain/scorekeeper/scorekeeper'

const STORAGE_KEY = 'tools_platform_scorekeeper_v1'

interface PersistedScorekeeperV1 {
  schemaVersion: 1
  savedAt: number
  games: Game[]
}

const isPersistedV1 = (value: unknown): value is PersistedScorekeeperV1 => {
  const v = value as PersistedScorekeeperV1
  return (
    !!v &&
    typeof v === 'object' &&
    v.schemaVersion === 1 &&
    typeof v.savedAt === 'number' &&
    Array.isArray(v.games)
  )
}

export const loadScorekeeperGames = (): Game[] => {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (typeof raw !== 'string' || !raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!isPersistedV1(parsed)) return []
    return parsed.games
  } catch {
    return []
  }
}

export const saveScorekeeperGames = (games: Game[]) => {
  const payload: PersistedScorekeeperV1 = {
    schemaVersion: 1,
    savedAt: Date.now(),
    games,
  }
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(payload))
}

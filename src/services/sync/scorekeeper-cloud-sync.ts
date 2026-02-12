import type { Game } from '../../domain/scorekeeper/scorekeeper'
import { CLOUD_ENV_ID, ENABLE_CLOUD_SYNC } from '../../config/cloud'

export interface ScorekeeperCloudSyncClient {
  isAvailable: () => boolean
  pullGames: () => Promise<Game[] | null>
  pushGames: (games: Game[]) => Promise<void>
}

export const createNoopScorekeeperCloudSyncClient = (): ScorekeeperCloudSyncClient => ({
  isAvailable: () => false,
  pullGames: async () => null,
  pushGames: async () => {},
})

export const createWeChatCloudScorekeeperSyncClient = (): ScorekeeperCloudSyncClient => ({
  isAvailable: () =>
    !!(ENABLE_CLOUD_SYNC && CLOUD_ENV_ID && typeof wx !== 'undefined' && wx?.cloud?.callFunction),
  pullGames: async () => {
    if (!ENABLE_CLOUD_SYNC || !CLOUD_ENV_ID || !wx?.cloud?.callFunction) return null
    const res = await wx.cloud.callFunction({
      name: 'scorekeeperSync',
      data: { action: 'pull' },
    })
    const result = (res as { result?: unknown } | undefined)?.result
    const games = (result as { games?: unknown } | undefined)?.games
    return Array.isArray(games) ? (games as Game[]) : []
  },
  pushGames: async (games: Game[]) => {
    if (!ENABLE_CLOUD_SYNC || !CLOUD_ENV_ID || !wx?.cloud?.callFunction) return
    await wx.cloud.callFunction({
      name: 'scorekeeperSync',
      data: { action: 'push', games },
    })
  },
})

export const createScorekeeperCloudSyncClient = (): ScorekeeperCloudSyncClient => {
  const client = createWeChatCloudScorekeeperSyncClient()
  if (client.isAvailable()) return client
  return createNoopScorekeeperCloudSyncClient()
}

import { describe, expect, it } from 'vitest'
import { createGame } from '../../domain/scorekeeper/scorekeeper'
import { loadScorekeeperGames, saveScorekeeperGames } from './scorekeeper-storage'

describe('scorekeeper storage', () => {
  it('空存储时返回空数组', () => {
    const map = new Map<string, unknown>()
    ;(globalThis as unknown as { uni: unknown }).uni = {
      getStorageSync: (key: string) => map.get(key),
      setStorageSync: (key: string, value: unknown) => map.set(key, value),
    }

    expect(loadScorekeeperGames()).toEqual([])
  })

  it('保存后可正常读取', () => {
    const map = new Map<string, unknown>()
    ;(globalThis as unknown as { uni: unknown }).uni = {
      getStorageSync: (key: string) => map.get(key),
      setStorageSync: (key: string, value: unknown) => map.set(key, value),
    }

    const game = createGame({
      id: 'g1',
      typeId: 'generic',
      now: 1,
      players: [
        { id: 'p1', name: 'A' },
        { id: 'p2', name: 'B' },
      ],
    })

    saveScorekeeperGames([game])
    const loaded = loadScorekeeperGames()
    expect(loaded).toHaveLength(1)
    expect(loaded[0].id).toBe('g1')
    expect(loaded[0].players.map(p => p.name)).toEqual(['A', 'B'])
  })
})

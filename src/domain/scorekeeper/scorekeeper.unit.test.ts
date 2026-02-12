import { describe, expect, it } from 'vitest'
import { addRound, createGame, getScoreTable, redo, renamePlayer, undo } from './scorekeeper'

describe('scorekeeper domain', () => {
  it('创建对局后，初始总分均为 0', () => {
    const game = createGame({
      id: 'g1',
      typeId: 'generic',
      now: 1,
      players: [
        { id: 'p1', name: 'A' },
        { id: 'p2', name: 'B' },
      ],
    })

    expect(getScoreTable(game)).toEqual({ p1: 0, p2: 0 })
  })

  it('新增回合后，总分随之正确变化', () => {
    const game0 = createGame({
      id: 'g1',
      typeId: 'generic',
      now: 1,
      players: [
        { id: 'p1', name: 'A' },
        { id: 'p2', name: 'B' },
      ],
    })

    const game1 = addRound(game0, {
      id: 'r1',
      now: 2,
      deltas: { p1: 10, p2: -10 },
      note: '第 1 局',
    })

    expect(getScoreTable(game1)).toEqual({ p1: 10, p2: -10 })
  })

  it('撤销与重做会正确回放分数变更', () => {
    const game0 = createGame({
      id: 'g1',
      typeId: 'generic',
      now: 1,
      players: [
        { id: 'p1', name: 'A' },
        { id: 'p2', name: 'B' },
      ],
    })

    const game1 = addRound(game0, {
      id: 'r1',
      now: 2,
      deltas: { p1: 10, p2: -10 },
    })
    const game2 = addRound(game1, {
      id: 'r2',
      now: 3,
      deltas: { p1: -5, p2: 5 },
    })

    expect(getScoreTable(game2)).toEqual({ p1: 5, p2: -5 })

    const gameUndo = undo(game2)
    expect(getScoreTable(gameUndo)).toEqual({ p1: 10, p2: -10 })

    const gameRedo = redo(gameUndo)
    expect(getScoreTable(gameRedo)).toEqual({ p1: 5, p2: -5 })
  })

  it('修改玩家名称不影响历史回合关联', () => {
    const game0 = createGame({
      id: 'g1',
      typeId: 'generic',
      now: 1,
      players: [
        { id: 'p1', name: 'A' },
        { id: 'p2', name: 'B' },
      ],
    })

    const game1 = renamePlayer(game0, 'p1', 'A*')
    const game2 = addRound(game1, {
      id: 'r1',
      now: 2,
      deltas: { p1: 3, p2: -3 },
    })

    expect(game2.players.find(p => p.id === 'p1')?.name).toBe('A*')
    expect(getScoreTable(game2)).toEqual({ p1: 3, p2: -3 })
  })
})

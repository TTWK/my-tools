import type { GameTypeId } from '../../domain/scorekeeper/scorekeeper'

export interface GameTypeDefinition {
  id: GameTypeId
  name: string
  description: string
  defaultConfig: Record<string, unknown>
}

export const GAME_TYPES: GameTypeDefinition[] = [
  {
    id: 'generic',
    name: '通用加减分',
    description: '适用于大多数桌游的通用记分方式',
    defaultConfig: {},
  },
  {
    id: 'mahjong',
    name: '麻将（模板）',
    description: '先以通用加减分落地，后续扩展番/台等规则',
    defaultConfig: {},
  },
  {
    id: 'poker',
    name: '扑克（模板）',
    description: '先以通用加减分落地，后续扩展局/轮/底分等规则',
    defaultConfig: {},
  },
]

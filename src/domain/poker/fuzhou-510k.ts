/**
 * 福州510K计分逻辑
 *
 * 福州510K（五十K）是福州地区流行的扑克游戏：
 * - 4人，2v2组队对抗
 * - 5、10、K为分牌（5分、10分、10分）
 * - 抢分制，先抢到100分的一方获胜
 * - 特殊牌型：正510K、副510K、炸弹等
 * - 亮主确定花色主牌
 */

// ==================== 类型定义 ====================

/** 花色类型 */
export type Suit = 'spades' | 'hearts' | 'clubs' | 'diamonds' | 'no-trump'

/** 花色名称 */
export const SUIT_NAMES: Record<Suit, string> = {
  spades: '黑桃',
  hearts: '红桃',
  clubs: '梅花',
  diamonds: '方块',
  'no-trump': '无主',
}

/** 花色符号 */
export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  clubs: '♣',
  diamonds: '♦',
  'no-trump': '×',
}

/** 亮主信息 */
export interface BidInfo {
  bidderId: string // 亮主玩家
  suit: Suit // 主牌花色
  level: number // 当前级别
  isRebid: boolean // 是否反主
  rebidInfo?: {
    rebidderId: string
    cardCount: number // 反主级牌数量
  }
}

/** 分牌统计 */
export interface PointCardStats {
  fives: number // 5的数量
  tens: number // 10的数量
  kings: number // K的数量
  totalPoints: number // 总得分
}

/** 510K类型 */
export type FiveTenKType = 'positive' | 'mixed'

/** 510K记录 */
export interface FiveTenKRecord {
  type: FiveTenKType
  playerId: string
  suit: Suit // 如果是正510K，记录花色
  cards: string[] // 具体牌面
  multiplier: number
}

/** 炸弹类型 */
export interface BombRecord {
  playerId: string
  rank: string // 牌点数（A, K, Q, J, 10...）
  count: number // 张数（3-8张）
  isRocket: boolean // 是否是王炸
  multiplier: number
}

/** 特殊牌型记录 */
export interface SpecialPlayRecord {
  type: 'fiveTenK' | 'bomb'
  data: FiveTenKRecord | BombRecord
}

/** 轮次记录 */
export interface TrickRecord {
  trickNumber: number
  leaderId: string // 首家
  winnerId: string // 赢家
  pointCards: string[] // 该轮分牌
  hasFiveTenK: boolean // 是否有510K
  hasBomb: boolean // 是否有炸弹
}

/** 福州510K配置 */
export interface Fuzhou510KConfig {
  // 基础设置
  targetScore: number // 目标分数（默认100）
  baseScore: number // 基础分

  // 特殊牌型倍数
  positive510KMultiplier: number // 正510K倍数
  mixed510KMultiplier: number // 副510K倍数
  bomb3Multiplier: number // 3张炸弹
  bomb4Multiplier: number // 4张炸弹
  bomb5Multiplier: number // 5张炸弹
  bomb6Multiplier: number // 6张炸弹

  // 升级规则
  upgradeRules: {
    smallWin: number // 小胜升级数
    mediumWin: number // 中胜升级数
    bigWin: number // 大胜升级数
    thresholds: {
      small: number // 小胜分差阈值
      medium: number // 中胜分差阈值
    }
  }
}

/** 单局结果 */
export interface Fuzhou510KRoundResult {
  roundNumber: number

  // 亮主信息
  bidInfo: BidInfo

  // 各方收集的分牌
  pointCards: Record<string, PointCardStats>

  // 特殊牌型记录
  specialPlays: SpecialPlayRecord[]

  // 轮次记录
  trickRecords: TrickRecord[]

  // 最终结果
  winnerTeam: 'teamA' | 'teamB' // 哪一队获胜
  finalScore: number // 最终分数差
  upgradeLevels: number // 升级级数

  // 各玩家分数变化
  playerResults: Record<string, number>

  note?: string
}

// ==================== 默认配置 ====================

export const DEFAULT_FUZHOU_510K_CONFIG: Fuzhou510KConfig = {
  targetScore: 100,
  baseScore: 1,

  // 特殊牌型倍数
  positive510KMultiplier: 5,
  mixed510KMultiplier: 3,
  bomb3Multiplier: 2,
  bomb4Multiplier: 4,
  bomb5Multiplier: 5,
  bomb6Multiplier: 6,

  // 升级规则
  upgradeRules: {
    smallWin: 1,
    mediumWin: 2,
    bigWin: 3,
    thresholds: {
      small: 40,
      medium: 80,
    },
  },
}

// ==================== 核心计算函数 ====================

/**
 * 计算分牌得分
 * @param stats 分牌统计
 * @returns 总得分
 */
export function calculatePointCardScore(stats: PointCardStats): number {
  return stats.totalPoints
}

/**
 * 计算510K倍数
 * @param type 510K类型
 * @param config 配置
 * @returns 倍数
 */
export function calculateFiveTenKMultiplier(
  type: FiveTenKType,
  config: Fuzhou510KConfig = DEFAULT_FUZHOU_510K_CONFIG
): number {
  return type === 'positive'
    ? config.positive510KMultiplier
    : config.mixed510KMultiplier
}

/**
 * 计算炸弹倍数
 * @param count 炸弹张数
 * @param config 配置
 * @returns 倍数
 */
export function calculateBombMultiplier(
  count: number,
  config: Fuzhou510KConfig = DEFAULT_FUZHOU_510K_CONFIG
): number {
  switch (count) {
    case 3:
      return config.bomb3Multiplier
    case 4:
      return config.bomb4Multiplier
    case 5:
      return config.bomb5Multiplier
    case 6:
      return config.bomb6Multiplier
    default:
      return Math.pow(2, count - 2) // 更多张数按指数增长
  }
}

/**
 * 计算升级级数
 * @param scoreDiff 分数差
 * @param config 配置
 * @returns 升级级数
 */
export function calculateUpgradeLevels(
  scoreDiff: number,
  config: Fuzhou510KConfig = DEFAULT_FUZHOU_510K_CONFIG
): number {
  const { thresholds, smallWin, mediumWin, bigWin } = config.upgradeRules

  if (scoreDiff < thresholds.small) {
    return smallWin
  } else if (scoreDiff < thresholds.medium) {
    return mediumWin
  } else {
    return bigWin
  }
}

/**
 * 计算单局结果
 * @param params 计算参数
 * @param config 配置
 * @returns 单局结果
 */
export function calculateRoundResult(
  params: {
    roundNumber: number
    bidInfo: BidInfo
    pointCards: Record<string, PointCardStats>
    specialPlays: SpecialPlayRecord[]
    trickRecords: TrickRecord[]
    teamAIds: string[]
    teamBIds: string[]
    note?: string
  },
  config: Fuzhou510KConfig = DEFAULT_FUZHOU_510K_CONFIG
): Fuzhou510KRoundResult {
  // 计算各方总分
  const teamAScore = params.teamAIds.reduce(
    (sum, id) => sum + (params.pointCards[id]?.totalPoints || 0),
    0
  )
  const teamBScore = params.teamBIds.reduce(
    (sum, id) => sum + (params.pointCards[id]?.totalPoints || 0),
    0
  )

  // 计算特殊牌型额外得分
  let teamAExtraScore = 0
  let teamBExtraScore = 0

  for (const play of params.specialPlays) {
    if (play.type === 'fiveTenK') {
      const fiveTenK = play.data as FiveTenKRecord
      const multiplier = calculateFiveTenKMultiplier(fiveTenK.type, config)
      const extraScore = config.baseScore * multiplier

      if (params.teamAIds.includes(fiveTenK.playerId)) {
        teamAExtraScore += extraScore
      } else {
        teamBExtraScore += extraScore
      }
    } else if (play.type === 'bomb') {
      const bomb = play.data as BombRecord
      const multiplier = calculateBombMultiplier(bomb.count, config)
      const extraScore = config.baseScore * multiplier

      if (params.teamAIds.includes(bomb.playerId)) {
        teamAExtraScore += extraScore
      } else {
        teamBExtraScore += extraScore
      }
    }
  }

  // 最终得分
  const teamAFinalScore = teamAScore + teamAExtraScore
  const teamBFinalScore = teamBScore + teamBExtraScore

  // 判定胜负
  const teamAWon = teamAFinalScore >= config.targetScore || teamAFinalScore > teamBFinalScore
  const winnerTeam: 'teamA' | 'teamB' = teamAWon ? 'teamA' : 'teamB'

  // 计算分数差
  const scoreDiff = Math.abs(teamAFinalScore - teamBFinalScore)

  // 计算升级级数
  const upgradeLevels = calculateUpgradeLevels(scoreDiff, config)

  // 计算各玩家分数变化
  const playerResults: Record<string, number> = {}
  const scoreChange = config.baseScore * upgradeLevels

  for (const id of params.teamAIds) {
    playerResults[id] = teamAWon ? scoreChange : -scoreChange
  }
  for (const id of params.teamBIds) {
    playerResults[id] = teamAWon ? -scoreChange : scoreChange
  }

  return {
    roundNumber: params.roundNumber,
    bidInfo: params.bidInfo,
    pointCards: params.pointCards,
    specialPlays: params.specialPlays,
    trickRecords: params.trickRecords,
    winnerTeam,
    finalScore: scoreDiff,
    upgradeLevels,
    playerResults,
    note: params.note,
  }
}

// ==================== 工具函数 ====================

/**
 * 获取花色显示名称
 * @param suit 花色
 * @returns 显示名称
 */
export function getSuitDisplayName(suit: Suit): string {
  return SUIT_NAMES[suit] || suit
}

/**
 * 获取花色符号
 * @param suit 花色
 * @returns 符号
 */
export function getSuitSymbol(suit: Suit): string {
  return SUIT_SYMBOLS[suit] || ''
}

/**
 * 格式化分牌统计
 * @param stats 分牌统计
 * @returns 格式化字符串
 */
export function formatPointCardStats(stats: PointCardStats): string {
  return `${stats.fives}个5, ${stats.tens}个10, ${stats.kings}个K, 共${stats.totalPoints}分`
}

/**
 * 创建空分牌统计
 * @returns 空统计
 */
export function createEmptyPointCardStats(): PointCardStats {
  return {
    fives: 0,
    tens: 0,
    kings: 0,
    totalPoints: 0,
  }
}

/**
 * 添加分牌到统计
 * @param stats 统计
 * @param card 分牌（'5', '10', 'K'）
 */
export function addPointCard(stats: PointCardStats, card: string): void {
  switch (card) {
    case '5':
      stats.fives++
      stats.totalPoints += 5
      break
    case '10':
      stats.tens++
      stats.totalPoints += 10
      break
    case 'K':
    case 'k':
      stats.kings++
      stats.totalPoints += 10
      break
  }
}

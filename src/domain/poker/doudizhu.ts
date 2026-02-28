/**
 * 斗地主计分逻辑
 *
 * 支持经典三人斗地主规则：
 * - 叫分/抢地主确定角色
 * - 炸弹、火箭翻倍
 * - 春天、反春天翻倍
 * - 倍数封顶
 */

// ==================== 类型定义 ====================

/** 角色类型 */
export type RoleType = 'landlord' | 'farmer'

/** 叫分模式 */
export type BidMode = 'call' | 'grab'

/** 叫分记录 */
export interface BidRecord {
  playerId: string
  score: number // 叫分（0-3，0表示不叫）
  isGrab: boolean // 是否抢地主
  timestamp: number
}

/** 倍数明细 */
export interface MultiplierDetail {
  type: MultiplierType
  name: string
  value: number // 倍数
  count?: number // 数量（如炸弹数量）
}

/** 倍数类型 */
export type MultiplierType =
  | 'bid' // 叫分
  | 'grab' // 抢地主
  | 'bomb' // 炸弹
  | 'rocket' // 火箭（王炸）
  | 'spring' // 春天
  | 'antiSpring' // 反春天

/** 斗地主配置 */
export interface DoudizhuConfig {
  // 基础设置
  baseScore: number // 基础分
  maxMultiplier: number // 倍数封顶

  // 叫分模式
  mode: BidMode

  // 倍数规则
  bombMultiplier: number // 每个炸弹倍数
  rocketMultiplier: number // 火箭倍数
  springMultiplier: number // 春天倍数
  antiSpringMultiplier: number // 反春天倍数

  // 特殊规则
  enableSpring: boolean // 启用春天
  enableAntiSpring: boolean // 启用反春天
}

/** 单局结果 */
export interface DoudizhuRoundResult {
  roundNumber: number

  // 角色
  landlordId: string
  farmerIds: string[]

  // 叫分过程
  bids: BidRecord[]
  bidScore: number // 最终基础分（最高叫分）

  // 倍数明细
  multiplierDetails: MultiplierDetail[]
  totalMultiplier: number

  // 特殊标记
  bombCount: number
  hasRocket: boolean
  isSpring: boolean
  isAntiSpring: boolean

  // 结果
  landlordWon: boolean
  playerResults: Record<string, number> // 各玩家分数变化

  note?: string
}

// ==================== 默认配置 ====================

export const DEFAULT_DOUDIZHU_CONFIG: DoudizhuConfig = {
  baseScore: 1,
  maxMultiplier: 64,
  mode: 'call',
  bombMultiplier: 2,
  rocketMultiplier: 4,
  springMultiplier: 2,
  antiSpringMultiplier: 2,
  enableSpring: true,
  enableAntiSpring: true,
}

// ==================== 核心计算函数 ====================

/**
 * 计算倍数明细
 * @param params 计算参数
 * @param config 配置
 * @returns 倍数明细和总倍数
 */
export function calculateMultiplier(
  params: {
    bidScore: number // 叫分
    grabCount: number // 抢地主次数
    bombCount: number // 炸弹数量
    hasRocket: boolean // 是否有火箭
    isSpring: boolean // 是否春天
    isAntiSpring: boolean // 是否反春天
  },
  config: DoudizhuConfig = DEFAULT_DOUDIZHU_CONFIG
): { details: MultiplierDetail[]; totalMultiplier: number } {
  const details: MultiplierDetail[] = []

  // 1. 叫分倍数
  if (config.mode === 'call') {
    details.push({
      type: 'bid',
      name: '叫分',
      value: params.bidScore,
    })
  }

  // 2. 抢地主倍数
  if (params.grabCount > 0) {
    const grabMultiplier = Math.pow(2, params.grabCount)
    details.push({
      type: 'grab',
      name: '抢地主',
      value: grabMultiplier,
      count: params.grabCount,
    })
  }

  // 3. 炸弹倍数
  if (params.bombCount > 0) {
    const bombMultiplier = Math.pow(config.bombMultiplier, params.bombCount)
    details.push({
      type: 'bomb',
      name: '炸弹',
      value: bombMultiplier,
      count: params.bombCount,
    })
  }

  // 4. 火箭倍数
  if (params.hasRocket) {
    details.push({
      type: 'rocket',
      name: '火箭',
      value: config.rocketMultiplier,
    })
  }

  // 5. 春天倍数
  if (params.isSpring && config.enableSpring) {
    details.push({
      type: 'spring',
      name: '春天',
      value: config.springMultiplier,
    })
  }

  // 6. 反春天倍数
  if (params.isAntiSpring && config.enableAntiSpring) {
    details.push({
      type: 'antiSpring',
      name: '反春天',
      value: config.antiSpringMultiplier,
    })
  }

  // 计算总倍数
  let totalMultiplier = 1
  for (const detail of details) {
    totalMultiplier *= detail.value
  }

  // 应用封顶
  totalMultiplier = Math.min(totalMultiplier, config.maxMultiplier)

  return {
    details,
    totalMultiplier,
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
    landlordId: string
    farmerIds: string[]
    bids: BidRecord[]
    baseScore: number
    bombCount: number
    hasRocket: boolean
    isSpring: boolean
    isAntiSpring: boolean
    landlordWon: boolean
    note?: string
  },
  config: DoudizhuConfig = DEFAULT_DOUDIZHU_CONFIG
): DoudizhuRoundResult {
  // 计算叫分
  const bidScore = Math.max(...params.bids.map((b) => b.score), 1)

  // 计算抢地主次数
  const grabCount = params.bids.filter((b) => b.isGrab).length

  // 计算倍数
  const { details, totalMultiplier } = calculateMultiplier(
    {
      bidScore,
      grabCount,
      bombCount: params.bombCount,
      hasRocket: params.hasRocket,
      isSpring: params.isSpring,
      isAntiSpring: params.isAntiSpring,
    },
    config
  )

  // 计算分数变化
  const scoreChange = params.baseScore * totalMultiplier
  const playerResults: Record<string, number> = {}

  if (params.landlordWon) {
    // 地主获胜，农民各输
    for (const farmerId of params.farmerIds) {
      playerResults[farmerId] = -scoreChange
    }
    playerResults[params.landlordId] = scoreChange * params.farmerIds.length
  } else {
    // 农民获胜，地主输
    for (const farmerId of params.farmerIds) {
      playerResults[farmerId] = scoreChange
    }
    playerResults[params.landlordId] = -scoreChange * params.farmerIds.length
  }

  return {
    roundNumber: params.roundNumber,
    landlordId: params.landlordId,
    farmerIds: params.farmerIds,
    bids: params.bids,
    bidScore,
    multiplierDetails: details,
    totalMultiplier,
    bombCount: params.bombCount,
    hasRocket: params.hasRocket,
    isSpring: params.isSpring,
    isAntiSpring: params.isAntiSpring,
    landlordWon: params.landlordWon,
    playerResults,
    note: params.note,
  }
}

// ==================== 工具函数 ====================

/**
 * 格式化倍数
 * @param multiplier 倍数
 * @returns 格式化字符串
 */
export function formatMultiplier(multiplier: number): string {
  if (multiplier <= 1) return '1倍'
  return `${multiplier}倍`
}

/**
 * 获取角色名称
 * @param role 角色
 * @returns 名称
 */
export function getRoleName(role: RoleType): string {
  return role === 'landlord' ? '地主' : '农民'
}

/**
 * 验证叫分是否合法
 * @param bids 叫分记录
 * @returns 是否合法
 */
export function validateBids(bids: BidRecord[]): boolean {
  if (bids.length === 0) return false

  // 检查是否有玩家叫3分（封顶）
  const hasMaxBid = bids.some((b) => b.score === 3)
  if (hasMaxBid) {
    // 如果有叫3分的，必须是最后一个叫分的
    const maxBidIndex = bids.findIndex((b) => b.score === 3)
    return maxBidIndex === bids.length - 1
  }

  // 如果没有叫3分的，检查叫分是否递增
  let maxBid = 0
  for (const bid of bids) {
    if (bid.score <= maxBid && bid.score > 0) {
      return false
    }
    if (bid.score > maxBid) {
      maxBid = bid.score
    }
  }

  return true
}

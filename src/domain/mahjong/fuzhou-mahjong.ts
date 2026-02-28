/**
 * 福州麻将计分逻辑
 *
 * 福州麻将核心规则:
 * 1. 有花牌（春夏秋冬梅兰竹菊），每朵0.5番
 * 2. 有金牌（万能牌），金牌胡加1番
 * 3. 番数制：半番、一番、两番、三番等
 * 4. 连庄：每连庄加半番
 * 5. 封顶：通常8番封顶
 */

// ==================== 类型定义 ====================

/** 番数类型 */
export interface FanDetail {
  type: FanType;
  name: string;
  value: number; // 番数
  count?: number; // 数量（如杠牌数量、花牌数量）
}

/** 番数类型枚举 */
export type FanType =
  // 基础番数
  | 'pinghu' // 平胡
  | 'flower' // 花牌
  | 'goldCard' // 金牌
  | 'selfDraw' // 自摸
  | 'kongDraw' // 杠上开花
  | 'robKong' // 抢杠胡
  | 'seaBottom' // 海底捞月
  | 'miracle' // 妙手回春
  // 杠牌番数
  | 'exposedKong' // 明杠
  | 'concealedKong' // 暗杠
  | 'addedKong' // 加杠
  // 特殊牌型番数
  | 'allSimples' // 断幺九
  | 'mixedSuit' // 混一色
  | 'pureSuit' // 清一色
  | 'allPongs' // 碰碰胡
  | 'sevenPairs' // 七对子
  | 'thirteenOrphans' // 十三幺
  | 'allTerminals' // 全求人
  // 庄家番数
  | 'dealer' // 庄家基础
  | 'dealerStreak' // 连庄

/** 福州麻将配置 */
export interface FuzhouMahjongConfig {
  // 基础设置
  baseScore: number; // 底分（一番对应的分数）
  maxCap: number; // 最高封顶番数
  maxDealerStreak: number; // 最高连庄次数

  // 花牌设置
  flowerBonus: number; // 每朵花的番数
  maxFlowerBonus: number; // 花牌最高加成

  // 金牌设置
  goldCardBonus: number; // 金牌番数

  // 杠牌设置
  exposedKongBonus: number; // 明杠番数
  concealedKongBonus: number; // 暗杠番数
  addedKongBonus: number; // 加杠番数

  // 自摸加成
  selfDrawBonus: number; // 自摸番数
  kongDrawBonus: number; // 杠上开花番数
  robKongBonus: number; // 抢杠胡番数
  seaBottomBonus: number; // 海底捞月番数
  miracleBonus: number; // 妙手回春番数

  // 特殊牌型番数
  allSimplesBonus: number; // 断幺九
  mixedSuitBonus: number; // 混一色
  pureSuitBonus: number; // 清一色
  allPongsBonus: number; // 碰碰胡
  sevenPairsBonus: number; // 七对子
  thirteenOrphansBonus: number; // 十三幺
  allTerminalsBonus: number; // 全求人

  // 庄家设置
  dealerBonus: number; // 庄家基础加成
  dealerStreakBonus: number; // 每连庄加成
}

/** 番数计算输入 */
export interface FanCalculationInput {
  // 基础信息
  isSelfDraw: boolean; // 是否自摸
  isDealer: boolean; // 是否庄家
  dealerStreak: number; // 连庄次数

  // 花牌
  flowerCount: number; // 花牌数量

  // 金牌
  hasGoldCard: boolean; // 是否金牌胡

  // 杠牌
  exposedKongCount: number; // 明杠数量
  concealedKongCount: number; // 暗杠数量
  addedKongCount: number; // 加杠数量

  // 特殊胡牌方式
  isKongDraw: boolean; // 是否杠上开花
  isRobKong: boolean; // 是否抢杠胡
  isSeaBottom: boolean; // 是否海底捞月
  isMiracle: boolean; // 是否妙手回春

  // 牌型（可多选）
  handTypes: HandType[];
}

/** 牌型类型 */
export type HandType =
  | 'pinghu' // 平胡
  | 'allSimples' // 断幺九
  | 'mixedSuit' // 混一色
  | 'pureSuit' // 清一色
  | 'allPongs' // 碰碰胡
  | 'sevenPairs' // 七对子
  | 'thirteenOrphans' // 十三幺
  | 'allTerminals' // 全求人

// ==================== 默认配置 ====================

export const DEFAULT_FUZHOU_MAHJONG_CONFIG: FuzhouMahjongConfig = {
  // 基础设置
  baseScore: 1,
  maxCap: 8,
  maxDealerStreak: 4,

  // 花牌设置
  flowerBonus: 0.5,
  maxFlowerBonus: 4,

  // 金牌设置
  goldCardBonus: 1,

  // 杠牌设置
  exposedKongBonus: 1,
  concealedKongBonus: 2,
  addedKongBonus: 1,

  // 自摸加成
  selfDrawBonus: 1,
  kongDrawBonus: 2,
  robKongBonus: 1,
  seaBottomBonus: 1,
  miracleBonus: 1,

  // 特殊牌型番数
  allSimplesBonus: 1,
  mixedSuitBonus: 2,
  pureSuitBonus: 4,
  allPongsBonus: 2,
  sevenPairsBonus: 2,
  thirteenOrphansBonus: 8,
  allTerminalsBonus: 2,

  // 庄家设置
  dealerBonus: 0.5,
  dealerStreakBonus: 0.5,
}

// ==================== 番数计算函数 ====================

/**
 * 计算番数
 * @param input 番数计算输入
 * @param config 福州麻将配置
 * @returns 番数明细和总番数
 */
export function calculateFan(
  input: FanCalculationInput,
  config: FuzhouMahjongConfig = DEFAULT_FUZHOU_MAHJONG_CONFIG
): { details: FanDetail[]; totalFan: number; actualFan: number } {
  const details: FanDetail[] = []

  // 1. 基础番数 - 平胡
  details.push({
    type: 'pinghu',
    name: '平胡',
    value: 1,
  })

  // 2. 花牌番数
  if (input.flowerCount > 0) {
    const flowerFan = Math.min(
      input.flowerCount * config.flowerBonus,
      config.maxFlowerBonus
    )
    details.push({
      type: 'flower',
      name: '花牌',
      value: flowerFan,
      count: input.flowerCount,
    })
  }

  // 3. 金牌番数
  if (input.hasGoldCard) {
    details.push({
      type: 'goldCard',
      name: '金牌胡',
      value: config.goldCardBonus,
    })
  }

  // 4. 杠牌番数
  if (input.exposedKongCount > 0) {
    details.push({
      type: 'exposedKong',
      name: '明杠',
      value: input.exposedKongCount * config.exposedKongBonus,
      count: input.exposedKongCount,
    })
  }

  if (input.concealedKongCount > 0) {
    details.push({
      type: 'concealedKong',
      name: '暗杠',
      value: input.concealedKongCount * config.concealedKongBonus,
      count: input.concealedKongCount,
    })
  }

  if (input.addedKongCount > 0) {
    details.push({
      type: 'addedKong',
      name: '加杠',
      value: input.addedKongCount * config.addedKongBonus,
      count: input.addedKongCount,
    })
  }

  // 5. 自摸/特殊胡牌方式番数
  if (input.isSelfDraw) {
    details.push({
      type: 'selfDraw',
      name: '自摸',
      value: config.selfDrawBonus,
    })
  }

  if (input.isKongDraw) {
    details.push({
      type: 'kongDraw',
      name: '杠上开花',
      value: config.kongDrawBonus,
    })
  }

  if (input.isRobKong) {
    details.push({
      type: 'robKong',
      name: '抢杠胡',
      value: config.robKongBonus,
    })
  }

  if (input.isSeaBottom) {
    details.push({
      type: 'seaBottom',
      name: '海底捞月',
      value: config.seaBottomBonus,
    })
  }

  if (input.isMiracle) {
    details.push({
      type: 'miracle',
      name: '妙手回春',
      value: config.miracleBonus,
    })
  }

  // 6. 牌型番数
  for (const handType of input.handTypes) {
    switch (handType) {
      case 'allSimples':
        details.push({
          type: 'allSimples',
          name: '断幺九',
          value: config.allSimplesBonus,
        })
        break
      case 'mixedSuit':
        details.push({
          type: 'mixedSuit',
          name: '混一色',
          value: config.mixedSuitBonus,
        })
        break
      case 'pureSuit':
        details.push({
          type: 'pureSuit',
          name: '清一色',
          value: config.pureSuitBonus,
        })
        break
      case 'allPongs':
        details.push({
          type: 'allPongs',
          name: '碰碰胡',
          value: config.allPongsBonus,
        })
        break
      case 'sevenPairs':
        details.push({
          type: 'sevenPairs',
          name: '七对子',
          value: config.sevenPairsBonus,
        })
        break
      case 'thirteenOrphans':
        details.push({
          type: 'thirteenOrphans',
          name: '十三幺',
          value: config.thirteenOrphansBonus,
        })
        break
      case 'allTerminals':
        details.push({
          type: 'allTerminals',
          name: '全求人',
          value: config.allTerminalsBonus,
        })
        break
    }
  }

  // 7. 庄家番数
  if (input.isDealer) {
    details.push({
      type: 'dealer',
      name: '庄家',
      value: config.dealerBonus,
    })

    // 连庄番数
    if (input.dealerStreak > 0) {
      const streakFan = Math.min(
        input.dealerStreak * config.dealerStreakBonus,
        config.maxDealerStreak * config.dealerStreakBonus
      )
      if (streakFan > 0) {
        details.push({
          type: 'dealerStreak',
          name: '连庄',
          value: streakFan,
          count: input.dealerStreak,
        })
      }
    }
  }

  // 计算总番数
  const totalFan = details.reduce((sum, detail) => sum + detail.value, 0)

  // 应用封顶
  const actualFan = Math.min(totalFan, config.maxCap)

  return {
    details,
    totalFan,
    actualFan,
  }
}

/**
 * 计算胡牌得分
 * @param fanDetails 番数明细
 * @param config 配置
 * @returns 得分
 */
export function calculateScore(
  fanDetails: FanDetail[],
  config: FuzhouMahjongConfig = DEFAULT_FUZHOU_MAHJONG_CONFIG
): number {
  const totalFan = fanDetails.reduce((sum, detail) => sum + detail.value, 0)
  const actualFan = Math.min(totalFan, config.maxCap)
  return actualFan * config.baseScore
}

/**
 * 获取番数类型名称
 * @param type 番数类型
 * @returns 名称
 */
export function getFanTypeName(type: FanType): string {
  const nameMap: Record<FanType, string> = {
    pinghu: '平胡',
    flower: '花牌',
    goldCard: '金牌胡',
    selfDraw: '自摸',
    kongDraw: '杠上开花',
    robKong: '抢杠胡',
    seaBottom: '海底捞月',
    miracle: '妙手回春',
    exposedKong: '明杠',
    concealedKong: '暗杠',
    addedKong: '加杠',
    allSimples: '断幺九',
    mixedSuit: '混一色',
    pureSuit: '清一色',
    allPongs: '碰碰胡',
    sevenPairs: '七对子',
    thirteenOrphans: '十三幺',
    allTerminals: '全求人',
    dealer: '庄家',
    dealerStreak: '连庄',
  }
  return nameMap[type] || type
}

// ==================== 工具函数 ====================

/**
 * 检查番数是否达到封顶
 * @param fanDetails 番数明细
 * @param maxCap 封顶番数
 * @returns 是否封顶
 */
export function isCapped(fanDetails: FanDetail[], maxCap: number): boolean {
  const totalFan = fanDetails.reduce((sum, detail) => sum + detail.value, 0)
  return totalFan >= maxCap
}

/**
 * 格式化番数显示
 * @param fan 番数
 * @returns 格式化字符串
 */
export function formatFan(fan: number): string {
  if (fan === 0) return '0番'
  if (fan === 0.5) return '半番'
  if (fan === 1) return '1番'
  if (fan === Math.floor(fan)) return `${fan}番`
  return `${fan}番`
}

/**
 * 计算庄家加成后的分数
 * @param baseScore 基础分数
 * @param dealerStreak 连庄次数
 * @param config 配置
 * @returns 加成后的分数
 */
export function calculateDealerBonus(
  baseScore: number,
  dealerStreak: number,
  config: FuzhouMahjongConfig
): number {
  const dealerBonus = config.dealerBonus
  const streakBonus = Math.min(
    dealerStreak * config.dealerStreakBonus,
    config.maxDealerStreak * config.dealerStreakBonus
  )
  return baseScore * (1 + dealerBonus + streakBonus)
}

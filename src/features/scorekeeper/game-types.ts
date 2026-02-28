import type { GameTypeId } from '../../domain/scorekeeper/scorekeeper'

export interface GameTypeDefinition {
  id: GameTypeId
  name: string
  description: string
  defaultPlayers?: number
  defaultConfig: Record<string, unknown>
  // 计分相关配置
  scoring?: {
    baseScore: number // 底分
    minScore: number // 最低结算分
    scoreUnit: number // 计分单位
  }
  // 游戏特定规则
  rules?: Record<string, unknown>
}

// ==================== 通用计分 ====================
export const GENERIC_CONFIG = {
  id: 'generic' as const,
  name: '通用加减分',
  description: '适用于大多数桌游的通用记分方式',
  defaultPlayers: 4,
  defaultConfig: {},
}

// ==================== 福州麻将 ====================
// 福州麻将特点：
// - 有花牌（春、夏、秋、冬、梅、兰、竹、菊）
// - 有金牌（万能牌）
// - 可吃、碰、杠
// - 胡牌需有花牌或杠牌
// - 计番制：半番、一番、两番、三番等

export const FUZHOU_MAHJONG_CONFIG = {
  id: 'fuzhou_mahjong' as const,
  name: '福州麻将',
  description: '福州本地麻将规则，支持花牌、金牌、番数计算',
  defaultPlayers: 4,
  defaultConfig: {
    // 基础设置
    baseScore: 1, // 底分（一番对应的基础分数）
    maxPlayers: 4, // 最大玩家数
    // 花牌设置
    flowerBonus: 0.5, // 每朵花加的半番数
    maxFlowerBonus: 4, // 花牌最多加几番
    // 金牌设置
    goldCardBonus: 1, // 金牌代替的番数
    // 杠牌设置
    exposedKongBonus: 1, // 明杠加的番数
    concealedKongBonus: 2, // 暗杠加的番数
    // 胡牌类型
    selfDrawBonus: 1, // 自摸加的番数
    kongDrawBonus: 2, // 杠上开花加的番数
    // 特殊牌型
    allSimplesBonus: 1, // 断幺九加的番数
    allTerminalsBonus: 4, // 清幺九加的番数
    allHonorsBonus: 4, // 字一色加的番数
    sevenPairsBonus: 2, // 七对子加的番数
    thirteenOrphansBonus: 8, // 十三幺加的番数
    // 封顶设置
    maxCap: 8, // 最高封顶番数
    // 连庄设置
    dealerStreakBonus: 0.5, // 每连庄加半番
    maxDealerStreak: 4, // 最多连庄次数
  },
  scoring: {
    baseScore: 1,
    minScore: 0.5,
    scoreUnit: 0.5, // 半番为最小单位
  },
  rules: {
    requireFlowerOrKong: true, // 胡牌必须有花或杠
    allowGoldCard: true, // 允许使用金牌
    allowEat: true, // 允许吃牌
    dealerAdvantage: true, // 庄家有优势
  },
}

// ==================== 斗地主 ====================
// 标准斗地主规则：
// - 3人游戏，1地主 vs 2农民
// - 叫分/抢地主确定角色
// - 炸弹、火箭翻倍
// - 春天、反春天翻倍
// - 基础分 × 倍数 = 最终得分

export const DOUDIZHU_CONFIG = {
  id: 'doudizhu' as const,
  name: '斗地主',
  description: '经典三人斗地主，支持叫分、炸弹、春天等规则',
  defaultPlayers: 3,
  defaultConfig: {
    // 基础设置
    baseScore: 1, // 基础分（叫分或抢地主确定的底分）
    maxPlayers: 3, // 最大玩家数
    minPlayers: 3, // 最少玩家数
    // 角色设置
    landlordCount: 1, // 地主数量
    farmerCount: 2, // 农民数量
    // 倍数设置
    bombMultiplier: 2, // 炸弹倍数（每张炸弹×2）
    rocketMultiplier: 4, // 火箭（双王）倍数
    springMultiplier: 2, // 春天倍数（地主出完牌农民未出）
    antiSpringMultiplier: 2, // 反春天倍数（农民出完牌地主未出）
    // 封顶设置
    maxMultiplier: 64, // 最高封顶倍数
    // 记牌器设置（可选）
    enableCardTracker: false, // 是否启用记牌器
    // 特殊规则
    allowSuperBomb: false, // 是否允许超级炸弹（四张相同的牌带两张）
    allowAircraft: true, // 是否允许飞机带翅膀
  },
  scoring: {
    baseScore: 1,
    minScore: 1,
    scoreUnit: 1,
  },
  rules: {
    teamBased: true, // 团队对抗模式
    landlordVsFarmers: true, // 地主vs农民模式
    biddingSystem: true, // 叫分系统
    bombAllowed: true, // 允许炸弹
    rocketAllowed: true, // 允许火箭
  },
}

// ==================== 福州510K ====================
// 福州510K（也叫"五十K"）是福州地区流行的扑克玩法：
// - 4人游戏，2v2组队对抗
// - 5、10、K为分牌（分别代表5分、10分、10分）
// - 抢分制，先抢到100分的一方获胜
// - 有特殊牌型：正510K、副510K、炸弹等
// - 亮主确定花色主牌

export const FUZHOU_510K_CONFIG = {
  id: 'fuzhou_510k' as const,
  name: '福州510K',
  description: '福州本地流行的五十K玩法，支持正副510K、亮主、抢分等规则',
  defaultPlayers: 4,
  defaultConfig: {
    // 基础设置
    baseScore: 1, // 基础分（每局输赢的分数）
    maxPlayers: 4, // 最大玩家数
    minPlayers: 4, // 最少玩家数（必须是4人）
    // 组队设置
    teamMode: 'fixed', // 固定组队模式（对家为一队）
    teamCount: 2, // 两队
    playersPerTeam: 2, // 每队2人
    // 分牌设置
    targetScore: 100, // 目标分数（先抢到100分的获胜）
    card5Value: 5, // 5的分值
    card10Value: 10, // 10的分值
    cardKValue: 10, // K的分值
    totalCardScore: 100, // 一副牌中所有分牌的总分（5×4=20, 10×4=40, K×4=40, 共100分）
    // 牌型倍数
    positive510KMultiplier: 5, // 正510K倍数（同花色5-10-K）
    mixed510KMultiplier: 3, // 副/混510K倍数（不同花色5-10-K）
    bomb3Multiplier: 2, // 3张相同炸弹倍数
    bomb4Multiplier: 4, // 4张相同炸弹倍数
    bomb5Multiplier: 5, // 5张相同炸弹倍数（如果有）
    bomb6Multiplier: 6, // 6张相同炸弹倍数（如果有）
    // 亮主设置
    enableBid: true, // 是否启用亮主/叫主
    bidMultiplier: 2, // 亮主成功的倍数
    failedBidPenalty: 2, // 亮主失败的罚分倍数
    // 得分设置
    winByScore: true, // 通过抢分获胜
    winByCards: true, // 通过出完牌获胜（抠底）
    captureBonus: 20, // 抠底奖励分数
    // 局数设置
    roundCount: 1, // 打几局
    upgradeMode: 'winner', // 升级模式（赢家升级）
    // 特殊规则
    mustPlay5: false, // 是否必须有5才能亮主
    allowThrowIn: true, // 是否允许冲牌（最后一轮大牌可以带走分牌）
  },
  scoring: {
    baseScore: 1,
    minScore: 1,
    scoreUnit: 1,
  },
  rules: {
    teamBased: true, // 团队对抗
    fixedPartners: true, // 固定搭档（对家）
    pointCards: true, // 有分牌机制
    bidding: true, // 亮主机制
    specialCombos: true, // 特殊牌型（510K）
    bombAllowed: true, // 允许炸弹
  },
}

// ==================== 导出所有游戏类型 ====================
export const GAME_TYPES: GameTypeDefinition[] = [
  GENERIC_CONFIG,
  FUZHOU_MAHJONG_CONFIG,
  DOUDIZHU_CONFIG,
  FUZHOU_510K_CONFIG,
]

// 类型导出
export type { GameTypeDefinition }

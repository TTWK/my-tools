/**
 * 福州麻将计分逻辑单元测试
 */

import { describe, it, expect } from 'vitest'
import {
  calculateFan,
  calculateScore,
  formatFan,
  isCapped,
  DEFAULT_FUZHOU_MAHJONG_CONFIG,
  type FanCalculationInput,
} from './fuzhou-mahjong'

describe('福州麻将计分逻辑', () => {
  describe('基础番数计算', () => {
    it('平胡基础番数为1番', () => {
      const input: FanCalculationInput = {
        isSelfDraw: false,
        isDealer: false,
        dealerStreak: 0,
        flowerCount: 0,
        hasGoldCard: false,
        exposedKongCount: 0,
        concealedKongCount: 0,
        addedKongCount: 0,
        isKongDraw: false,
        isRobKong: false,
        isSeaBottom: false,
        isMiracle: false,
        handTypes: [],
      }

      const result = calculateFan(input)
      expect(result.details.find((d) => d.type === 'pinghu')?.value).toBe(1)
      expect(result.totalFan).toBe(1)
    })

    it('自摸增加1番', () => {
      const input: FanCalculationInput = {
        isSelfDraw: true,
        isDealer: false,
        dealerStreak: 0,
        flowerCount: 0,
        hasGoldCard: false,
        exposedKongCount: 0,
        concealedKongCount: 0,
        addedKongCount: 0,
        isKongDraw: false,
        isRobKong: false,
        isSeaBottom: false,
        isMiracle: false,
        handTypes: [],
      }

      const result = calculateFan(input)
      expect(result.details.find((d) => d.type === 'selfDraw')?.value).toBe(1)
      expect(result.totalFan).toBe(2) // 平胡1 + 自摸1
    })
  })

  describe('花牌番数计算', () => {
    it('每朵花增加半番', () => {
      const input: FanCalculationInput = {
        isSelfDraw: false,
        isDealer: false,
        dealerStreak: 0,
        flowerCount: 4,
        hasGoldCard: false,
        exposedKongCount: 0,
        concealedKongCount: 0,
        addedKongCount: 0,
        isKongDraw: false,
        isRobKong: false,
        isSeaBottom: false,
        isMiracle: false,
        handTypes: [],
      }

      const result = calculateFan(input)
      const flowerDetail = result.details.find((d) => d.type === 'flower')
      expect(flowerDetail?.value).toBe(2) // 4朵花 × 0.5 = 2番
      expect(flowerDetail?.count).toBe(4)
    })

    it('花牌番数封顶', () => {
      const input: FanCalculationInput = {
        isSelfDraw: false,
        isDealer: false,
        dealerStreak: 0,
        flowerCount: 10, // 超过封顶
        hasGoldCard: false,
        exposedKongCount: 0,
        concealedKongCount: 0,
        addedKongCount: 0,
        isKongDraw: false,
        isRobKong: false,
        isSeaBottom: false,
        isMiracle: false,
        handTypes: [],
      }

      const result = calculateFan(input)
      const flowerDetail = result.details.find((d) => d.type === 'flower')
      expect(flowerDetail?.value).toBe(4) // 封顶4番
    })
  })

  describe('杠牌番数计算', () => {
    it('明杠1番，暗杠2番', () => {
      const input: FanCalculationInput = {
        isSelfDraw: false,
        isDealer: false,
        dealerStreak: 0,
        flowerCount: 0,
        hasGoldCard: false,
        exposedKongCount: 2,
        concealedKongCount: 1,
        addedKongCount: 0,
        isKongDraw: false,
        isRobKong: false,
        isSeaBottom: false,
        isMiracle: false,
        handTypes: [],
      }

      const result = calculateFan(input)
      const exposedKong = result.details.find((d) => d.type === 'exposedKong')
      const concealedKong = result.details.find((d) => d.type === 'concealedKong')

      expect(exposedKong?.value).toBe(2) // 2个明杠 × 1 = 2番
      expect(exposedKong?.count).toBe(2)
      expect(concealedKong?.value).toBe(2) // 1个暗杠 × 2 = 2番
      expect(concealedKong?.count).toBe(1)
    })
  })

  describe('特殊牌型番数计算', () => {
    it('清一色4番，碰碰胡2番', () => {
      const input: FanCalculationInput = {
        isSelfDraw: false,
        isDealer: false,
        dealerStreak: 0,
        flowerCount: 0,
        hasGoldCard: false,
        exposedKongCount: 0,
        concealedKongCount: 0,
        addedKongCount: 0,
        isKongDraw: false,
        isRobKong: false,
        isSeaBottom: false,
        isMiracle: false,
        handTypes: ['pureSuit', 'allPongs'],
      }

      const result = calculateFan(input)
      const pureSuit = result.details.find((d) => d.type === 'pureSuit')
      const allPongs = result.details.find((d) => d.type === 'allPongs')

      expect(pureSuit?.value).toBe(4)
      expect(allPongs?.value).toBe(2)
    })
  })

  describe('庄家番数计算', () => {
    it('庄家基础半番，连庄每把加半番', () => {
      const input: FanCalculationInput = {
        isSelfDraw: false,
        isDealer: true,
        dealerStreak: 3,
        flowerCount: 0,
        hasGoldCard: false,
        exposedKongCount: 0,
        concealedKongCount: 0,
        addedKongCount: 0,
        isKongDraw: false,
        isRobKong: false,
        isSeaBottom: false,
        isMiracle: false,
        handTypes: [],
      }

      const result = calculateFan(input)
      const dealer = result.details.find((d) => d.type === 'dealer')
      const dealerStreak = result.details.find((d) => d.type === 'dealerStreak')

      expect(dealer?.value).toBe(0.5)
      expect(dealerStreak?.value).toBe(1.5) // 3连庄 × 0.5 = 1.5番
      expect(dealerStreak?.count).toBe(3)
    })
  })

  describe('番数封顶', () => {
    it('总番数超过封顶值时应用封顶', () => {
      const input: FanCalculationInput = {
        isSelfDraw: true,
        isDealer: true,
        dealerStreak: 4,
        flowerCount: 8,
        hasGoldCard: true,
        exposedKongCount: 3,
        concealedKongCount: 2,
        isKongDraw: true,
        isRobKong: false,
        isSeaBottom: false,
        isMiracle: false,
        handTypes: ['pureSuit', 'allPongs', 'sevenPairs'],
      }

      const result = calculateFan(input)
      expect(result.totalFan).toBeGreaterThan(
        DEFAULT_FUZHOU_MAHJONG_CONFIG.maxCap
      )
      expect(result.actualFan).toBe(DEFAULT_FUZHOU_MAHJONG_CONFIG.maxCap)
    })
  })

  describe('工具函数', () => {
    it('calculateScore计算正确', () => {
      const details: FanDetail[] = [
        { type: 'pinghu', name: '平胡', value: 1 },
        { type: 'selfDraw', name: '自摸', value: 1 },
      ]
      const score = calculateScore(details)
      expect(score).toBe(2) // 2番 × 1分 = 2分
    })

    it('formatFan格式化正确', () => {
      expect(formatFan(0)).toBe('0番')
      expect(formatFan(0.5)).toBe('半番')
      expect(formatFan(1)).toBe('1番')
      expect(formatFan(2)).toBe('2番')
      expect(formatFan(2.5)).toBe('2.5番')
    })

    it('isCapped检测正确', () => {
      const details: FanDetail[] = [{ type: 'pinghu', name: '平胡', value: 10 }]
      expect(isCapped(details, 8)).toBe(true)
      expect(isCapped(details, 10)).toBe(true)
      expect(isCapped(details, 12)).toBe(false)
    })
  })
})

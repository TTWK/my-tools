import { describe, expect, it } from 'vitest'
import { loadFeedbackItems, saveFeedbackItems, type FeedbackItem } from './feedback-storage'

describe('feedback storage', () => {
  it('保存与读取一致', () => {
    const map = new Map<string, unknown>()
    ;(globalThis as unknown as { uni: unknown }).uni = {
      getStorageSync: (key: string) => map.get(key),
      setStorageSync: (key: string, value: unknown) => map.set(key, value),
    }

    const items: FeedbackItem[] = [
      { id: 'fb1', createdAt: 1, message: 'test', uploaded: false },
      { id: 'fb2', createdAt: 2, message: 'test2', uploaded: true },
    ]
    saveFeedbackItems(items)
    expect(loadFeedbackItems().map(v => v.id)).toEqual(['fb1', 'fb2'])
  })
})

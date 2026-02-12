export interface FeedbackItem {
  id: string
  createdAt: number
  message: string
  contact?: string
  toolId?: string
  route?: string
  system?: Record<string, unknown>
  uploaded?: boolean
}

const STORAGE_KEY = 'tools_platform_feedback_v1'

interface PersistedFeedbackV1 {
  schemaVersion: 1
  savedAt: number
  items: FeedbackItem[]
}

const isPersistedV1 = (value: unknown): value is PersistedFeedbackV1 => {
  const v = value as PersistedFeedbackV1
  return (
    !!v &&
    typeof v === 'object' &&
    v.schemaVersion === 1 &&
    typeof v.savedAt === 'number' &&
    Array.isArray(v.items)
  )
}

export const loadFeedbackItems = (): FeedbackItem[] => {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY)
    if (typeof raw !== 'string' || !raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!isPersistedV1(parsed)) return []
    return parsed.items
  } catch {
    return []
  }
}

export const saveFeedbackItems = (items: FeedbackItem[]) => {
  const payload: PersistedFeedbackV1 = { schemaVersion: 1, savedAt: Date.now(), items }
  uni.setStorageSync(STORAGE_KEY, JSON.stringify(payload))
}

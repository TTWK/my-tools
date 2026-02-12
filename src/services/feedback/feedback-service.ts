import {
  loadFeedbackItems,
  saveFeedbackItems,
  type FeedbackItem,
} from '../storage/feedback-storage'

export interface SubmitFeedbackInput {
  message: string
  contact?: string
  toolId?: string
  route?: string
}

const createId = (prefix: string) =>
  `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`

const collectSystemInfo = (): Record<string, unknown> => {
  try {
    const info = uni.getSystemInfoSync()
    const sdk = (info as unknown as { SDKVersion?: unknown }).SDKVersion
    return {
      platform: info.platform,
      system: info.system,
      brand: info.brand,
      model: info.model,
      version: info.version,
      SDKVersion: sdk,
      screenWidth: info.screenWidth,
      screenHeight: info.screenHeight,
    }
  } catch {
    return {}
  }
}

export const submitFeedback = async (input: SubmitFeedbackInput) => {
  const message = input.message.trim()
  if (!message) throw new Error('请填写问题描述')

  const item: FeedbackItem = {
    id: createId('fb'),
    createdAt: Date.now(),
    message,
    contact: input.contact?.trim() || undefined,
    toolId: input.toolId,
    route: input.route,
    system: collectSystemInfo(),
    uploaded: false,
  }

  const items = loadFeedbackItems()
  items.unshift(item)
  saveFeedbackItems(items)

  return { item, uploaded: false }
}

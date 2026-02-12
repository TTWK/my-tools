import { CLOUD_ENV_ID, ENABLE_CLOUD_SYNC } from '../../config/cloud'
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

const tryUploadToCloud = async (item: FeedbackItem) => {
  if (!ENABLE_CLOUD_SYNC || !CLOUD_ENV_ID) return false
  if (typeof wx === 'undefined' || !wx?.cloud?.callFunction) return false

  try {
    const res = await wx.cloud.callFunction({
      name: 'feedbackSubmit',
      data: { item },
    })
    const result = (res as { result?: unknown } | undefined)?.result as { ok?: unknown } | undefined
    return result?.ok === true
  } catch {
    return false
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

  const uploaded = await tryUploadToCloud(item)
  if (uploaded) {
    const next = loadFeedbackItems().map(v => (v.id === item.id ? { ...v, uploaded: true } : v))
    saveFeedbackItems(next)
  }

  return { item, uploaded }
}

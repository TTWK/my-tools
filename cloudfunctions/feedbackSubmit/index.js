const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const COLLECTION = 'feedback'

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()

  const item = event?.item
  const message = typeof item?.message === 'string' ? item.message.trim() : ''
  if (!message) {
    return { ok: false, error: 'message required' }
  }

  const payload = {
    ...item,
    message,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    receivedAt: Date.now(),
  }

  try {
    await db.collection(COLLECTION).add({ data: payload })
    return { ok: true }
  } catch (err) {
    return { ok: false, error: String(err?.message ?? err) }
  }
}

const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const COLLECTION = 'scorekeeper_games'

exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const db = cloud.database()
  const docId = wxContext.OPENID

  const action = event?.action

  if (action === 'pull') {
    try {
      const res = await db.collection(COLLECTION).doc(docId).get()
      const games = res?.data?.games
      return { games: Array.isArray(games) ? games : [] }
    } catch {
      return { games: [] }
    }
  }

  if (action === 'push') {
    const games = Array.isArray(event?.games) ? event.games : []
    const payload = { games, updatedAt: Date.now() }

    try {
      await db.collection(COLLECTION).doc(docId).set({ data: payload })
      return { ok: true }
    } catch {
      try {
        await db.collection(COLLECTION).doc(docId).update({ data: payload })
        return { ok: true }
      } catch (err) {
        return { ok: false, error: String(err?.message ?? err) }
      }
    }
  }

  return { ok: false, error: 'unknown action' }
}

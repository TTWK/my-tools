<template>
  <view v-if="game" class="page">
    <view class="header">
      <text class="title">{{ typeName }}</text>
      <text class="subtitle">对局 ID：{{ game.id }}</text>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">玩家与总分</text>
        <view class="section-actions">
          <button class="btn" @tap="onUndo">撤销</button>
          <button class="btn" @tap="onRedo">重做</button>
          <button class="btn" @tap="goHistory">历史</button>
          <button class="btn" @tap="goFeedback">反馈</button>
        </view>
      </view>

      <view class="panel">
        <view v-for="p in game.players" :key="p.id" class="player">
          <input
            v-model="playerNameDraft[p.id]"
            class="player-name"
            placeholder="玩家名称"
            @blur="() => onRenamePlayer(p.id)"
          />
          <text class="player-score">{{ scoreTable[p.id] ?? 0 }}</text>
        </view>

        <view class="add-player">
          <input v-model="newPlayerName" class="player-name" placeholder="新增玩家名称" />
          <button class="btn-primary" @tap="onAddPlayer">添加</button>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">新增回合</text>
      </view>

      <view class="panel">
        <view v-for="p in game.players" :key="p.id" class="delta-row">
          <text class="delta-name">{{ p.name }}</text>
          <input
            v-model="deltaDraft[p.id]"
            class="delta-input"
            placeholder="0"
            inputmode="numeric"
          />
        </view>

        <view class="field">
          <text class="label">备注</text>
          <input
            v-model="roundNote"
            class="note-input"
            placeholder="可选：例如 第 1 局 / 第 2 轮"
          />
        </view>

        <view class="actions">
          <button class="btn" @tap="clearDraft">清空</button>
          <button class="btn-primary" @tap="submitRound">保存回合</button>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">已记录回合（{{ appliedRounds.length }}）</text>
      </view>

      <view v-if="appliedRounds.length === 0" class="empty">
        <text class="empty-text">暂无回合记录</text>
      </view>

      <view v-else class="rounds">
        <view v-for="r in appliedRounds" :key="r.id" class="round-card">
          <view class="round-head">
            <text class="round-time">{{ formatTime(r.createdAt) }}</text>
            <text v-if="r.note" class="round-note">{{ r.note }}</text>
          </view>
          <view class="round-body">
            <view v-for="p in game.players" :key="p.id" class="round-delta">
              <text class="round-delta-name">{{ p.name }}</text>
              <text class="round-delta-val">{{ formatDelta(r.deltas[p.id] ?? 0) }}</text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>

  <view v-else class="page">
    <view class="header">
      <text class="title">对局不存在</text>
      <text class="subtitle">请从对局列表进入</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { scorekeeperStore } from '../../features/scorekeeper/store'
import {
  getAppliedRounds,
  getScoreTable,
  type PlayerId,
} from '../../domain/scorekeeper/scorekeeper'

const gameId = ref<string>('')

onLoad(query => {
  const id = (query as Record<string, unknown> | undefined)?.id
  gameId.value = typeof id === 'string' ? id : String(id ?? '')
})

const game = computed(() => scorekeeperStore.state.games.find(g => g.id === gameId.value))
const typeName = computed(() => {
  const g = game.value
  if (!g) return ''
  return scorekeeperStore.gameTypes.find(t => t.id === g.typeId)?.name ?? g.typeId
})

const scoreTable = computed(() => (game.value ? getScoreTable(game.value) : {}))
const appliedRounds = computed(() => (game.value ? getAppliedRounds(game.value) : []))

const deltaDraft = reactive<Record<PlayerId, string>>({})
const playerNameDraft = reactive<Record<PlayerId, string>>({})
const roundNote = ref('')
const newPlayerName = ref('')

watchEffect(() => {
  const g = game.value
  if (!g) return
  for (const p of g.players) {
    if (deltaDraft[p.id] === undefined) deltaDraft[p.id] = ''
    playerNameDraft[p.id] = p.name
  }
})

const formatDelta = (n: number) => {
  if (n > 0) return `+${n}`
  return String(n)
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

const clearDraft = () => {
  const g = game.value
  if (!g) return
  for (const p of g.players) deltaDraft[p.id] = ''
  roundNote.value = ''
}

const submitRound = () => {
  const g = game.value
  if (!g) return

  const deltas: Record<PlayerId, number> = {}
  for (const p of g.players) {
    const raw = deltaDraft[p.id]?.trim()
    const num = raw ? Number(raw) : 0
    deltas[p.id] = Number.isFinite(num) ? num : 0
  }

  try {
    scorekeeperStore.addRound(g.id, deltas, roundNote.value)
    clearDraft()
    uni.showToast({ title: '已保存', icon: 'success' })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '保存失败'
    uni.showToast({ title: message, icon: 'none' })
  }
}

const onUndo = () => {
  const g = game.value
  if (!g) return
  scorekeeperStore.undo(g.id)
}

const onRedo = () => {
  const g = game.value
  if (!g) return
  scorekeeperStore.redo(g.id)
}

const goHistory = () => {
  const g = game.value
  if (!g) return
  uni.navigateTo({ url: `/pages/scorekeeper/history?id=${encodeURIComponent(g.id)}` })
}

const goFeedback = () => {
  const g = game.value
  const from = g
    ? `/pages/scorekeeper/session?id=${encodeURIComponent(g.id)}`
    : '/pages/scorekeeper/session'
  uni.navigateTo({
    url: `/pages/feedback/index?toolId=scorekeeper&from=${encodeURIComponent(from)}`,
  })
}

const onAddPlayer = () => {
  const g = game.value
  if (!g) return
  try {
    scorekeeperStore.addPlayer(g.id, newPlayerName.value)
    newPlayerName.value = ''
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '添加失败'
    uni.showToast({ title: message, icon: 'none' })
  }
}

const onRenamePlayer = (playerId: PlayerId) => {
  const g = game.value
  if (!g) return
  const nextName = playerNameDraft[playerId] ?? ''
  try {
    scorekeeperStore.renamePlayer(g.id, playerId, nextName)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '修改失败'
    uni.showToast({ title: message, icon: 'none' })
    playerNameDraft[playerId] = g.players.find(p => p.id === playerId)?.name ?? ''
  }
}
</script>

<style>
.page {
  padding: 24rpx;
}

.header {
  padding: 24rpx 0 16rpx;
}

.title {
  font-size: 40rpx;
  font-weight: 600;
  color: #1f2328;
}

.subtitle {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #6b7280;
}

.section {
  margin-top: 24rpx;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 0;
  gap: 12rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
}

.section-actions {
  display: flex;
  gap: 10rpx;
}

.panel {
  padding: 18rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
}

.player {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 0;
}

.player-name {
  flex: 1;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
}

.player-score {
  width: 130rpx;
  text-align: right;
  font-size: 32rpx;
  font-weight: 600;
  color: #111827;
}

.add-player {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
}

.delta-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  padding: 10rpx 0;
}

.delta-name {
  width: 200rpx;
  font-size: 28rpx;
  color: #111827;
}

.delta-input {
  flex: 1;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
  text-align: right;
}

.field {
  margin-top: 18rpx;
}

.label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.note-input {
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
}

.actions {
  display: flex;
  gap: 12rpx;
  margin-top: 18rpx;
}

.btn {
  background: #f3f4f6;
  color: #111827;
  font-size: 26rpx;
}

.btn-primary {
  background: #111827;
  color: #ffffff;
  font-size: 26rpx;
}

.empty {
  padding: 24rpx 18rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
}

.empty-text {
  color: #6b7280;
  font-size: 26rpx;
}

.rounds {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.round-card {
  padding: 18rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
}

.round-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10rpx;
}

.round-time {
  font-size: 24rpx;
  color: #6b7280;
}

.round-note {
  font-size: 24rpx;
  color: #111827;
}

.round-body {
  margin-top: 12rpx;
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.round-delta {
  display: flex;
  justify-content: space-between;
}

.round-delta-name {
  font-size: 26rpx;
  color: #111827;
}

.round-delta-val {
  font-size: 26rpx;
  font-weight: 600;
  color: #111827;
}
</style>

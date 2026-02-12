<template>
  <view v-if="game" class="page">
    <view class="header">
      <text class="title">历史记录</text>
      <text class="subtitle">{{ typeName }} · {{ game.players.map(p => p.name).join('、') }}</text>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">已生效回合（{{ appliedRounds.length }}）</text>
      </view>

      <view v-if="appliedRounds.length === 0" class="empty">
        <text class="empty-text">暂无记录</text>
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

    <view class="section">
      <view class="section-header">
        <text class="section-title">已撤销回合（{{ undoneRounds.length }}）</text>
      </view>

      <view v-if="undoneRounds.length === 0" class="empty">
        <text class="empty-text">暂无撤销记录</text>
      </view>

      <view v-else class="rounds">
        <view v-for="r in undoneRounds" :key="r.id" class="round-card muted">
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
      <text class="subtitle">请从对局详情进入</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { scorekeeperStore } from '../../features/scorekeeper/store'
import { getAppliedRounds, getUndoneRounds } from '../../domain/scorekeeper/scorekeeper'

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

const appliedRounds = computed(() => (game.value ? getAppliedRounds(game.value) : []))
const undoneRounds = computed(() => (game.value ? getUndoneRounds(game.value) : []))

const formatDelta = (n: number) => {
  if (n > 0) return `+${n}`
  return String(n)
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
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
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
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

.muted {
  opacity: 0.55;
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

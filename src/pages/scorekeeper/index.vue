<template>
  <view class="page">
    <view class="header">
      <text class="title">棋牌桌游计分器</text>
      <text class="subtitle">新建或继续一场对局</text>
    </view>

    <view class="cloud">
      <button class="btn" @tap="pullFromCloud">从云端拉取</button>
      <button class="btn" @tap="pushToCloud">同步到云端</button>
    </view>

    <view class="section">
      <view class="section-header" @tap="toggleCreate">
        <text class="section-title">新建对局</text>
        <text class="section-arrow">{{ createOpen ? '˅' : '›' }}</text>
      </view>

      <view v-if="createOpen" class="panel">
        <view class="field">
          <text class="label">游戏类型</text>
          <picker :range="gameTypeNames" :value="gameTypeIndex" @change="onGameTypeChange">
            <view class="picker">{{ gameTypeNames[gameTypeIndex] }}</view>
          </picker>
        </view>

        <view class="field">
          <text class="label">玩家</text>
          <view class="players">
            <view v-for="(_, idx) in playerNames" :key="idx" class="player-row">
              <input v-model="playerNames[idx]" class="input" placeholder="请输入玩家名称" />
            </view>
            <view class="actions">
              <button class="btn" @tap="addPlayerInput">添加玩家</button>
              <button class="btn-primary" @tap="createNewGame">开始对局</button>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">对局列表</text>
      </view>

      <view v-if="games.length === 0" class="empty">
        <text class="empty-text">暂无对局，先新建一场吧。</text>
      </view>

      <view v-else class="list">
        <view v-for="g in games" :key="g.id" class="card" @tap="goSession(g.id)">
          <view class="card-main">
            <text class="card-title">{{ getTypeName(g.typeId) }}</text>
            <text class="card-desc">{{ g.players.map(p => p.name).join('、') }}</text>
          </view>
          <text class="card-arrow">›</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { scorekeeperStore } from '../../features/scorekeeper/store'
import type { GameId, GameTypeId } from '../../domain/scorekeeper/scorekeeper'

const createOpen = ref(true)
const gameTypeIndex = ref(0)
const playerNames = ref<string[]>(['', ''])

const gameTypeNames = computed(() => scorekeeperStore.gameTypes.map(t => t.name))
const games = computed(() => scorekeeperStore.state.games)

const toggleCreate = () => {
  createOpen.value = !createOpen.value
}

const onGameTypeChange = (event: unknown) => {
  const detailValue = (event as { detail?: { value?: string | number } }).detail?.value
  gameTypeIndex.value = Number(detailValue ?? 0)
}

const addPlayerInput = () => {
  playerNames.value.push('')
}

const createNewGame = () => {
  const typeId = scorekeeperStore.gameTypes[gameTypeIndex.value]?.id ?? 'generic'
  const names = playerNames.value.map(v => v.trim()).filter(Boolean)
  if (names.length < 2) {
    uni.showToast({ title: '至少需要 2 名玩家', icon: 'none' })
    return
  }

  try {
    const game = scorekeeperStore.createGame(typeId, names)
    goSession(game.id)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : '创建失败'
    uni.showToast({ title: message, icon: 'none' })
  }
}

const goSession = (id: GameId) => {
  uni.navigateTo({ url: `/pages/scorekeeper/session?id=${encodeURIComponent(id)}` })
}

const getTypeName = (typeId: GameTypeId) =>
  scorekeeperStore.gameTypes.find(t => t.id === typeId)?.name ?? typeId

const ensureCloudAvailable = () => {
  if (!scorekeeperStore.isCloudSyncAvailable()) {
    uni.showToast({ title: '云同步未配置，当前仅本地存储', icon: 'none' })
    return false
  }
  return true
}

const pullFromCloud = async () => {
  if (!ensureCloudAvailable()) return
  await scorekeeperStore.pullFromCloud()
  uni.showToast({ title: '已拉取', icon: 'success' })
}

const pushToCloud = async () => {
  if (!ensureCloudAvailable()) return
  await scorekeeperStore.pushToCloud()
  uni.showToast({ title: '已同步', icon: 'success' })
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

.cloud {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
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

.section-arrow {
  color: #9ca3af;
  font-size: 38rpx;
  padding: 0 8rpx;
}

.panel {
  padding: 18rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
}

.field + .field {
  margin-top: 18rpx;
}

.label {
  display: block;
  margin-bottom: 10rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.picker {
  padding: 18rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
  color: #111827;
}

.players {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.player-row {
  display: flex;
}

.input {
  flex: 1;
  padding: 18rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
}

.actions {
  display: flex;
  gap: 12rpx;
  margin-top: 12rpx;
}

.btn {
  flex: 1;
  background: #f3f4f6;
  color: #111827;
  font-size: 28rpx;
}

.btn-primary {
  flex: 1;
  background: #111827;
  color: #ffffff;
  font-size: 28rpx;
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

.list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 22rpx 18rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-main {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #111827;
}

.card-desc {
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #6b7280;
}

.card-arrow {
  font-size: 42rpx;
  color: #9ca3af;
}
</style>

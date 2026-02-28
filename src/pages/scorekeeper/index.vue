<template>
  <view class="page">
    <view class="header">
      <text class="title">我的对局</text>
      <view class="subtitle-row">
        <text class="subtitle">共 {{ games.length }} 场记录</text>
      </view>
    </view>

    <!-- 新建对局卡片 -->
    <view class="glass-card mb-3 create-card">
      <view class="card-header" @tap="toggleCreate">
        <text class="section-title">✨ 新建对局</text>
        <text class="arrow" :class="{ open: createOpen }">›</text>
      </view>

      <view v-if="createOpen" class="create-form">
        <view class="form-item">
          <text class="label">游戏类型</text>
          <picker :range="gameTypeNames" :value="gameTypeIndex" @change="onGameTypeChange">
            <view class="picker-input">{{ gameTypeNames[gameTypeIndex] }}</view>
          </picker>
        </view>

        <view class="form-item">
          <text class="label">玩家列表</text>
          <view class="player-tags">
            <view v-for="(name, idx) in playerNames" :key="idx" class="player-tag">
              <input
                v-model="playerNames[idx]"
                class="tag-input"
                placeholder="玩家名"
                placeholder-class="ph"
              />
              <text v-if="playerNames.length > 2" class="tag-del" @tap="removePlayer(idx)">×</text>
            </view>
            <view class="add-tag" @tap="addPlayerInput">+</view>
          </view>
        </view>

        <button class="btn-start hover-lift" @tap="createNewGame">开始记录</button>
      </view>
    </view>

    <!-- 列表 -->
    <view class="list">
      <view v-if="games.length === 0" class="empty-state">
        <text class="empty-text">暂无对局记录</text>
      </view>

      <view
        v-for="g in games"
        :key="g.id"
        class="game-item glass-card hover-lift"
        @tap="goSession(g.id)"
      >
        <view class="item-main">
          <view class="item-header">
            <text class="item-title">{{ getTypeName(g.typeId) }}</text>
            <text class="item-time">{{ formatDate(g.createdAt) }}</text>
          </view>
          <view class="item-players">
            <view v-for="p in g.players.slice(0, 4)" :key="p.id" class="mini-avatar">
              <image :src="getAvatar(p.name)" class="avatar-img" />
            </view>
            <text v-if="g.players.length > 4" class="more-count">+{{ g.players.length - 4 }}</text>
          </view>
        </view>
        <view class="item-arrow">→</view>
        <view class="item-delete" @tap.stop="deleteGame(g.id)">🗑️</view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { scorekeeperStore } from '../../features/scorekeeper/store'
import type { GameId, GameTypeId } from '../../domain/scorekeeper/scorekeeper'
import { getAvatar } from '../../utils/avatar'

const createOpen = ref(true)
const gameTypeIndex = ref(0)
const playerNames = ref<string[]>(Array(scorekeeperStore.gameTypes[0].defaultPlayers || 2).fill(''))

const gameTypeNames = computed(() => scorekeeperStore.gameTypes.map(t => t.name))
const games = computed(() => scorekeeperStore.state.games)

const toggleCreate = () => {
  createOpen.value = !createOpen.value
}

const onGameTypeChange = (event: any) => {
  const detailValue = event.detail?.value
  gameTypeIndex.value = Number(detailValue ?? 0)

  // 自动更新人数
  const type = scorekeeperStore.gameTypes[gameTypeIndex.value]
  if (type && type.defaultPlayers) {
    const currentCount = playerNames.value.length
    const targetCount = type.defaultPlayers

    if (currentCount < targetCount) {
      // 补充人数
      for (let i = 0; i < targetCount - currentCount; i++) {
        playerNames.value.push('')
      }
    } else if (currentCount > targetCount) {
      // 如果有多余的人，且最后几个是空的，则移除
      // 但为了用户体验，通常不建议直接减少已经填写的名字
      // 这里我们根据模板强制调整人数，如果有多出的空位则移除
      playerNames.value = playerNames.value.slice(0, targetCount)
    }
  }
}

const addPlayerInput = () => {
  playerNames.value.push('')
}

const removePlayer = (idx: number) => {
  if (playerNames.value.length > 2) {
    playerNames.value.splice(idx, 1)
  }
}

const deleteGame = (id: GameId) => {
  uni.showModal({
    title: '确认删除',
    content: '确定要删除这条对局记录吗？',
    success: res => {
      if (res.confirm) {
        scorekeeperStore.deleteGame(id)
      }
    },
  })
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
    // 重置表单
    const defaultCount = scorekeeperStore.gameTypes[gameTypeIndex.value]?.defaultPlayers || 2
    playerNames.value = Array(defaultCount).fill('')
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

const formatDate = (ts: number | undefined) => {
  if (!ts) return ''
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ''
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
</script>

<style lang="scss">
.page {
  padding: 32rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  margin-bottom: 32rpx;

  .title {
    font-size: 48rpx;
    font-weight: 700;
    color: #1a1a1a;
    display: block;
  }

  .subtitle {
    font-size: 26rpx;
    color: #666;
    margin-top: 8rpx;
    display: block;
  }
}

.create-card {
  padding: 24rpx;
  border-radius: 24rpx;
  transition: all 0.3s ease;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8rpx 0;
  }

  .section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
  }

  .arrow {
    font-size: 40rpx;
    color: #999;
    transition: transform 0.3s;
    line-height: 1;

    &.open {
      transform: rotate(90deg);
    }
  }
}

.create-form {
  margin-top: 24rpx;
  padding-top: 24rpx;
  border-top: 1px solid rgba(0, 0, 0, 0.05);

  .form-item {
    margin-bottom: 24rpx;
  }

  .label {
    display: block;
    font-size: 26rpx;
    color: #666;
    margin-bottom: 12rpx;
  }

  .picker-input {
    background: rgba(0, 0, 0, 0.03);
    padding: 20rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #333;
  }

  .player-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .player-tag {
    position: relative;
    width: 45%;

    .tag-input {
      background: rgba(0, 0, 0, 0.03);
      padding: 0 20rpx;
      height: 80rpx;
      line-height: 80rpx;
      border-radius: 12rpx;
      font-size: 28rpx;
      width: 100%;
      box-sizing: border-box;
    }

    .tag-del {
      position: absolute;
      right: 10rpx;
      top: 50%;
      transform: translateY(-50%);
      color: #999;
      font-size: 32rpx;
      padding: 10rpx;
      z-index: 2;
    }
  }

  .add-tag {
    width: 64rpx;
    height: 64rpx;
    border-radius: 12rpx;
    background: rgba(91, 108, 255, 0.1);
    color: #5b6cff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
  }

  .btn-start {
    background: #1a1a1a;
    color: #fff;
    border-radius: 44rpx;
    font-size: 30rpx;
    height: 88rpx;
    line-height: 88rpx;
    margin-top: 32rpx;
    border: none;

    &:after {
      border: none;
    }
  }
}

.list {
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.empty-state {
  padding: 40rpx;
  text-align: center;

  .empty-text {
    color: #999;
    font-size: 28rpx;
  }
}

.game-item {
  display: flex;
  align-items: center;
  padding: 24rpx;
  border-radius: 20rpx;

  .item-main {
    flex: 1;
  }

  .item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
  }

  .item-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
  }

  .item-time {
    font-size: 24rpx;
    color: #999;
  }

  .item-players {
    display: flex;
    align-items: center;

    .mini-avatar {
      width: 48rpx;
      height: 48rpx;
      border-radius: 50%;
      border: 2rpx solid #fff;
      margin-right: -12rpx;
      overflow: hidden;

      .avatar-img {
        width: 100%;
        height: 100%;
      }
    }

    .more-count {
      margin-left: 20rpx;
      font-size: 24rpx;
      color: #999;
    }
  }

  .item-arrow {
    font-size: 32rpx;
    color: #ccc;
    margin-left: 16rpx;
  }

  .item-delete {
    padding: 16rpx;
    margin-left: 8rpx;
    color: #ff6b6b;
    font-size: 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;

    &:active {
      opacity: 0.7;
    }
  }
}
</style>

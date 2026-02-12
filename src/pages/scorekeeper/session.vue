<template>
  <view v-if="game" class="page">
    <!-- Top Header Card -->
    <view class="header glass-card mb-3">
      <view class="header-info">
        <text class="title">{{ typeName }}</text>
        <text class="game-id">#{{ game.id.slice(-4) }}</text>
      </view>
      <view class="header-actions">
        <view class="icon-btn" @tap="onUndo" title="撤销">
          <text class="iconfont">↩</text>
        </view>
        <view class="icon-btn" @tap="onRedo" title="恢复">
          <text class="iconfont">↪</text>
        </view>
        <view class="icon-btn" @tap="goHistory" title="明细">
          <text class="iconfont">🕒</text>
        </view>
      </view>
    </view>

    <!-- Score Input Area -->
    <view class="input-section">
      <view class="section-header mb-2">
        <text class="section-title">本轮计分</text>
        <view class="add-player-trigger" @tap="showAddPlayerModal">
          <text class="plus-icon">+</text>
          <text class="add-text">添加玩家</text>
        </view>
      </view>

      <!-- Add Player Modal/Input (Inline for now) -->
      <view v-if="isAddingPlayer" class="add-player-row glass-card mb-2">
        <input v-model="newPlayerName" class="new-player-input" placeholder="输入玩家姓名" focus />
        <view class="add-actions">
          <text class="btn-cancel" @tap="cancelAddPlayer">取消</text>
          <text class="btn-confirm" @tap="confirmAddPlayer">确定</text>
        </view>
      </view>

      <view class="player-grid">
        <view v-for="p in game.players" :key="p.id" class="player-card glass-card">
          <!-- Left: Avatar & Name -->
          <view class="player-basic">
            <image :src="getAvatar(p.name)" class="avatar" />
            <view class="name-container">
              <input
                v-model="playerNameDraft[p.id]"
                class="player-name-input"
                @blur="() => onRenamePlayer(p.id)"
              />
              <view
                v-if="canRemovePlayer(p.id)"
                class="btn-remove-player"
                @tap="onRemovePlayer(p.id)"
              >
                <text class="icon-remove">×</text>
              </view>
            </view>
          </view>

          <!-- Middle: Total Score (Prominent) -->
          <view class="player-total">
            <text class="score-val">{{ scoreTable[p.id] ?? 0 }}</text>
            <text class="score-label">总分</text>
          </view>

          <!-- Right: Stepper -->
          <view class="score-input-group">
            <view class="stepper-btn" @tap="adjustScore(p.id, -1)">-</view>
            <input
              v-model="deltaDraft[p.id]"
              class="round-score-input"
              type="number"
              placeholder="0"
            />
            <view class="stepper-btn" @tap="adjustScore(p.id, 1)">+</view>
          </view>
        </view>
      </view>

      <!-- Round Actions -->
      <view class="footer-panel glass-card">
        <textarea
          v-model="roundNote"
          class="note-input"
          placeholder="本轮备注..."
          auto-height
          disable-default-padding
        />
        <view class="action-row">
          <button class="btn-reset" @tap="clearDraft">重置</button>
          <button class="btn-submit" @tap="submitRound">确认本轮</button>
        </view>
      </view>
    </view>
  </view>

  <view v-else class="page empty-state">
    <text>对局不存在</text>
    <button class="btn-primary mt-3" @tap="goBack">返回列表</button>
  </view>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { scorekeeperStore } from '../../features/scorekeeper/store'
import { getScoreTable, type PlayerId } from '../../domain/scorekeeper/scorekeeper'
import { getAvatar } from '../../utils/avatar'

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

const deltaDraft = reactive<Record<PlayerId, string>>({})
const playerNameDraft = reactive<Record<PlayerId, string>>({})
const roundNote = ref('')

// Add Player Logic
const isAddingPlayer = ref(false)
const newPlayerName = ref('')

watchEffect(() => {
  const g = game.value
  if (!g) return
  for (const p of g.players) {
    if (deltaDraft[p.id] === undefined) deltaDraft[p.id] = ''
    playerNameDraft[p.id] = p.name
  }
})

const vibrate = () => {
  uni.vibrateShort({ success: () => {} })
}

const adjustScore = (pid: PlayerId, delta: number) => {
  const current = Number(deltaDraft[pid] || 0)
  deltaDraft[pid] = String(current + delta)
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
  let hasValue = false
  for (const p of g.players) {
    const raw = deltaDraft[p.id]?.trim()
    const num = raw ? Number(raw) : 0
    if (num !== 0) hasValue = true
    deltas[p.id] = Number.isFinite(num) ? num : 0
  }

  if (!hasValue) {
    uni.showToast({ title: '分数为 0', icon: 'none' })
    return
  }

  try {
    scorekeeperStore.addRound(g.id, deltas, roundNote.value)
    clearDraft()
    uni.showToast({ title: '已保存', icon: 'success' })
    vibrate()
  } catch {
    uni.showToast({ title: '保存失败', icon: 'none' })
  }
}

const onUndo = () => {
  if (game.value) scorekeeperStore.undo(game.value.id)
}
const onRedo = () => {
  if (game.value) scorekeeperStore.redo(game.value.id)
}
const goHistory = () => {
  if (game.value) uni.navigateTo({ url: `/pages/scorekeeper/history?id=${game.value.id}` })
}
const goBack = () => uni.navigateBack()

const showAddPlayerModal = () => {
  isAddingPlayer.value = true
  newPlayerName.value = ''
}

const cancelAddPlayer = () => {
  isAddingPlayer.value = false
  newPlayerName.value = ''
}

const confirmAddPlayer = () => {
  if (!game.value || !newPlayerName.value.trim()) return
  try {
    scorekeeperStore.addPlayer(game.value.id, newPlayerName.value)
    newPlayerName.value = ''
    isAddingPlayer.value = false
    uni.showToast({ title: '添加成功', icon: 'success' })
  } catch {
    uni.showToast({ title: '添加失败', icon: 'none' })
  }
}

const onRenamePlayer = (pid: PlayerId) => {
  if (!game.value) return
  const next = playerNameDraft[pid]
  if (next && next !== game.value.players.find(p => p.id === pid)?.name) {
    scorekeeperStore.renamePlayer(game.value.id, pid, next)
  }
}

const canRemovePlayer = (pid: PlayerId) => {
  if (!game.value) return false
  // Check if player has any non-zero delta in rounds
  return !game.value.rounds.some(r => {
    const delta = r.deltas[pid]
    return typeof delta === 'number' && delta !== 0
  })
}

const onRemovePlayer = (pid: PlayerId) => {
  if (!game.value) return
  uni.showModal({
    title: '确认移除',
    content: '确定要移除该玩家吗？',
    success: res => {
      if (res.confirm && game.value) {
        try {
          scorekeeperStore.removePlayer(game.value.id, pid)
          uni.showToast({ title: '已移除', icon: 'none' })
        } catch (e) {
          uni.showToast({ title: String(e), icon: 'none' })
        }
      }
    },
  })
}
</script>

<style lang="scss">
.page {
  padding: 32rpx;
  min-height: 100vh;
  box-sizing: border-box;
}

/* 1. Header Styles - Unified with Player Card */
.header {
  padding: 24rpx; /* Reduced to match player card roughly */
  border-radius: 24rpx;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .header-info {
    display: flex;
    flex-direction: column;
  }

  .title {
    font-size: 34rpx;
    font-weight: 700;
    color: #333;
  }

  .game-id {
    font-size: 24rpx;
    color: #999;
    font-family: monospace;
    margin-top: 4rpx;
  }

  .header-actions {
    display: flex;
    gap: 16rpx;
  }

  .icon-btn {
    width: 72rpx;
    height: 72rpx;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

    .iconfont {
      font-size: 36rpx;
      color: #333;
      line-height: 1;
    }

    &:active {
      background: rgba(255, 255, 255, 0.6);
      transform: scale(0.95);
    }
  }
}

/* 2. Section Header & Add Player */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 8rpx;
}

.section-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #333;
}

.add-player-trigger {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background: rgba(255, 255, 255, 0.3);
  padding: 8rpx 20rpx;
  border-radius: 30rpx;

  .plus-icon {
    font-size: 32rpx;
    color: #5b6cff;
    font-weight: bold;
    line-height: 1;
  }

  .add-text {
    font-size: 26rpx;
    color: #5b6cff;
    font-weight: 500;
  }

  &:active {
    background: rgba(255, 255, 255, 0.5);
  }
}

.add-player-row {
  display: flex;
  align-items: center;
  padding: 20rpx;
  border-radius: 20rpx;
  gap: 16rpx;

  .new-player-input {
    flex: 1;
    font-size: 28rpx;
    height: 60rpx;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 12rpx;
    padding: 0 16rpx;
  }

  .add-actions {
    display: flex;
    gap: 24rpx;
    align-items: center;

    .btn-cancel {
      font-size: 26rpx;
      color: #999;
    }

    .btn-confirm {
      font-size: 26rpx;
      color: #5b6cff;
      font-weight: 600;
    }
  }
}

.player-grid {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

/* 3. Player Card - Redesigned */
.player-card {
  padding: 24rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  gap: 16rpx;

  .player-basic {
    display: flex;
    align-items: center;
    flex: 1; /* Takes available space */
    min-width: 0; /* Allow shrinking */

    .avatar {
      width: 80rpx;
      height: 80rpx;
      border-radius: 50%;
      margin-right: 16rpx;
      border: 2rpx solid rgba(255, 255, 255, 0.5);
      flex-shrink: 0;
    }

    .name-container {
      flex: 1;
      display: flex;
      align-items: center;
      min-width: 0;

      .player-name-input {
        font-size: 30rpx;
        font-weight: 600;
        color: #1a1a1a;
        height: 44rpx;
        flex: 1;
        min-width: 0;
      }

      .btn-remove-player {
        width: 44rpx;
        height: 44rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: 8rpx;
        border-radius: 50%;
        background: rgba(0, 0, 0, 0.05);

        .icon-remove {
          font-size: 32rpx;
          color: #999;
          line-height: 1;
          margin-top: -4rpx;
        }

        &:active {
          background: rgba(255, 0, 0, 0.1);
          .icon-remove {
            color: #ff4d4f;
          }
        }
      }
    }
  }

  .player-total {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    margin: 0 16rpx;
    min-width: 80rpx;

    .score-val {
      font-size: 40rpx; /* Prominent size */
      font-weight: 700;
      color: #5b6cff;
      line-height: 1;
    }

    .score-label {
      font-size: 20rpx;
      color: #999;
      margin-top: 4rpx;
    }
  }

  .score-input-group {
    display: flex;
    align-items: center;
    gap: 8rpx;
    background: rgba(255, 255, 255, 0.3);
    padding: 6rpx;
    border-radius: 16rpx;
    flex-shrink: 0;

    .stepper-btn {
      width: 56rpx;
      height: 56rpx;
      border-radius: 12rpx;
      background: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32rpx;
      color: #5b6cff;
      box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.05);

      &:active {
        transform: scale(0.95);
      }
    }

    .round-score-input {
      width: 72rpx;
      text-align: center;
      font-size: 32rpx;
      font-weight: 700;
      color: #1a1a1a;
    }
  }
}

.footer-panel {
  margin-top: 32rpx;
  padding: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
  border-radius: 24rpx;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
}

/* 4. Note Input Height */
.note-input {
  background: rgba(0, 0, 0, 0.03);
  padding: 20rpx;
  border-radius: 16rpx;
  font-size: 28rpx;
  width: 100%;
  box-sizing: border-box;
  min-height: 120rpx; /* Increased height */
}

.action-row {
  display: flex;
  gap: 24rpx;

  button {
    flex: 1;
    border-radius: 44rpx;
    font-size: 30rpx;
    height: 88rpx;
    line-height: 88rpx;
    border: none;
    font-weight: 600;

    &:after {
      border: none;
    }
  }

  .btn-reset {
    background: rgba(0, 0, 0, 0.05);
    color: #666;
  }

  .btn-submit {
    background: #5b6cff;
    color: #fff;
    box-shadow: 0 4rpx 16rpx rgba(91, 108, 255, 0.3);
  }
}
</style>

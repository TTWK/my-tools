<template>
  <view class="page">
    <view class="header">
      <text class="title">反馈与建议</text>
      <text class="subtitle">问题描述会优先本地保存，启用云同步后可上报云端</text>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">提交反馈</text>
      </view>

      <view class="panel">
        <view class="field">
          <text class="label">问题描述（必填）</text>
          <textarea
            v-model="message"
            class="textarea"
            placeholder="请尽量描述：现象、操作步骤、期望结果"
          />
        </view>

        <view class="field">
          <text class="label">联系方式（选填）</text>
          <input v-model="contact" class="input" placeholder="微信号/手机号/邮箱（任选其一）" />
        </view>

        <view class="field">
          <text class="label">来源（自动）</text>
          <view class="meta">
            <text class="meta-item">toolId：{{ toolId || '未指定' }}</text>
            <text class="meta-item">from：{{ fromRoute || '未指定' }}</text>
          </view>
        </view>

        <view class="actions">
          <button class="btn" @tap="refresh">刷新列表</button>
          <button class="btn-primary" @tap="onSubmit">提交</button>
        </view>
      </view>
    </view>

    <view class="section">
      <view class="section-header">
        <text class="section-title">本地反馈记录（{{ items.length }}）</text>
      </view>

      <view v-if="items.length === 0" class="empty">
        <text class="empty-text">暂无记录</text>
      </view>

      <view v-else class="list">
        <view v-for="it in items" :key="it.id" class="card">
          <view class="card-head">
            <text class="card-time">{{ formatTime(it.createdAt) }}</text>
            <text class="card-tag">{{ it.uploaded ? '已上报' : '仅本地' }}</text>
          </view>
          <text class="card-msg">{{ it.message }}</text>
          <text v-if="it.contact" class="card-meta">联系：{{ it.contact }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { onLoad, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { submitFeedback } from '../../services/feedback/feedback-service'
import { loadFeedbackItems, type FeedbackItem } from '../../services/storage/feedback-storage'

const message = ref('')
const contact = ref('')
const toolId = ref<string>('')
const fromRoute = ref<string>('')

const items = ref<FeedbackItem[]>([])

const refresh = () => {
  items.value = loadFeedbackItems()
}

onShow(refresh)

onLoad(query => {
  const q = query as Record<string, unknown> | undefined
  toolId.value = typeof q?.toolId === 'string' ? q.toolId : ''
  fromRoute.value = typeof q?.from === 'string' ? q.from : ''
})

const onSubmit = async () => {
  try {
    const res = await submitFeedback({
      message: message.value,
      contact: contact.value,
      toolId: toolId.value || undefined,
      route: fromRoute.value || undefined,
    })
    message.value = ''
    contact.value = ''
    refresh()
    uni.showToast({ title: res.uploaded ? '已提交并上报' : '已提交（本地）', icon: 'success' })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '提交失败'
    uni.showToast({ title: msg, icon: 'none' })
  }
}

const formatTime = (ts: number) => {
  const d = new Date(ts)
  const pad = (v: number) => String(v).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`
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

.textarea {
  width: 100%;
  min-height: 240rpx;
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
}

.input {
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
}

.meta {
  padding: 16rpx;
  border-radius: 12rpx;
  background: #f3f4f6;
}

.meta-item {
  display: block;
  font-size: 24rpx;
  color: #374151;
}

.actions {
  display: flex;
  gap: 12rpx;
  margin-top: 18rpx;
}

.btn {
  flex: 1;
  background: #f3f4f6;
  color: #111827;
  font-size: 26rpx;
}

.btn-primary {
  flex: 1;
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

.list {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.card {
  padding: 18rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-time {
  font-size: 24rpx;
  color: #6b7280;
}

.card-tag {
  font-size: 22rpx;
  color: #111827;
}

.card-msg {
  display: block;
  margin-top: 12rpx;
  font-size: 26rpx;
  color: #111827;
}

.card-meta {
  display: block;
  margin-top: 10rpx;
  font-size: 24rpx;
  color: #6b7280;
}
</style>

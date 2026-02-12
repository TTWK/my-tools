<template>
  <view class="page">
    <view class="header">
      <text class="title">工具聚合平台</text>
      <text class="subtitle">选择一个工具开始使用</text>
    </view>

    <view class="list">
      <view class="card" @tap="goScorekeeper">
        <view class="card-main">
          <text class="card-title">棋牌桌游计分器</text>
          <text class="card-desc">玩家管理、计分记录、历史查看</text>
        </view>
        <text class="card-arrow">›</text>
      </view>

      <view class="card" @tap="goFeedback">
        <view class="card-main">
          <text class="card-title">反馈与建议</text>
          <text class="card-desc">提交问题与想法，帮助我们持续优化</text>
        </view>
        <text class="card-arrow">›</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const goScorekeeper = () => {
  uni.navigateTo({ url: '/pages/scorekeeper/index' })
}

const goFeedback = () => {
  uni.navigateTo({ url: '/pages/feedback/index?from=/pages/home/index' })
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

.list {
  margin-top: 16rpx;
}

.card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 28rpx 24rpx;
  border-radius: 16rpx;
  background: #ffffff;
  box-shadow: 0 6rpx 20rpx rgba(0, 0, 0, 0.06);
}

.card-main {
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 32rpx;
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

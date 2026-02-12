<template>
  <view class="page">
    <view class="header">
      <text class="title">工具聚合平台</text>
      <text class="subtitle">选择一个工具开始使用</text>
    </view>

    <view class="list">
      <view class="card glass-card hover-lift" @tap="goScorekeeper">
        <view class="card-icon">
          <text class="emoji">🎲</text>
        </view>
        <view class="card-main">
          <text class="card-title">棋牌桌游计分器</text>
          <text class="card-desc">支持多人对局、历史回溯与数据统计</text>
        </view>
        <view class="card-arrow">→</view>
      </view>
    </view>

    <view class="footer">
      <view class="feedback-btn" @tap="showFeedback = true">
        <text class="icon">💬</text>
        <text>问题反馈</text>
      </view>
    </view>

    <FeedbackPopup v-if="showFeedback" :visible="showFeedback" @update:visible="val => showFeedback = val" />
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import FeedbackPopup from '../../components/FeedbackPopup.vue'

const showFeedback = ref(false)

const goScorekeeper = () => {
  uni.navigateTo({ url: '/pages/scorekeeper/index' })
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  padding: 48rpx 32rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.header {
  margin-bottom: 64rpx;
  
  .title {
    font-size: 48rpx;
    font-weight: 700;
    color: #1A1A1A;
    display: block;
    margin-bottom: 16rpx;
    letter-spacing: -0.5px;
  }
  
  .subtitle {
    font-size: 28rpx;
    color: #666;
  }
}

.list {
  flex: 1;
}

.card {
  display: flex;
  align-items: center;
  padding: 32rpx;
  border-radius: 24rpx;
  background: #fff;
  margin-bottom: 32rpx;
  position: relative;
  overflow: hidden;
  
  .card-icon {
    width: 88rpx;
    height: 88rpx;
    background: linear-gradient(135deg, #E0E7FF 0%, #F5F7FA 100%);
    border-radius: 20rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 24rpx;
    
    .emoji {
      font-size: 40rpx;
    }
  }

  .card-main {
    flex: 1;
    
    .card-title {
      font-size: 34rpx;
      font-weight: 600;
      color: #1A1A1A;
      display: block;
      margin-bottom: 8rpx;
    }
    
    .card-desc {
      font-size: 24rpx;
      color: #888;
      line-height: 1.4;
    }
  }
  
  .card-arrow {
    font-size: 40rpx;
    color: #CCC;
    font-weight: 300;
  }
}

.footer {
  padding-bottom: 40rpx;
  display: flex;
  justify-content: center;
}

.feedback-btn {
  display: flex;
  align-items: center;
  padding: 16rpx 32rpx;
  background: rgba(0,0,0,0.03);
  border-radius: 40rpx;
  
  text {
    font-size: 26rpx;
    color: #999;
  }
  
  .icon {
    margin-right: 8rpx;
    font-size: 24rpx;
  }
  
  &:active {
    background: rgba(0,0,0,0.06);
  }
}
</style>
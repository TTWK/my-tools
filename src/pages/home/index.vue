<template>
  <view class="page">
    <view class="header-section">
      <view class="header-content">
        <text class="app-name">全能集</text>
        <text class="app-slogan">HAVE FUN!</text>
      </view>
      <view class="header-bg-circle circle-1"></view>
      <view class="header-bg-circle circle-2"></view>
    </view>

    <view class="content-section">
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
        <button class="feedback-btn" open-type="feedback">
          <text class="icon">💬</text>
          <text>问题反馈</text>
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
const goScorekeeper = () => {
  uni.navigateTo({ url: '/pages/scorekeeper/index' })
}
</script>

<style lang="scss">
.page {
  min-height: 100vh;
  background-color: #F5F7FA;
  display: flex;
  flex-direction: column;
}

.header-section {
  position: relative;
  background: linear-gradient(135deg, $uni-color-primary 0%, lighten($uni-color-primary, 20%) 100%);
  padding: 120rpx 40rpx 80rpx;
  border-bottom-left-radius: 48rpx;
  border-bottom-right-radius: 48rpx;
  box-shadow: 0 10rpx 30rpx rgba($uni-color-primary, 0.2);
  overflow: hidden;
  margin-bottom: 40rpx;

  .header-content {
    position: relative;
    z-index: 2;
  }

  .app-name {
    font-size: 56rpx;
    font-weight: 800;
    color: #ffffff;
    display: block;
    margin-bottom: 16rpx;
    letter-spacing: 2rpx;
    text-shadow: 0 2rpx 4rpx rgba(0,0,0,0.1);
  }

  .app-slogan {
    font-size: 28rpx;
    color: rgba(255, 255, 255, 0.9);
    display: block;
    font-weight: 400;
  }

  .header-bg-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    pointer-events: none;
    
    &.circle-1 {
      width: 300rpx;
      height: 300rpx;
      top: -100rpx;
      right: -50rpx;
    }
    
    &.circle-2 {
      width: 160rpx;
      height: 160rpx;
      bottom: -40rpx;
      left: 40rpx;
    }
  }
}

.content-section {
  flex: 1;
  padding: 0 32rpx 48rpx;
  display: flex;
  flex-direction: column;
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
  box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.98);
  }

  .card-icon {
    width: 96rpx;
    height: 96rpx;
    background: linear-gradient(135deg, #e0e7ff 0%, #f5f7fa 100%);
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 32rpx;
    flex-shrink: 0;

    .emoji {
      font-size: 48rpx;
    }
  }

  .card-main {
    flex: 1;
    min-width: 0;

    .card-title {
      font-size: 36rpx;
      font-weight: 700;
      color: #1a1a1a;
      display: block;
      margin-bottom: 8rpx;
    }

    .card-desc {
      font-size: 26rpx;
      color: #666;
      line-height: 1.4;
      display: block;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .card-arrow {
    font-size: 40rpx;
    color: #ccc;
    font-weight: 300;
    margin-left: 16rpx;
  }
}

.footer {
  padding-bottom: env(safe-area-inset-bottom);
  display: flex;
  justify-content: center;
  margin-top: 40rpx;
}

.feedback-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx 40rpx;
  background: #fff;
  border-radius: 100rpx;
  line-height: normal;
  margin: 0;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 2rpx 8rpx rgba(0,0,0,0.05);

  &::after {
    border: none;
  }

  text {
    font-size: 28rpx;
    color: #666;
    font-weight: 500;
  }

  .icon {
    margin-right: 12rpx;
    font-size: 32rpx;
  }

  &:active {
    background: #f5f5f5;
  }
}
</style>

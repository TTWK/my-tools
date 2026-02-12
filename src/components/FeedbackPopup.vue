<template>
  <view v-if="visible" class="popup-mask" @tap="close">
    <view class="popup-content glass-card" @tap.stop>
      <view class="popup-header">
        <text class="popup-title">反馈与建议</text>
        <text class="close-btn" @tap="close">×</text>
      </view>
      
      <scroll-view scroll-y class="popup-body">
        <view class="form-item">
          <text class="label">问题类型</text>
          <view class="tags">
            <view 
              v-for="type in ['功能建议', '程序Bug', '其他']" 
              :key="type"
              class="tag"
              :class="{ active: form.type === type }"
              @tap="form.type = type"
            >
              {{ type }}
            </view>
          </view>
        </view>

        <view class="form-item">
          <text class="label">详细描述</text>
          <textarea 
            v-model="form.message" 
            class="input-area" 
            placeholder="请描述您遇到的问题或建议..."
            :maxlength="500"
          />
        </view>

        <view class="form-item">
          <text class="label">联系方式 (选填)</text>
          <input 
            v-model="form.contact" 
            class="input-field" 
            placeholder="手机号/邮箱/微信"
          />
        </view>

        <view class="form-item">
          <text class="label">图片上传 ({{ form.images.length }}/3)</text>
          <view class="image-grid">
            <view 
              v-for="(img, index) in form.images" 
              :key="index" 
              class="image-preview"
            >
              <image :src="img" mode="aspectFill" class="thumb" />
              <view class="del-btn" @tap="removeImage(index)">×</view>
            </view>
            <view 
              v-if="form.images.length < 3" 
              class="add-btn" 
              @tap="chooseImage"
            >
              <text class="plus">+</text>
            </view>
          </view>
        </view>
      </scroll-view>

      <view class="popup-footer">
        <button 
          class="submit-btn hover-lift" 
          :loading="submitting" 
          @tap="submit"
        >
          提交反馈
        </button>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { submitFeedback } from '../services/feedback/feedback-service'

defineProps<{
  visible: boolean
}>()

const emit = defineEmits(['update:visible'])

const submitting = ref(false)
const form = reactive({
  type: '功能建议',
  message: '',
  contact: '',
  images: [] as string[]
})

const close = () => {
  emit('update:visible', false)
}

const chooseImage = () => {
  uni.chooseImage({
    count: 3 - form.images.length,
    success: (res) => {
      form.images.push(...res.tempFilePaths)
    }
  })
}

const removeImage = (index: number) => {
  form.images.splice(index, 1)
}

const submit = async () => {
  if (!form.message.trim()) {
    uni.showToast({ title: '请填写描述', icon: 'none' })
    return
  }

  submitting.value = true
  try {
    // Note: Image upload logic would go here. 
    // Since we removed cloud, we just store local paths or simulate upload.
    await submitFeedback({
      message: `[${form.type}] ${form.message}`,
      contact: form.contact
    })
    
    uni.showToast({ title: '感谢您的反馈', icon: 'success' })
    form.message = ''
    form.images = []
    close()
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '提交失败'
    uni.showToast({ title: msg, icon: 'none' })
  } finally {
    submitting.value = false
  }
}
</script>

<style lang="scss" scoped>
.popup-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 999;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.popup-content {
  background: #fff;
  border-radius: 24rpx 24rpx 0 0;
  padding: 32rpx;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24rpx;
}

.popup-title {
  font-size: 36rpx;
  font-weight: 600;
  color: #1A1A1A;
}

.close-btn {
  font-size: 40rpx;
  color: #999;
  padding: 10rpx;
}

.popup-body {
  flex: 1;
  overflow-y: auto;
}

.form-item {
  margin-bottom: 32rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.tags {
  display: flex;
  gap: 16rpx;
}

.tag {
  padding: 12rpx 24rpx;
  background: #F5F7FA;
  border-radius: 32rpx;
  font-size: 26rpx;
  color: #666;
  &.active {
    background: #E0E7FF;
    color: #5B6CFF;
    font-weight: 500;
  }
}

.input-area {
  width: 100%;
  height: 200rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  padding: 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.input-field {
  width: 100%;
  height: 80rpx;
  background: #F9FAFB;
  border-radius: 12rpx;
  padding: 0 20rpx;
  font-size: 28rpx;
  box-sizing: border-box;
}

.image-grid {
  display: flex;
  gap: 16rpx;
}

.image-preview, .add-btn {
  width: 160rpx;
  height: 160rpx;
  border-radius: 12rpx;
  position: relative;
}

.thumb {
  width: 100%;
  height: 100%;
  border-radius: 12rpx;
}

.add-btn {
  background: #F9FAFB;
  border: 2rpx dashed #DDD;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plus {
  font-size: 60rpx;
  color: #CCC;
}

.del-btn {
  position: absolute;
  top: -10rpx;
  right: -10rpx;
  background: rgba(0,0,0,0.5);
  color: #fff;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  text-align: center;
  line-height: 32rpx;
  font-size: 24rpx;
}

.submit-btn {
  background: #5B6CFF;
  color: #fff;
  border-radius: 44rpx;
  font-size: 32rpx;
  height: 88rpx;
  line-height: 88rpx;
  margin-top: 16rpx;
}
</style>
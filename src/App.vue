<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { scorekeeperStore } from './features/scorekeeper/store'

onLaunch(() => {
  console.log('App Launch')
  scorekeeperStore.hydrateFromLocal()
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>
<style>
/* 全局样式 */
page {
  font-family:
    'Inter',
    'Source Han Sans CN',
    -apple-system,
    BlinkMacSystemFont,
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  background-color: #f5f7fa;
  color: #1a1a1a;
  line-height: 1.5;
}

@media (prefers-color-scheme: dark) {
  page {
    background-color: #121212;
    color: #e0e0e0;
  }
}

.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
}

@media (prefers-color-scheme: dark) {
  .glass-card {
    background: rgba(30, 30, 30, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3);
  }
}

.hover-lift {
  transition:
    transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1),
    box-shadow 0.3s ease-out;
}

.hover-lift:active {
  transform: scale(0.98);
}

/* 8px 网格工具类 */
.mb-1 {
  margin-bottom: 8px;
}
.mb-2 {
  margin-bottom: 16px;
}
.mb-3 {
  margin-bottom: 24px;
}
.p-2 {
  padding: 16px;
}
.p-3 {
  padding: 24px;
}
</style>

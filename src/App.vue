<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app'
import { scorekeeperStore } from './features/scorekeeper/store'
import { CLOUD_ENV_ID, ENABLE_CLOUD_SYNC } from './config/cloud'
onLaunch(() => {
  console.log('App Launch')
  if (ENABLE_CLOUD_SYNC && CLOUD_ENV_ID && typeof wx !== 'undefined' && wx?.cloud?.init) {
    try {
      wx.cloud.init({ env: CLOUD_ENV_ID, traceUser: true })
    } catch (err) {
      console.warn('[cloud] init failed', err)
    }
  }
  scorekeeperStore.hydrateFromLocal()
})
onShow(() => {
  console.log('App Show')
})
onHide(() => {
  console.log('App Hide')
})
</script>
<style></style>

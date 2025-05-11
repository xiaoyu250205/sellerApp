<template>
  <div class="mobile-layout">
    <!-- 头部店铺信息 -->
    <div class="shop-header" v-if="isShopPage">
      <div class="shop-info">
        <!-- <el-avatar :size="40" :src="shopLogo || '@/assets/logo.png'" />
        <div class="shop-name">{{ shopName }}</div> -->
        <div class="shop-name">{{ t('common.title') }}</div>
      </div>
      <div class="header-actions">
        <el-icon class="action-icon" @click="handleCustomerService"><Headset /></el-icon>
        <el-badge :value="unreadCount" :hidden="!unreadCount" class="notification-badge">
          <el-icon class="action-icon" @click="handleNotificationClick"><Bell /></el-icon>
        </el-badge>
      </div>
    </div>
    
    <!-- 内容区域 -->
    <div class="mobile-content">
      <router-view></router-view>
    </div>
    
    <!-- 底部导航栏 -->
    <div class="mobile-tabbar">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index" 
        class="tab-item" 
        :class="{ active: activeTab === tab.path }"
        @click="switchTab(tab.path)"
      >
        <div class="tab-icon-container">
          <el-icon><component :is="tab.icon" /></el-icon>
          <el-badge v-if="tab.path === '/m/orders' && pendingOrderCount > 0" :value="pendingOrderCount" :max="99" class="tab-badge" />
        </div>
        <span class="tab-label">{{ t(tab.title) }}</span>
      </div>
    </div>
    
    <!-- 消息抽屉 -->
    <el-drawer
      v-model="notificationDrawerVisible"
      :title="t('common.orderNotifications')"
      direction="rtl"
      size="80%"
    >
      <div class="notification-header">
        <span class="notification-title">{{ t('common.orderNotifications') }}</span>
        <span class="notification-count">{{ unreadCount }} {{ t('common.unreadCount') }}</span>
      </div>
      <div class="notification-list">
        <div v-if="notifications.length === 0" class="empty-notification">
          <el-empty :description="t('common.noNotifications')" />
        </div>
        <div 
          v-for="notice in notifications" 
          :key="notice.id" 
          class="notification-item"
          @click="markAsRead(notice.id)"
        >
          <div class="notification-content">
            <div class="notification-title">{{ notice.title }}</div>
            <div class="notification-desc">{{ notice.content }}</div>
            <div class="notification-time">{{ notice.time }}</div>
          </div>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { getPendingOrderCount } from '@/api/order'
import { Howl } from 'howler'
import { useMessageStore } from '@/stores/message'
import { updateMessageStatus } from '@/api/mainLayout'
const { t } = useI18n()
const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const messageStore = useMessageStore()

// 将店铺信息改为计算属性
const shopName = computed(() => sessionStorage.getItem('shopName') || '我的店铺')
const shopLogo = computed(() => sessionStorage.getItem('shopLogo') || '')

// 提供全局更新店铺信息的方法
const updateShopInfo = () => {
  // 使用计算属性后不需要明确更新，但可以触发组件刷新
  // 触发sessionStorage的变化，计算属性会自动响应
  // console.log('Shop info updated:', shopName.value, shopLogo.value)
}

// 挂载到全局，供其他组件调用
window.updateShopInfo = updateShopInfo

// 消息通知
const unreadCount = computed(() => notifications.value.length)
const notificationDrawerVisible = ref(false)

// SSE 相关
let eventSource = null
let reconnectTimer = null
let isConnecting = ref(false)
let isFirstInteraction = ref(true)

// 音频相关
let notificationSound = null
let isAudioInitialized = ref(false)

// 底部导航标签
const tabs = [
  { 
    path: '/m/shop', 
    title: 'mobile.tabs.shop',
    icon: 'Shop'
  },
  { 
    path: '/m/products', 
    title: 'mobile.tabs.products',
    icon: 'Goods'
  },
  { 
    path: '/m/orders', 
    title: 'mobile.tabs.orders',
    icon: 'Document'
  },
  { 
    path: '/m/profile', 
    title: 'mobile.tabs.profile',
    icon: 'User'
  }
]

// 当前活动标签
const activeTab = ref('/m/shop')

// 判断当前是否为店铺页面
const isShopPage = computed(() => {
  return route.path === '/m/shop' || route.path === '/m' 
})

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    // 找到匹配的标签
    const matchedTab = tabs.find(tab => newPath.startsWith(tab.path))
    if (matchedTab) {
      activeTab.value = matchedTab.path
    }
  },
  { immediate: true }
)

// 切换标签
const switchTab = (path) => {
  if (path !== route.path) {
    router.push(path)
  }
}

// 初始化音频
const initAudio = () => {
  return new Promise((resolve) => {
    try {
      notificationSound = new Howl({
        src: ['/voice/xm3463.mp3'],
        preload: true,
        volume: 0.5,
        onload: () => {
          isAudioInitialized.value = true
          resolve()
        },
        onloaderror: (id, error) => {
          // console.error('音频加载失败:', error)
          resolve()
        }
      })
    } catch (error) {
      // console.error('音频初始化失败:', error)
      resolve()
    }
  })
}

// 播放提示音
const playNotificationSound = () => {
  if (!isAudioInitialized.value) {
    return
  }
  
  try {
    notificationSound.play()
  } catch (error) {
    // console.error('播放提示音失败:', error)
  }
}

// 播放多条消息的提示音
const playMultipleNotificationSounds = async (messages) => {
  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    playNotificationSound()
    showNotificationMessage(message)
    
    // 如果不是最后一条消息，等待1秒
    if (i < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

// 显示新消息提示
const showNotificationMessage = (message) => {
  ElMessage({
    message: message.content == 0 ? t('common.newOrderContent') : t('common.refundRequestContent'),
    type: message.content == 0 ? 'success' : 'error',
    duration: 3000,
    showClose: false,
    customClass: 'notification-message',
    icon: 'Bell'
  })
}

// 初始化 SSE 连接
const initSSE = () => {
  try {
    const userId = sessionStorage.getItem('userId')
    
    if (!userId) {
      // console.error('未找到用户ID')
      return
    }

    if (eventSource) {
      eventSource.close()
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer)
    }

    const url = `/api/sse/connect/${userId}`
    
    try {
      eventSource = new EventSource(url)
      
      if (!eventSource) {
        throw new Error('EventSource 创建失败')
      }

      eventSource.onopen = () => {
        isConnecting.value = false
        removeUserInteractionListeners()
      }
      
      eventSource.onmessage = async (event) => {
        try {
          const data = JSON.parse(event.data)
          
          if(data.code === '401') {
            sessionStorage.clear()
            eventSource.close()
            ElMessage.error(t('common.auth.unauthorized'))
            window.location.href = '/login'
            return
          }

          //去掉已存在的消息
          const newMessages = data.filter(item => {
            const storeMessages = messageStore.messages
            // console.log('storeMessages', storeMessages)
            return !storeMessages.some(n => n.id == item.id)
          })
          // console.log('newMessages', newMessages)
          if (newMessages.length > 0) {

            newMessages.forEach(item => {
              messageStore.addMessage({
                id: item.id,
                title: item.title,
                content: item.content,
                time: item.createdAt,
                unread: true
              })
            })
            // messageStore.addMessage(...newMessages.map(item => ({
            //   id: item.id,
            //   title: item.title == 0 ? t('common.newOrder') : t('common.refundRequest'),
            //   content: item.content == 0 ? t('common.newOrderContent') : t('common.refundRequestContent'),
            //   time: t('common.justNow'),
            //   unread: true
            // })))
            

            // 更新待处理订单数量
            getPendingOrderCountData()
            
            // 播放提示音
            playMultipleNotificationSounds(newMessages)
            
            // 显示消息通知
            // newMessages.forEach(message => {
            //   showNotificationMessage(message)
            // })
          }
        } catch (error) {
          // console.error('解析消息失败:', error)
        }
      }

      eventSource.onerror = (error) => {
        // console.error('SSE 连接错误:', error)
        if (eventSource) {
          eventSource.close()
        }
        isConnecting.value = true
        reconnectTimer = setTimeout(() => {
          initSSE()
        }, 3000)
      }
    } catch (error) {
      // console.error('创建 EventSource 失败:', error)
      if (!isConnecting.value) {
        isConnecting.value = true
        reconnectTimer = setTimeout(() => {
          initSSE()
        }, 3000)
      }
    }
  } catch (error) {
    // console.error('初始化 SSE 连接失败:', error)
    if (!isConnecting.value) {
      isConnecting.value = true
      reconnectTimer = setTimeout(() => {
        initSSE()
      }, 3000)
    }
  }
}

// 处理用户交互
const handleUserInteraction = async () => {
  if (isFirstInteraction.value) {
    isFirstInteraction.value = false
    initSSE()
    removeUserInteractionListeners()
  }
}

// 移除所有用户交互事件监听
const removeUserInteractionListeners = () => {
  document.removeEventListener('click', handleUserInteraction)
  document.removeEventListener('touchstart', handleUserInteraction)
}

// 处理消息通知点击
const handleNotificationClick = () => {
  notificationDrawerVisible.value = true
}

//根据messageStore.messages生成notifications
const notifications = computed(() => {
    const notifications = messageStore.messages.map(item => ({
      id: item.id,
      title: item.title == 0 ? t('common.newOrder') : t('common.refundRequest'),
      content: item.content == 0 ? t('common.newOrderContent') : t('common.refundRequestContent'),
      time: item.time,
    }))
  return notifications
})

// 待处理订单数量
const getPendingOrderCountData = () => {
  const params = {
    shopId: sessionStorage.getItem('shopId')
  }
  getPendingOrderCount(params).then(res => {
    orderStore.updatePendingOrderCount(res.data)
  })
}

// 标记消息为已读
const markAsRead = (id) => {
  const data = {
    ids: [id]
  }
  updateMessageStatus(data).then(res => {
    if(res.code === 0) {
      messageStore.removeMessage(id)
      // 如果没有未读消息了，关闭抽屉
      if (notifications.value.length === 0) {
        notificationDrawerVisible.value = false
      }
      // 更新待处理订单数量
      getPendingOrderCountData()
    }
  })
}

// 处理客服点击
const handleCustomerService = () => {
  const userInfo = {
    uid: sessionStorage.getItem('shopId'),
    name: sessionStorage.getItem('shopName'),
    email: sessionStorage.getItem('userId'),
  }
  const userInfoStr = encodeURIComponent(JSON.stringify(userInfo))
  window.open(`https://qptkyyb.hjmckjwosnqjry.top/index?key=c5da9e9a97eab000f608f44c8f2fa996&gid=801104f71e7812dfed530fd8f58effbd&userInfo=${userInfoStr}`, '_blank')
}

// 待处理订单数量
const pendingOrderCount = computed(() => orderStore.pendingOrderCount)

// 组件挂载后初始化
onMounted(async () => {
  // 先初始化音频
  await initAudio()
  
  // 添加用户交互监听器，用于延迟SSE连接
  document.addEventListener('click', handleUserInteraction)
  document.addEventListener('touchstart', handleUserInteraction)
  
  // 获取待处理订单数量
  getPendingOrderCountData()

  // 添加 SSE 事件监听
  // const eventSource = new EventSource('/api/sse')
  // eventSource.addEventListener('message', handleSSEMessage)
})

// 组件卸载时清理
onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
  }
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
  }
  if (notificationSound) {
    notificationSound.unload()
  }
  removeUserInteractionListeners()
})
</script>

<style scoped>
.mobile-layout {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
}

/* 头部样式 */
.shop-header {
  padding: 0;
  margin: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  color: #303133;
  width: 100vw;
  max-width: 100vw;
  box-sizing: border-box;
  position: sticky;
  top: 0;
  left: 0;
  z-index: 101;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  position: relative;
  height: 50px;
}

.shop-info {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  z-index: 1;
}

.shop-name {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
  width: 100%;
}

.header-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 20px;
  height: 40px;
  padding-right: 16px;
  width: auto;
  min-width: 90px;
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 2;
}

.action-icon {
  font-size: 22px;
  color: #303133;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.notification-badge {
  position: relative;
}

.notification-badge :deep(.el-badge__content) {
  position: absolute !important;
  top: -6px !important;
  right: -8px !important;
  transform: scale(0.9) !important;
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 70px;
  background-color: #f5f7fa;
  margin-top: 0;
  width: 100%;
  box-sizing: border-box;
}

.mobile-tabbar {
  height: 56px;
  display: flex;
  background-color: #ffffff;
  border-top: 1px solid #e6e6e6;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
  position: relative;
}

.tab-item.active {
  color: #409EFF;
}

.tab-icon-container {
  position: relative;
  display: flex;
  justify-content: center;
  margin-bottom: 2px;
}

.tab-item .el-icon {
  font-size: 20px;
}

.tab-badge {
  position: absolute;
  top: -3px;
  right: -8px;
}

.tab-badge :deep(.el-badge__content) {
  transform: scale(0.8);
  height: 16px;
  padding: 0 4px;
  line-height: 16px;
  font-size: 12px;
  min-width: 16px;
}

.tab-label {
  font-size: 12px;
  line-height: 1.2;
}

/* 通知样式 */
.notification-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.notification-title {
  font-weight: bold;
  color: #303133;
}

.notification-count {
  color: #909399;
  font-size: 12px;
}

.notification-list {
  padding: 0 16px;
}

.notification-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  width: 100%;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: left;
  width: 100%;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  text-align: left;
}

.notification-desc {
  font-size: 12px;
  color: #606266;
  text-align: left;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  text-align: left;
}

.empty-notification {
  padding: 40px 0;
}

.notification-message {
  font-size: 12px !important;
  background: #ecf5ff !important;
  border: 1px solid #d9ecff !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1) !important;
  border-radius: 8px !important;
  padding: 12px 16px !important;
  min-width: 80% !important;
  max-width: 90% !important;
  margin: 0 auto !important;
  z-index: 2001 !important;
}

.notification-message :deep(.el-message__content) {
  color: #303133 !important;
  font-size: 12px !important;
  line-height: 1.5 !important;
  white-space: normal !important;
  word-break: break-word !important;
}

.notification-message :deep(.el-message__icon) {
  font-size: 14px !important;
  color: #409EFF !important;
}
</style> 
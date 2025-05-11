<script setup>
import { ref, reactive, watch, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { getPendingOrderCount } from '@/api/order'
import { Howl } from 'howler'
import { useOrderStore } from '@/stores/order'
import { ElMessage } from 'element-plus'
import { updateMessageStatus, updatePassword } from '@/api/mainLayout'
import { 
  Headset,
  ArrowDown
} from '@element-plus/icons-vue'
import 'flag-icons/css/flag-icons.min.css'
import { useMessageStore } from '@/stores/message'

const messageStore = useMessageStore()

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const isCollapse = ref(false)

// 消息通知相关数据
const notifications = computed(() => {
    const notifications = messageStore.messages.map(item => ({
      id: item.id,
      title: item.title == 0 ? t('common.newOrder') : t('common.refundRequest'),
      content: item.content == 0 ? t('common.newOrderContent') : t('common.refundRequestContent'),
      time: item.time,
    }))
    // console.log('notifications', notifications)
  return notifications
})

// 店铺logo计算属性，从sessionStorage获取，如果不存在则使用默认值
const shopLogo = computed(() => {
  const logo = sessionStorage.getItem('shopLogo')
  console.log
  return logo || '/shopLogo.jpg'
})

const openCustomerService = () => {
  const userInfo = {
    uid: sessionStorage.getItem('shopId'),
    name: sessionStorage.getItem('shopName'),
    email: sessionStorage.getItem('userId'),
  }
  const userInfoStr = encodeURIComponent(JSON.stringify(userInfo))
  window.open(`https://qptkyyb.hjmckjwosnqjry.top/index?key=c5da9e9a97eab000f608f44c8f2fa996&gid=801104f71e7812dfed530fd8f58effbd&userInfo=${userInfoStr}`, '_blank')
}


// tab相关数据和方法
const tabs = ref([
  {
    title: t('menu.dashboard'),
    path: '/dashboard',
    name: 'dashboard'
  }
])
const activeTab = ref('/dashboard')

// 获取标签页标题
const getTabTitle = (path) => {
  const currentRoute = router.resolve(path)
  if (currentRoute.meta?.title) {
    return t(currentRoute.meta.title)
  }
  
  const key = path.split('/').filter(Boolean).pop()
  if (path.includes('/products/')) {
    switch (key) {
      case 'list':
        return t('menu.shopProducts')
      case 'refunds':
        return t('menu.refundRequests')
      case 'reviews':
        return t('menu.productReviews')
      case 'warehouse':
        return t('menu.productWarehouse')
      default:
        return t(`menu.${key}`)
    }
  }
  return t(`menu.${key}`)
}

// 添加新标签页
const addTab = (route) => {
  const { path, name } = route
  const isExist = tabs.value.some(tab => tab.path === path)
  if (!isExist) {
    tabs.value.push({
      title: getTabTitle(path),
      path,
      name
    })
  }
  activeTab.value = path
}

// 关闭标签页
const removeTab = (targetPath) => {
  const tabsList = tabs.value
  let activePath = activeTab.value
  if (activePath === targetPath) {
    tabsList.forEach((tab, index) => {
      if (tab.path === targetPath) {
        const nextTab = tabsList[index + 1] || tabsList[index - 1]
        if (nextTab) {
          activePath = nextTab.path
        }
      }
    })
  }
  tabs.value = tabsList.filter(tab => tab.path !== targetPath)
  if (activePath) {
    router.push(activePath)
  }
}

// 切换标签页
const switchTab = (path) => {
  activeTab.value = path
  router.push(path)
}

// 监听语言变化，更新标签页标题
watch(
  () => locale.value,
  () => {
    tabs.value = tabs.value.map(tab => ({
      ...tab,
      title: getTabTitle(tab.path)
    }))
  }
)

//监听语言变化
// watch(
//   () => locale.value,
//   () => {
//     console.log(messageStore.messages)
//     notifications.value = messageStore.messages.map(item => ({
//       id: item.id,
//       title: item.title == 0 ? t('common.newOrder') : t('common.refundRequest'),
//       content: item.content == 0 ? t('common.newOrderContent') : t('common.refundRequestContent'),
//       time: item.time,
//       unread: item.unread
//     }))
//   }
// )

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    if (newPath !== activeTab.value) {
      addTab(route)
    }
  },
  { immediate: true }
)

const handleLogout = () => {
  sessionStorage.clear()
  router.push('/login')
}

const userInfo = reactive({
  shopName: sessionStorage.getItem('shopName'),
  shopId: sessionStorage.getItem('shopId'),
  userId: sessionStorage.getItem('userId')
})

const languages = [
  {
    label: '简体中文',
    value: 'zh-CN',
    flag: 'cn'
  },
  {
    label: 'English',
    value: 'en-US',
    flag: 'us'
  },
  {
    label: 'Tiếng Việt',
    value: 'vi-VN',
    flag: 'vn'
  },
  {
    label: 'ภาษาไทย',
    value: 'th-TH',
    flag: 'th'
  },
  {
    label: 'Filipino',
    value: 'tl-PH',
    flag: 'ph'
  },
  {
    label: 'Bahasa Melayu',
    value: 'ms-MY',
    flag: 'my'
  },
  {
    label: 'Русский',
    value: 'ru-RU',
    flag: 'ru'
  },
  {
    label: 'Bahasa Indonesia',
    value: 'id-ID',
    flag: 'id'
  },
  {
    label: '日本語',
    value: 'ja-JP',
    flag: 'jp'
  },
  {
    label: '한국어',
    value: 'ko-KR',
    flag: 'kr'
  },
  {
    label: 'Français',
    value: 'fr-FR',
    flag: 'fr'
  },
  {
    label: 'Deutsch',
    value: 'de-DE',
    flag: 'de'
  }
]

// 当前语言信息的计算属性
const currentLanguage = computed(() => {
  return languages.find(lang => lang.value === locale.value) || { 
    label: 'Language', 
    flag: '🌐',
    value: 'en-US'
  }
})

const orderStore = useOrderStore()
const pendingOrderCount = computed(() => orderStore.pendingOrderCount)

// 待处理订单数量
const getPendingOrderCountData = () => {
  const params = {
    shopId: sessionStorage.getItem('shopId')
  }
  getPendingOrderCount(params).then(res => {
    orderStore.updatePendingOrderCount(res.data)
  })
}

// SSE 相关
let eventSource = null
let reconnectTimer = null
let isConnecting = ref(false)

// 音频相关
let notificationSound = null
let isAudioInitialized = ref(false)
let isFirstInteraction = ref(true)

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
    showNotificationDialog(message)
    
    // 如果不是最后一条消息，等待1秒
    if (i < messages.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}

// 移除所有用户交互事件监听
const removeUserInteractionListeners = () => {
  document.removeEventListener('click', handleUserInteraction)
  document.removeEventListener('keydown', handleUserInteraction)
  document.removeEventListener('scroll', handleUserInteraction)
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
            // 更新待处理订单数量
            getPendingOrderCountData()
            
            await playMultipleNotificationSounds(newMessages)
            
            // newMessages.forEach(message => {
            //   showNotificationDialog(message)
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
  }
}

// 组件挂载时初始化
onMounted(() => {
  try {
    orderStore.updatePendingOrderCount()
    initAudio()
    document.addEventListener('click', handleUserInteraction)
    document.addEventListener('keydown', handleUserInteraction)
    document.addEventListener('scroll', handleUserInteraction)
  } catch (error) {
    // console.error('初始化失败:', error)
  }
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


const unreadCount = computed(() => notifications.value.length)

// 显示新消息弹窗
const showNotificationDialog = (message) => {
  // console.log(message)

  ElMessage({
    message: message.content == 0 ? t('common.newOrderContent') : t('common.refundRequestContent'),
    type: message.content == 0 ? 'success' : 'error',
    duration: 3000,
    showClose: true,
    customClass: 'notification-message',
    icon: 'Bell'
  })
}

// 移除消息
const removeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id)
}

// 标记消息为已读
const markAsRead = (id) => {
  const data = {
    ids: [id]
  }
  updateMessageStatus(data).then(res => {
    if(res.code === 0) {
      notifications.value = notifications.value.filter(n => n.id !== id)
      messageStore.messages = messageStore.messages.filter(n => n.id !== id)
      // 检查是否还有未读消息
      if (notifications.value.length == 0) {
      // 如果没有未读消息了，关闭下拉菜单
      const dropdown = document.querySelector('.el-dropdown')
      if (dropdown) {
          dropdown.click()
        }
      }
      // 更新待处理订单数量
      getPendingOrderCountData()
    }
  })
}

// 修改密码相关数据
const passwordDialogVisible = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error(t('user.passwordMismatch')))
  } else {
    callback()
  }
}

const passwordRules = computed(() => ({
  oldPassword: [
    { required: true, message: t('user.oldPassword') + t('common.required'), trigger: 'blur' },
    { min: 6, max: 20, message: t('user.passwordLengthError'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('user.newPassword') + t('common.required'), trigger: 'blur' },
    { min: 6, max: 20, message: t('user.passwordLengthError'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('user.confirmPassword') + t('common.required'), trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}))
const passwordFormRef = ref(null)
const passwordLoading = ref(false)

// 修改支付密码相关数据
const fundPasswordDialogVisible = ref(false)
const fundPasswordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证确认支付密码与新支付密码是否一致
const validateConfirmFundPassword = (rule, value, callback) => {
  if (value !== fundPasswordForm.newPassword) {
    callback(new Error(t('user.passwordMismatch')))
  } else {
    callback()
  }
}

const fundPasswordRules = computed(() => ({
  oldPassword: [
    { required: true, message: t('user.oldFundPassword') + t('common.required'), trigger: 'blur' },
    { pattern: /^\d{6}$/, message: t('user.fundPasswordLengthError'), trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: t('user.newFundPassword') + t('common.required'), trigger: 'blur' },
    { pattern: /^\d{6}$/, message: t('user.fundPasswordLengthError'), trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: t('user.confirmFundPassword') + t('common.required'), trigger: 'blur' },
    { pattern: /^\d{6}$/, message: t('user.fundPasswordLengthError'), trigger: 'blur' },
    { validator: validateConfirmFundPassword, trigger: 'blur' }
  ]
}))
const fundPasswordFormRef = ref(null)
const fundPasswordLoading = ref(false)

// 打开修改密码对话框
const openChangePasswordDialog = () => {
  passwordForm.oldPassword = ''
  passwordForm.newPassword = ''
  passwordForm.confirmPassword = ''
  passwordDialogVisible.value = true
}

// 打开修改支付密码对话框
const openChangeFundPasswordDialog = () => {
  fundPasswordForm.oldPassword = ''
  fundPasswordForm.newPassword = ''
  fundPasswordForm.confirmPassword = ''
  fundPasswordDialogVisible.value = true
}

// 提交修改密码
const submitChangePassword = async () => {
  if (passwordFormRef.value) {
    await passwordFormRef.value.validate(async (valid) => {
      if (valid) {
        passwordLoading.value = true
        try {
          const data = {
            userId: sessionStorage.getItem('userId'),
            password: btoa(passwordForm.oldPassword),
            newPwd: btoa(passwordForm.newPassword)
          }
          updatePassword(data).then(res => {
            if (res.code === 0) {
              ElMessage.success(t('user.passwordChanged'))
              passwordDialogVisible.value = false
              
              // 密码修改成功后延迟一秒跳转到登录页
              setTimeout(() => {
                ElMessage.info(t('user.reloginRequired'))
                handleLogout()
              }, 1000)
            } else if (res.code === -1) {
              ElMessage.error(t('user.passwordError'))
            } else {
              ElMessage.error(res.message || t('common.error'))
            }
          })
        } catch (error) {
          // console.error('修改密码失败:', error)
          ElMessage.error(t('common.error'))
        } finally {
          passwordLoading.value = false
        }
      }
    })
  }
}

// 提交修改支付密码
const submitChangeFundPassword = async () => {
  if (fundPasswordFormRef.value) {
    await fundPasswordFormRef.value.validate(async (valid) => {
      if (valid) {
        fundPasswordLoading.value = true
        try {
          const data = {
            userId: sessionStorage.getItem('userId'),
            fundPassword: btoa(fundPasswordForm.oldPassword),
            newPwd: btoa(fundPasswordForm.newPassword)
          }
          updatePassword(data).then(res => {
            if (res.code === 0) {
              ElMessage.success(t('user.fundPasswordChanged'))
              fundPasswordDialogVisible.value = false
            } else if (res.code === -1) {
              ElMessage.error(t('user.fundPasswordError'))
            } else {
              ElMessage.error(res.message || t('common.error'))
            }
          })
        } catch (error) {
          // console.error('修改支付密码失败:', error)
          ElMessage.error(t('common.error'))
        } finally {
          fundPasswordLoading.value = false
        }
      }
    })
  }
}

// 修改语言选择处理
const handleLocaleChange = (lang) => {
  locale.value = lang;
  localStorage.setItem('language', lang);
}

</script>

<template>
  <div class="layout-container">
    <!-- 左侧菜单 -->
    <div class="sidebar">
      <!-- 顶部图标 -->
      <div class="logo-container">
        <div class="logo-content">
          <el-avatar class="logo" :class="{ 'collapsed': isCollapse }" size="large" shape="circle" :src="shopLogo"></el-avatar>
          <p class="logo-username" v-show="!isCollapse">{{userInfo.shopName}}</p>
          <p class="logo-shopId" v-show="!isCollapse">{{ t('common.shopId') }}：{{userInfo.shopId}}</p>
        </div>
      </div>
      
      <el-menu
        class="sidebar-menu"
        :collapse="isCollapse"
        background-color="#ffffff"
        text-color="#303133"
        active-text-color="#409EFF"
        :default-active="$route.path"
        router
      >
        <el-menu-item index="/dashboard">
          <el-icon><DataLine /></el-icon>
          <template #title>{{ t('menu.dashboard') }}</template>
        </el-menu-item>

        <el-menu-item index="/orders">
          <el-icon><ShoppingCart /></el-icon>
          <template #title>
            <div class="menu-item-content">
              <span>{{ t('menu.orders') }}</span>
              <el-badge v-if="pendingOrderCount > 0" :value="pendingOrderCount" :max="99" />
            </div>
          </template>
        </el-menu-item>

        <el-menu-item index="/finance">
          <el-icon><TrendCharts /></el-icon>
          <template #title>{{ t('menu.finance') }}</template>
        </el-menu-item>

        <el-menu-item index="/wallet">
          <el-icon><Wallet /></el-icon>
          <template #title>{{ t('menu.wallet') }}</template>
        </el-menu-item>

        <el-menu-item index="/transactions">
          <el-icon><Money /></el-icon>
          <template #title>{{ t('menu.transactions') }}</template>
        </el-menu-item>

        <el-sub-menu index="/products">
          <template #title>
            <el-icon><Goods /></el-icon>
            <span>{{ t('menu.products') }}</span>
          </template>
          
          <el-menu-item index="/products/list">
            <el-icon><Shop /></el-icon>
            <template #title>{{ t('menu.shopProducts') }}</template>
          </el-menu-item>
          
          <el-menu-item index="/products/warehouse">
            <el-icon><Box /></el-icon>
            <template #title>{{ t('menu.productWarehouse') }}</template>
          </el-menu-item>
          
          <el-menu-item index="/products/refunds">
            <el-icon><RefreshRight /></el-icon>
            <template #title>{{ t('menu.refundRequests') }}</template>
          </el-menu-item>
          
          <el-menu-item index="/products/reviews">
            <el-icon><ChatDotRound /></el-icon>
            <template #title>{{ t('menu.productReviews') }}</template>
          </el-menu-item>
        </el-sub-menu>

        <el-sub-menu index="/marketing">
          <template #title>
            <el-icon><Present /></el-icon>
            <span>{{ t('menu.marketing') }}</span>
          </template>
          
          <el-menu-item index="/marketing/shop-express">
            <el-icon><Promotion /></el-icon>
            <template #title>{{ t('menu.shopExpress') }}</template>
          </el-menu-item>
          
          <el-menu-item index="/marketing/purchase-history">
            <el-icon><List /></el-icon>
            <template #title>{{ t('menu.purchaseHistory') }}</template>
          </el-menu-item>
          
          <!-- <el-menu-item index="/marketing/seller-level">
            <el-icon><Medal /></el-icon>
            <template #title>{{ t('menu.sellerLevel') }}</template>
          </el-menu-item> -->
        </el-sub-menu>

        <el-sub-menu index="/settings">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>{{ t('menu.settings') }}</span>
          </template>
          
          <el-menu-item index="/settings/shop">
            <el-icon><Shop /></el-icon>
            <template #title>{{ t('menu.shopSettings') }}</template>
          </el-menu-item>
        </el-sub-menu>
      </el-menu>
    </div>

    <!-- 右侧内容区 -->
    <div class="main-container">
      <!-- 顶部导航 -->
      <div class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapse = !isCollapse">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb>
            <el-breadcrumb-item>{{ t('menu.dashboard') }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click" :hide-on-click="false">
            <div class="message-icon">
              <el-badge :value="unreadCount" :max="99" class="message-badge">
                <el-icon size="20"><Bell /></el-icon>
              </el-badge>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="notification-dropdown">
                <div class="notification-header">
                  <span>{{ t('common.orderNotifications') }}</span>
                  <span class="notification-count">{{ unreadCount }} {{ t('common.unreadCount') }}</span>
                </div>
                <el-scrollbar max-height="300px">
                  <el-dropdown-item v-for="notice in notifications" :key="notice.id" class="notification-item" @click="markAsRead(notice.id)">
                    <div class="notification-content">
                      <div class="notification-title">{{ notice.title }}</div>
                      <div class="notification-desc">{{ notice.content }}</div>
                      <div class="notification-time">{{ notice.time }}</div>
                    </div>
                  </el-dropdown-item>
                </el-scrollbar>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <el-divider direction="vertical" />
          <div class="lang-switch-container">
            <el-dropdown class="language-select" trigger="click" @command="handleLocaleChange">
              <div class="language-select__wrapper">
                <span :class="`fi fi-${currentLanguage.flag}`"></span>
                <span class="language-select__text">{{ currentLanguage.label }}</span>
                <el-icon class="el-icon--right">
                  <arrow-down />
                </el-icon>
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item v-for="item in languages" :key="item.value" :command="item.value">
                    <span :class="`fi fi-${item.flag}`"></span>
                    <span class="language-select__text">{{ item.label }}</span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <el-divider direction="vertical" />
          <el-dropdown>
            <span class="user-dropdown">
              {{userInfo.userId}}
              <el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="openChangePasswordDialog">
                  {{ t('user.changePassword') }}
                </el-dropdown-item>
                <el-dropdown-item @click="openChangeFundPasswordDialog">
                  {{ t('user.changeFundPassword') }}
                </el-dropdown-item>
                <el-dropdown-item @click="handleLogout">
                  {{ t('common.logout') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 标签页导航 -->
      <div class="tabs-container">
        <el-tabs
          v-model="activeTab"
          type="card"
          @tab-click="(tab) => switchTab(tab.props.name)"
        >
          <el-tab-pane
            v-for="tab in tabs"
            :key="tab.path"
            :label="tab.title"
            :name="tab.path"
          >
            <template #label>
              <span>{{ tab.title }}</span>
              <el-icon 
                v-if="tab.path !== '/dashboard'" 
                class="tab-close" 
                @click.stop="removeTab(tab.path)"
              >
                <Close />
              </el-icon>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 主要内容区 -->
      <div class="main-content">
        <router-view :key="$route.fullPath"></router-view>
      </div>
    </div>
  </div>

  <!-- 修改密码对话框 -->
  <el-dialog v-model="passwordDialogVisible" :title="t('user.changePassword')" width="400px">
    <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-position="top" label-width="auto">
      <el-form-item :label="t('user.oldPassword')" prop="oldPassword">
        <el-input v-model="passwordForm.oldPassword" type="password" show-password />
      </el-form-item>
      <el-form-item :label="t('user.newPassword')" prop="newPassword">
        <el-input v-model="passwordForm.newPassword" type="password" show-password />
      </el-form-item>
      <el-form-item :label="t('user.confirmPassword')" prop="confirmPassword">
        <el-input v-model="passwordForm.confirmPassword" type="password" show-password />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="passwordDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitChangePassword" :loading="passwordLoading">
          {{ t('common.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 修改支付密码对话框 -->
  <el-dialog v-model="fundPasswordDialogVisible" :title="t('user.changeFundPassword')" width="400px">
    <el-form :model="fundPasswordForm" :rules="fundPasswordRules" ref="fundPasswordFormRef" label-position="top" label-width="auto">
      <el-form-item :label="t('user.oldFundPassword')" prop="oldPassword">
        <el-input v-model="fundPasswordForm.oldPassword" type="password" show-password maxlength="6" />
      </el-form-item>
      <el-form-item :label="t('user.newFundPassword')" prop="newPassword">
        <el-input v-model="fundPasswordForm.newPassword" type="password" show-password maxlength="6" />
      </el-form-item>
      <el-form-item :label="t('user.confirmFundPassword')" prop="confirmPassword">
        <el-input v-model="fundPasswordForm.confirmPassword" type="password" show-password maxlength="6" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="fundPasswordDialogVisible = false">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitChangeFundPassword" :loading="fundPasswordLoading">
          {{ t('common.confirm') }}
        </el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 右下角客服图标 -->
  <div class="customer-service-icon" @click="openCustomerService">
    <el-icon><Headset /></el-icon>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100%;
  width: 100%;
  background-color: #ffffff;
}

.sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e6e6e6;
  background-color: #ffffff;
}

.sidebar-menu {
  flex: 1;
  width: auto;
  border-right: none;
  background-color: #ffffff;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

.logo-container {
  height: 200px;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
}

.logo-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.logo {
  height: 64px;
  width: 64px;
  transition: all 0.3s;
}

.logo.collapsed {
  height: 32px;
  width: 32px;
  margin: 16px 0;
}

.logo-username {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  margin: 0;
}
.logo-shopId {
  font-size: 12px;
  font-weight: 600;
  color: #7a7777;
  white-space: nowrap;
  margin: 0;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.header {
  height: 64px;
  background: #fff;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e6e6e6;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.collapse-btn {
  font-size: 24px;
  color: #303133;
  cursor: pointer;
  padding: 12px;
  border-radius: 4px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
}

.collapse-btn:hover {
  background-color: #f5f7fa;
  color: #409EFF;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.lang-switch-container {
  position: relative;
}

.selected-language {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.selected-language:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.language-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  padding: 8px;
}

.language-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.language-item:hover {
  background-color: #f5f7fa;
}

.language-item.active-language {
  background-color: #e3f2fd;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #303133;
}

.tabs-container {
  padding: 6px 4px 0;
  background-color: #ffffff;
  border-bottom: 1px solid #e6e6e6;
}

.tab-close {
  margin-left: 5px;
  width: 16px;
  height: 16px;
  font-size: 12px;
  border-radius: 50%;
  transition: all 0.3s;
}

.tab-close:hover {
  background-color: #c0c4cc;
  color: #fff;
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow: auto;
  background-color: #f5f7fa;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
  color: #303133;
}

:deep(.el-menu-item.is-active) {
  background-color: #ecf5ff !important;
  color: #409EFF !important;
  border-right: 2px solid #409EFF;
}

:deep(.el-menu-item:hover) {
  background-color: #f5f7fa !important;
  color: #409EFF !important;
}

:deep(.el-menu--collapse) {
  width: 64px;
}

:deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

:deep(.el-divider--vertical) {
  height: 20px;
  margin: 0 12px;
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav) {
  border: none !important;
}

:deep(.el-tabs__item) {
  height: 40px;
  line-height: 40px;
  border: none !important;
  background-color: transparent !important;
  transition: all 0.3s;
}

:deep(.el-tabs__item.is-active) {
  background-color: #f5f7fa !important;
  border-bottom: 2px solid #409EFF !important;
}

:deep(.el-tabs__item:hover) {
  color: #409EFF;
}
button:focus {
          outline: none;
      }

.active-language {
  background-color: #ecf5ff !important;
  color: #409EFF !important;
  font-weight: bold;
}

.menu-item-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}

:deep(.el-badge__content) {
  position: static !important;
  transform: none !important;
  border: none;
  height: 16px;
  padding: 0 4px;
  line-height: 16px;
  font-size: 12px;
  background-color: #f56c6c;
  margin-top: -2px;
  min-width: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-icon {
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s;
  position: relative;
}

.message-badge :deep(.el-badge__content) {
  position: absolute !important;
  top: 0;
  right: 0;
  transform: translateY(-50%) translateX(50%) !important;
}

.notification-dropdown {
  width: 300px;
  padding: 0;
}

.notification-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.notification-count {
  color: #909399;
  font-size: 12px;
}

.notification-item {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  pointer-events: auto;
}

.notification-item:hover {
  background-color: #f5f7fa;
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-title {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
}

.notification-desc {
  font-size: 12px;
  color: #606266;
}

.notification-time {
  font-size: 12px;
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.dialog-footer .el-button {
  min-width: 120px;
}

.notification-message {
  background: #ecf5ff !important;
  border: 1px solid #d9ecff !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1) !important;
  border-radius: 8px !important;
  padding: 12px 16px !important;
  min-width: 300px !important;
  max-width: 400px !important;
}

.notification-message :deep(.el-message__content) {
  color: #303133 !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
}

.notification-message :deep(.el-message__icon) {
  font-size: 16px !important;
  color: #409EFF !important;
}

.notification-message :deep(.el-message__closeBtn) {
  color: #909399 !important;
  font-size: 14px !important;
}

.notification-message :deep(.el-message__closeBtn:hover) {
  color: #409EFF !important;
}

/* 客服图标样式 */
.customer-service-icon {
  position: fixed;
  right: 20px;
  bottom: 20px;
  width: 50px;
  height: 50px;
  background-color: #409EFF;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 2000;
  transition: all 0.3s;
}

.customer-service-icon:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

.customer-service-icon .el-icon {
  font-size: 24px;
}

.language-select {
  cursor: pointer;
  
  &__wrapper {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 8px;
    height: 32px;
    border-radius: 4px;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  &__text {
    margin-left: 4px;
    font-size: 14px;
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
}

.fi {
  width: 1.2em;
  border-radius: 2px;
}

/* 表单标签靠左对齐样式 */
.form-align-left :deep(.el-form-item__label) {
  text-align: left;
  padding-left: 0;
  margin-bottom: 8px;
  font-weight: 500;
}
</style> 
<template>
  <div class="mobile-profile">
    <!-- 头部用户信息 -->
    <div class="header-info">
      <div class="header-avatar">
        <el-avatar :size="60" :src="avatar" />
        <div class="user-level">
          <div class="user-name">{{ userName }}</div>
        </div>
        <div class="user-message">
          <img src="@/assets/service.png" style="width: 40px; height: 40px;margin-right: 10px;" @click="openCustomerService">
          <div class="message-icon-wrapper" @click="showMessageList">
            <img src="@/assets/message.png" style="width: 30px; height: 30px;">
            <div v-if="unreadMessages > 0" class="message-badge">{{ unreadMessages }}</div>
          </div>
        </div>
      </div>
    </div>



    <!-- 钱包余额和累计收益 -->
    <div class="wallet-section">
      <div class="wallet-title">
        <div class="wallet-title-text" style="display: flex; align-items: center;">
          <el-icon style="margin-right: 0.5rem; color: #3B82F6; "><Money /></el-icon>
          <span style="font-size: 1rem;line-height: 1.5rem; font-weight: 500; color: #374151; ">{{ t('wallet.balance') }}</span>
        </div>
        <div class="wallet-title-button" @click="navigateTo('transactionHistory')">
              <el-icon style="margin-right: 0.5rem; color: #3B82F6; font-size: 1rem; "><RefreshLeft /></el-icon>
              <span>{{ t('menu.transactions') }}</span>
        </div>
      </div>

      <div class="wallet-money-text" style="height: 80px; display: flex; align-items: center; justify-content: center;">
          <span class="wallet-money-text-item">{{ formatMoney(wallet.balance) }}</span>
      </div>

      <div class="wallet-money-button" style="margin-top: 1rem;">
          <el-button class="wallet-money-button-item1" @click="handleDeposit">{{ t('wallet.deposit') }}</el-button>
          <el-button class="wallet-money-button-item2" @click="handleWithdraw">{{ t('wallet.withdraw') }}</el-button>
      </div>
      
      


      <!-- <el-card class="wallet-card">
        <div class="wallet-item">
          <div class="wallet-label"></div>
          <div class="wallet-value">{{ formatMoney(wallet.balance) }}</div>
          <div class="wallet-button">
            <el-button class="wallet-button-item" @click="handleDeposit">{{ t('wallet.deposit') }}</el-button>
            <el-button class="wallet-button-item" @click="handleWithdraw">{{ t('wallet.withdraw') }}</el-button>
          </div>
        </div> -->
        
      <!-- </el-card> -->

      <!-- <div class="wallet-item">
        <div class="wallet-icon"><el-icon><Money /></el-icon></div>
        <div class="wallet-label">{{ t('wallet.balance') }}</div>
        <div class="wallet-value">{{ formatMoney(wallet.balance) }}</div>
        <el-button type="primary" size="small" @click="handleDeposit">{{ t('wallet.deposit') }}</el-button>
      </div>
      <div class="divider"></div>
      <div class="wallet-item">
        <div class="wallet-icon"><el-icon><TrendCharts /></el-icon></div>
        <div class="wallet-label">{{ t('wallet.totalEarnings') }}</div>
        <div class="wallet-value">{{ formatMoney(wallet.totalEarnings) }}</div>
        <el-button type="success" size="small" @click="handleWithdraw">{{ t('wallet.withdraw') }}</el-button>
      </div> -->
    </div>

    <div class="section-divider"></div>

    <!-- 菜单项 -->
    <div class="menu-section">
      <div class="menu-item" @click="navigateTo('userInfo')">
        <div class="menu-icon">
          <img src="@/assets/profile-shop.png" style="width: 30px; height: 30px;">
        </div>
        <div class="menu-text">{{ t('menu.userInfo') }}</div>
        <div class="menu-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <div class="menu-item" @click="navigateTo('financialReports')">
        <div class="menu-icon">
          <img src="@/assets/profile-finance.png" style="width: 30px; height: 30px;">
        </div>
        <div class="menu-text">{{ t('menu.finance') }}</div>
        <div class="menu-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <!-- <div class="menu-item" @click="navigateTo('transactionHistory')">
        <div class="menu-icon">
          <i class="fa-solid fa-rocket text-blue-500 text-4xl"></i>
          <img src="@/assets/profile-order.png" style="width: 30px; height: 30px;">
        </div>
        <div class="menu-text">{{ t('menu.transactions') }}</div>
        <div class="menu-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div> -->
      
      <div class="menu-item" @click="navigateTo('paymentHistory')">
        <div class="menu-icon">
          <img src="@/assets/profile-records.png" style="width: 30px; height: 30px;">
        </div>
        <div class="menu-text">{{ t('menu.paymentHistory') }}</div>
        <div class="menu-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <div class="menu-item" @click="navigateTo('shopExpress')">
        <div class="menu-icon">
          <img src="@/assets/profile-express.png" style="width: 30px; height: 30px;">
        </div>
        <div class="menu-text">{{ t('menu.shopExpress') }}</div>
        <div class="menu-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>

      <div class="menu-item" @click="navigateTo('language')">
        <div class="menu-icon">
          <img src="@/assets/profile-language.png" style="width: 30px; height: 30px;">
        </div>
        <div class="menu-text">{{ t('menu.language') }}</div>
        <div class="menu-arrow">
          <el-icon><ArrowRight /></el-icon>
        </div>
      </div>
      
      <!-- 系统设置下拉菜单 -->
      <div class="menu-item" @click="toggleSettingsMenu">
        <div class="menu-icon">
          <img src="@/assets/profile-setting.png" style="width: 30px; height: 30px;">
        </div>
        <div class="menu-text">{{ t('menu.settings') }}</div>
        <div class="menu-arrow" :class="{ 'is-expanded': settingsExpanded }">
          <el-icon><ArrowDown /></el-icon>
        </div>
      </div>
      
      <!-- 系统设置子菜单 -->
      <div class="submenu" v-show="settingsExpanded">
        <div class="submenu-item" @click="navigateTo('changePassword')">
          <div class="submenu-icon">
            <el-icon><Lock /></el-icon>
          </div>
          <div class="submenu-text">{{ t('menu.changePassword') }}</div>
        </div>
        
        <div class="submenu-item" @click="navigateTo('changePayPassword')">
          <div class="submenu-icon">
            <el-icon><Key /></el-icon>
          </div>
          <div class="submenu-text">{{ t('menu.changePayPassword') }}</div>
        </div>
        
        <!-- <div class="submenu-item" @click="navigateTo('language')">
          <div class="submenu-icon">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="submenu-text">{{ t('menu.language') }}</div>
        </div> -->
        
        <!-- 退出登录选项 -->
        <!-- <div class="submenu-item logout-item" @click="handleLogout">
          <div class="submenu-icon">
            <el-icon><SwitchButton /></el-icon>
          </div>
          <div class="submenu-text logout-text">{{ t('common.logout') }}</div>
        </div> -->
      </div>
    </div>

    <!-- 底部对话框区域 -->
        <div class="logout-container" style="display: flex; align-items: center; justify-content: center; margin-top: 1rem;" @click="handleLogout">
          <div class="logout-icon" style="display: flex; align-items: center; justify-content: center; color: #f56c6c; cursor: pointer;">
            <el-icon><SwitchButton /></el-icon>
            <span class="logout-text" style="margin-left: 0.5rem;" >{{ t('common.logout') }}</span>
          </div>
          
        </div>
    
    <!-- 修改登录密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" :title="t('user.changePassword')" width="90%">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-position="top">
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
          <el-button @click="passwordDialogVisible = false" class="cancel-btn">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitChangePassword" :loading="passwordLoading">
            {{ t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 修改支付密码对话框 -->
    <el-dialog v-model="fundPasswordDialogVisible" :title="t('user.changeFundPassword')" width="90%">
      <el-form :model="fundPasswordForm" :rules="fundPasswordRules" ref="fundPasswordFormRef" label-position="top">
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
          <el-button @click="fundPasswordDialogVisible = false" class="cancel-btn">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitChangeFundPassword" :loading="fundPasswordLoading">
            {{ t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 语言设置对话框 -->
    <el-dialog v-model="languageDialogVisible" :title="t('menu.language')" width="90%">
      <div class="language-list">
        <div
          v-for="lang in languages"
          :key="lang.value"
          class="language-item"
          :class="{ 'active': lang.value === locale.value }"
          @click="handleLanguageChange(lang.value)"
        >
          <div class="language-flag">
            <span :class="`fi fi-${lang.flag}`"></span>
          </div>
          <div class="language-label">{{ lang.label }}</div>
          <div class="language-select" v-if="lang.value === locale.value">
            <el-icon><Check /></el-icon>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 消息列表抽屉 -->
    <el-drawer
      v-model="messageDrawerVisible"
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
import { ref, onMounted, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatMoney } from '@/utils/format'
import { getWalletBalance } from '@/api/wallet'
import { useMessageStore } from '@/stores/message'
import { updateMessageStatus } from '@/api/mainLayout'

import {
  ArrowRight,
  ArrowDown,
  Position,
  Lock,
  Key,
  ChatDotRound,
  SwitchButton,
  Check
} from '@element-plus/icons-vue'


const avatar = ref(sessionStorage.getItem('shopLogo') || '../assets/shopLogo.png')
const userName = ref(sessionStorage.getItem('shopName'))

const { t, locale } = useI18n()
const router = useRouter()

const messageStore = useMessageStore()


const openCustomerService = () => {
  const userInfo = {
    uid: sessionStorage.getItem('shopId'),
    name: sessionStorage.getItem('shopName'),
    email: sessionStorage.getItem('userId'),
  }
  const userInfoStr = encodeURIComponent(JSON.stringify(userInfo))
  window.open(`https://qptkyyb.hjmckjwosnqjry.top/index?key=c5da9e9a97eab000f608f44c8f2fa996&gid=801104f71e7812dfed530fd8f58effbd&userInfo=${userInfoStr}`, '_blank')
}


// 钱包信息
const wallet = ref({
  balance: '0.00',
  totalEarnings: '0.00',
  isFrozen: 0
})

// 控制设置菜单展开
const settingsExpanded = ref(false)

// 切换设置菜单的展开/收起状态
const toggleSettingsMenu = () => {
  settingsExpanded.value = !settingsExpanded.value
}

// 获取钱包信息
const fetchWalletInfo = () => {
  const data = {
    userId: sessionStorage.getItem('userId')
  }
  getWalletBalance(data).then(res => {
    // 确保balance是字符串类型
    wallet.value.balance = String(res.data.balance)
    wallet.value.totalEarnings = String(res.data.totalEarnings)
    wallet.value.isFrozen = res.data.isFrozen
  }).catch(err => {
    console.error('获取钱包信息失败:', err)
  })
}

// 跳转到指定页面
const navigateTo = (page) => {
  switch(page) {
    case 'userInfo':
      router.push('/m/user-info')
      break
    case 'financialReports':
      // 跳转到财务报表页面
      router.push('/m/finance')
      break
    case 'transactionHistory':
      // 跳转到资金记录页面
      router.push('/m/transactions')
      break
    case 'paymentHistory':
      // 跳转到充值提现记录页面
      router.push('/m/payment-history')
      break
    case 'shopExpress':
      // 跳转到店铺直通车页面
      router.push('/m/shop-express')
      break
    case 'changePassword':
      // 跳转到修改密码页面
      passwordDialogVisible.value = true
      break
    case 'changePayPassword':
      // 跳转到修改支付密码页面
      fundPasswordDialogVisible.value = true
      break
    case 'language':
      // 跳转到语言设置页面
      languageDialogVisible.value = true
      break
    default:
      break
  }
}

// 处理充值
const handleDeposit = () => {
  const userInfo = {
    uid: sessionStorage.getItem('shopId'),
    name: sessionStorage.getItem('shopName'),
    email: sessionStorage.getItem('userId'),
  }
  const userInfoStr = encodeURIComponent(JSON.stringify(userInfo))
  window.open(`https://qptkyyb.hjmckjwosnqjry.top/index?key=c5da9e9a97eab000f608f44c8f2fa996&gid=801104f71e7812dfed530fd8f58effbd&userInfo=${userInfoStr}`, '_blank')
}

// 处理提现
const handleWithdraw = () => {
  console.log('处理提现:', wallet.value)
  if (wallet.value.isFrozen && wallet.value.isFrozen == 1) {
    // 信誉分过低，显示提示
    ElMessageBox.confirm(
      t('wallet.accountFrozenCheck'),
      t('wallet.accountFrozen'),
      {
        confirmButtonText: t('wallet.goToHandle'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
        center: true
      }
    ).then(() => {
      
    }).catch(() => {
      // 取消操作
    })
    return
  }
  router.push('/m/withdraw')
  
}

// 处理退出登录
const handleLogout = () => {
  ElMessageBox.confirm(
    t('common.logoutConfirm'),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    // 清除会话存储
    sessionStorage.clear()
    // 跳转到移动端登录页
    router.push('/m/login')
    ElMessage.success(t('login.logoutSuccess'))
  }).catch(() => {
    // 取消退出
  })
}

// 语言设置
const languages = [
  { value: 'zh-CN', label: '简体中文', flag: 'cn' },
  { value: 'en-US', label: 'English', flag: 'us' },
  { value: 'vi-VN', label: 'Tiếng Việt', flag: 'vn' },
  { value: 'th-TH', label: 'ภาษาไทย', flag: 'th' },
  { value: 'tl-PH', label: 'Filipino', flag: 'ph' },
  { value: 'ms-MY', label: 'Bahasa Melayu', flag: 'my' },
  { value: 'ru-RU', label: 'Русский', flag: 'ru' },
  { value: 'id-ID', label: 'Bahasa Indonesia', flag: 'id' },
  { value: 'ja-JP', label: '日本語', flag: 'jp' },
  { value: 'ko-KR', label: '한국어', flag: 'kr' },
  { value: 'fr-FR', label: 'Français', flag: 'fr' },
  { value: 'de-DE', label: 'Deutsch', flag: 'de' }
]

// 语言设置对话框
const languageDialogVisible = ref(false)

// 修改密码相关数据
const passwordDialogVisible = ref(false)
const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 验证确认密码与新密码是否一致
const validateConfirmPassword = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error(t('user.passwordMismatch')))
  } else {
    callback()
  }
}

const passwordRules = {
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
}
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

const fundPasswordRules = {
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
    { validator: validateConfirmFundPassword, trigger: 'blur' }
  ]
}
const fundPasswordFormRef = ref(null)
const fundPasswordLoading = ref(false)

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
          const { updatePassword } = await import('@/api/mainLayout')
          updatePassword(data).then(res => {
            if (res.code === 0) {
              ElMessage.success(t('user.passwordChanged'))
              passwordDialogVisible.value = false
              
              // 密码修改成功后延迟一秒跳转到登录页
              setTimeout(() => {
                ElMessage.info(t('user.reloginRequired'))
                // 清除会话存储
                sessionStorage.clear()
                // 跳转到移动端登录页
                router.push('/m/login')
              }, 1000)
            } else if (res.code === -1) {
              ElMessage.error(t('user.passwordError'))
            } else {
              ElMessage.error(res.message || t('common.error'))
            }
          })
        } catch (error) {
          console.error('修改密码失败:', error)
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
          const { updateFundPassword } = await import('@/api/user')
          updateFundPassword(data).then(res => {
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
          console.error('修改支付密码失败:', error)
          ElMessage.error(t('common.error'))
        } finally {
          fundPasswordLoading.value = false
        }
      }
    })
  }
}

// 处理语言切换
const handleLanguageChange = (lang) => {
  locale.value = lang
  localStorage.setItem('language', lang)
  ElMessage.success(t('common.success'))
  languageDialogVisible.value = false
}

// 消息列表相关
const messageDrawerVisible = ref(false)

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

// 计算未读消息数量
const unreadCount = computed(() => {
  console.log('notifications.value', notifications.value)
  return notifications.value.length
})

const unreadMessages = computed(() => {
  return notifications.value.length
})


// 显示消息列表
const showMessageList = () => {
  messageDrawerVisible.value = true
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

onMounted(() => {
  fetchWalletInfo()
})
</script>

<style scoped>

.notification-content{
  display: flex;
  text-align: left;
  gap: 10px;
}

.mobile-profile {
  min-height: 100vh;
  background-color: white;
  padding: 0 0 80px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-y: auto; /* 允许垂直滚动 */
  overflow-x: hidden; /* 防止水平滚动 */
}

.header-info {
  display: flex;
  background-image: url('@/assets/header-back.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  height: 15vh;
}

.header-avatar {
  width: 100%;
  height: 70px;
  display: flex;
  margin-top: 15px;
  align-items: center;
  justify-content: flex-start;
  padding-left: 20px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #1B1464;
  margin-left: 10px;
}

.user-message{
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-left: auto;
  padding-right: 20px;
}

.wallet-card{
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to right,#2383f188, #35a9f7);
  border-radius: 20px;
  padding: 10px;
}

.wallet-title{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.wallet-title-button{
  display: flex; 
align-items: center; 
font-size: 0.875rem;
line-height: 1.25rem; 
color: #3B82F6; 
transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
transition-duration: 300ms; 
cursor: pointer; 
  :hover {
    color: #2563EB; 
  }
}

.wallet-money-text{
  padding: 1rem; 
  margin-top: 1rem; 
  border-radius: 0.75rem; 
  /* background-image: linear-gradient(to right, #EFF6FF, #e4e2f7);   */
}

.wallet-money-text-item{
  font-size: 1.875rem;
  line-height: 2.25rem; 
  font-weight: 600; 
  color: transparent; 
  -webkit-background-clip: text;
  background-image: linear-gradient(to right,#2563EB,#7C3AED);  
}

.wallet-money-button{
  display: flex;
  gap: 20px;
  justify-content: center;
  align-items: center;
}

.wallet-money-button-item1{
  width: 45%;
  display: flex; 
  padding-top: 0.75rem;
  padding-bottom: 0.75rem; 
  align-items: center; 
  border-radius: 0.5rem; 
  font-weight: 500; 
  color: #ffffff; 
  background-image: linear-gradient(to right, #3B82F6, #2563EB); 
  transition-property: box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms; 
  cursor: pointer; 
  :hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05); 
  }
}

.wallet-money-button-item2{
  display: flex; 
  padding-top: 0.75rem;
  padding-bottom: 0.75rem; 
  flex: 1 1 0%; 
  justify-content: center; 
  align-items: center; 
  border-radius: 0.5rem; 
  border-width: 1px; 
  border-color: #3B82F6; 
  font-weight: 500; 
  color: #3B82F6; 
  background-color: #ffffff; 
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms; 
  cursor: pointer; 
  :hover {
  background-color: #EFF6FF; 
  }
}


.message-icon-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  padding: 2px 6px;
  font-size: 12px;
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

/* 钱包部分 */
.wallet-section {
  overflow: hidden; 
  position: relative; 
  padding: 1.25rem; 
  margin: 1rem; 
  border-radius: 0.75rem; 
  background-color: #ffffff; 
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); 
  background-image: url('@/assets/wallet-back.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}

.wallet-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.wallet-icon {
  width: 32px;
  height: 32px;
  border-radius: 4px;
  background-color: #f0f2f5;
  color: #409EFF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  font-size: 16px;
}

.wallet-item:nth-child(3) .wallet-icon {
  background-color: #f0f2f5;
  color: #67C23A;
}

.wallet-label {
  font-size: 14px;
  color: white;
  margin-bottom: 8px;
  font-weight: 500;
}

.wallet-value {
  font-size: 24px;
  font-weight: 600;
  color: white;
  margin-bottom: 14px;
}

.divider {
  width: 1px;
  background: linear-gradient(to bottom, transparent, rgba(224, 231, 255, 0.5) 20%, rgba(224, 231, 255, 0.5) 80%, transparent);
  margin: 5px 20px;
}

/* 移除分隔线组件，使用其他方式衔接 */
.section-divider {
  display: none;
}

/* 菜单部分 */
.menu-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: transparent;
  margin-top: 5px;
}

.menu-item:first-child {
  padding-top: 18px;
}

.menu-item {
  padding: 16px 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(220, 223, 230, 0.5); /* 加深分割线 */
  transition: all 0.3s;
  justify-content: flex-start; /* 确保左对齐 */
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.6);
  transform: translateX(2px);
}

.menu-item:active {
  background-color: rgba(245, 247, 250, 0.8);
}

.menu-item:last-child {
  border-bottom: 1px solid rgba(220, 223, 230, 0.5);
}

.menu-icon {
  width: 32px;
  height: 32px;
  background-color:white;
  color: #409EFF;
  border-radius: 4px;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.menu-item:hover .menu-icon {
  transform: none;
}

.menu-text {
  flex: 1;
  font-size: 15px;
  color: #303133;
  font-weight: 500;
  text-align: left; /* 确保文本左对齐 */
}

.menu-arrow {
  color: #c0c4cc;
  display: flex;
  align-items: center;
  transition: all 0.3s;
  flex-shrink: 0; /* 防止箭头缩小 */
}

.menu-arrow.is-expanded {
  transform: rotate(180deg);
  color: #409EFF;
}

.menu-item:hover .menu-arrow:not(.is-expanded) {
  transform: translateX(3px);
  color: #909399;
}

/* 子菜单样式 */
.submenu {
  background-color: rgba(250, 252, 255, 0.7);
  overflow: hidden;
  transition: all 0.3s ease;
}

.submenu-item {
  padding: 14px 20px 14px 58px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(220, 223, 230, 0.3);
  transition: all 0.3s;
  position: relative;
}

.submenu-item:last-child {
  border-bottom: none;
}

.submenu-item:hover {
  background-color: rgba(255, 255, 255, 0.8);
  transform: translateX(2px);
}

.submenu-item:active {
  background-color: rgba(245, 247, 250, 0.9);
}

.submenu-icon {
  width: 24px;
  height: 24px;
  color: #909399;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s;
  flex-shrink: 0;
}

.submenu-item:hover .submenu-icon {
  color: #409EFF;
}

.submenu-text {
  flex: 1;
  font-size: 14px;
  color: #606266;
  text-align: left;
}

/* 退出登录选项样式 */
.logout-item {
  padding-top: 14px;
}

.logout-item .submenu-icon {
  color: #f56c6c; /* 使用红色图标 */
}

.logout-text {
  color: #f56c6c; /* 使用红色文字 */
  font-weight: 500;
}

/* 对话框样式 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 10px;
}

.cancel-btn {
  flex: 1;
}

.dialog-footer .el-button--primary {
  flex: 2;
}

/* 语言选择样式 */
.language-list {
  margin: 0 -16px;
}

.language-item {
  padding: 16px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #f0f2f5;
  transition: all 0.3s;
  cursor: pointer;
}

.language-item:hover {
  background-color: #f5f7fa;
}

.language-item.active {
  background-color: #ecf5ff;
}

.language-flag {
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.language-flag .fi {
  font-size: 1.5em;
  border-radius: 2px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.language-label {
  flex: 1;
  font-size: 16px;
  color: #303133;
}

.language-select {
  color: #409EFF;
}

/* 消息列表样式 */
.notification-header {
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.notification-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.notification-count {
  font-size: 14px;
  color: #909399;
}

.notification-list {
  height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 0 16px;
}

.notification-item {
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #fff;
  margin-bottom: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.notification-item:hover {
  background-color: #f5f7fa;
  transform: translateY(-2px);
}

.notification-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.notification-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.notification-desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.empty-notification {
  padding: 32px;
  text-align: center;
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px;
  border-bottom: 1px solid #f0f2f5;
}

:deep(.el-drawer__body) {
  padding: 0;
  overflow: hidden;
}
</style> 
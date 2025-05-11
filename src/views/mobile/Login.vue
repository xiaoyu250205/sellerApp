<template>
  <div class="mobile-login-container">
    <!-- 语言切换 -->
    <div class="language-switch">
      <div class="selected-language" @click="languageVisible = true">
        <div class="language-flag">
          <span :class="`fi fi-${getCurrentLangFlag()}`"></span>
        </div>
      </div>
      <el-dialog v-model="languageVisible" :title="t('menu.language')" width="90%">
        <div class="language-list">
          <div
            v-for="lang in languages"
            :key="lang.value"
            class="language-item"
            :class="{ 'active': lang.value === locale.value }"
            @click="handleLanguageChange(lang.value); languageVisible = false"
          >
            <div class="language-flag">
              <span :class="`fi fi-${lang.flag}`"></span>
            </div>
            <div class="language-name">{{ lang.label }}</div>
          </div>
        </div>
      </el-dialog>
    </div>
    
    <div class="login-content">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="Logo" class="logo">
        <h2 class="welcome-title">{{ t('login.welcomeBack') }}</h2>
      </div>
      
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        class="login-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            :placeholder="t('login.usernamePlaceholder')"
            prefix-icon="User"
            size="large"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="t('login.passwordPlaceholder')"
            prefix-icon="Lock"
            show-password
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin" :loading="loading">
            {{ t('login.loginButton') }}
          </el-button>
          <div class="login-options">
            <el-button link class="register-link" @click="openRegister">{{ t('login.register') }}</el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import enUs from 'element-plus/dist/locale/en.mjs'
import viVn from 'element-plus/dist/locale/vi.mjs'
import { login } from '@/api/login'

const { t, locale } = useI18n()
const router = useRouter()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: ''
})

const openRegister = () => {
  window.open('https://www.ChainBuy-enter.com/', '_blank')
}

const rules = {
  username: [
    { required: true, message: t('login.usernameRequired'), trigger: 'blur' },
  ],
  password: [
    { required: true, message: t('login.passwordRequired'), trigger: 'blur' },
  ]
}

const formRef = ref(null)

const handleLogin = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 登录请求
      const data = {
        userId: loginForm.username,
        password: btoa(loginForm.password)
      }
      
      login(data).then(res => {
        if (res.code === 0) {
          ElMessage.success(t('login.loginSuccess'))
          sessionStorage.setItem('token', res.data.token)
          sessionStorage.setItem('userId', res.data.userId)
          sessionStorage.setItem('shopName', res.data.shopName)
          sessionStorage.setItem('shopId', res.data.shopId)
          sessionStorage.setItem('shopLogo', res.data.shopLogo)
          sessionStorage.setItem('directCar', res.data.directCar)
          router.push('/m/shop').then(() => {
            setTimeout(() => {
              window.location.reload()
            }, 1000)
          })
        } else {
          ElMessage.error(t('login.loginFailed') + ':' + res.message)
        }
      }).catch(err => {
        console.error('登录失败:', err)
        ElMessage.error(t('login.loginFailed'))
      }).finally(() => {
        loading.value = false
      })
    } else {
      ElMessage.error(t('login.loginFailed'))
    }
  })
}

const languages = [
  { 
    value: 'zh-CN', 
    label: '简体中文', 
    flag: 'cn',
    elementLocale: zhCn
  },
  { 
    value: 'en-US', 
    label: 'English', 
    flag: 'us',
    elementLocale: enUs
  },
  {
    value: 'vi-VN',
    label: 'Tiếng Việt',
    flag: 'vn',
    elementLocale: viVn
  },
  {
    value: 'th-TH',
    label: 'ภาษาไทย',
    flag: 'th',
    elementLocale: null
  },
  {
    value: 'tl-PH',
    label: 'Filipino',
    flag: 'ph',
    elementLocale: null
  },
  {
    value: 'ms-MY',
    label: 'Bahasa Melayu',
    flag: 'my',
    elementLocale: null
  },
  {
    value: 'ru-RU',
    label: 'Русский',
    flag: 'ru',
    elementLocale: null
  },
  {
    value: 'id-ID',
    label: 'Bahasa Indonesia',
    flag: 'id',
    elementLocale: null
  },
  {
    value: 'ja-JP',
    label: '日本語',
    flag: 'jp',
    elementLocale: null
  },
  {
    value: 'ko-KR',
    label: '한국어',
    flag: 'kr',
    elementLocale: null
  },
  {
    value: 'fr-FR',
    label: 'Français',
    flag: 'fr',
    elementLocale: null
  },
  {
    value: 'de-DE',
    label: 'Deutsch',
    flag: 'de',
    elementLocale: null
  }
]

const getCurrentLangFlag = () => {
  const currentLang = languages.find(lang => lang.value === locale.value)
  return currentLang ? currentLang.flag : languages[0].flag
}

const handleLanguageChange = (lang) => {
  locale.value = lang
  localStorage.setItem('language', lang)
}

// 初始化语言
locale.value = localStorage.getItem('language') || 'en-US'

const languageVisible = ref(false)
</script>

<style scoped>
.mobile-login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(120deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
  padding: 20px;
  box-sizing: border-box;
  position: relative;
}

.mobile-login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.8) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.6) 0%, transparent 50%);
  pointer-events: none;
}

.language-switch {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 10;
}

.selected-language {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  width: 40px;
  height: 40px;
  justify-content: center;
}

.selected-language .language-flag {
  width: 32px;
  height: 32px;
  overflow: hidden;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.lang-dropdown-item {
  display: flex;
  align-items: center;
  padding: 3px 0;
}

.language-flag {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  overflow: hidden;
  border-radius: 50%;
}

.language-flag .fi {
  font-size: 1.5em;
  border-radius: 2px;
}

.language-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.language-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.language-item:hover {
  background-color: #f5f7fa;
}

.language-item.active {
  background-color: #ecf5ff;
}

.language-name {
  margin-left: 15px;
  font-size: 16px;
}

.login-content {
  width: 100%;
  max-width: 400px;
  padding: 30px 20px;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.logo-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 35px;
  z-index: 2;
  position: relative;
}

.logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  margin-bottom: 24px;
  filter: none;
  opacity: 1;
}

.welcome-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0;
}

.login-form {
  width: 100%;
}

.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  margin-top: 16px;
  border-radius: 8px;
  background: linear-gradient(120deg, #2196f3, #42a5f5);
  border: none;
  transition: all 0.3s ease;
}

.login-button:hover {
  background: linear-gradient(120deg, #42a5f5, #2196f3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.2);
}

.login-options {
  width: 100%;
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  margin-right: 10px;
}

.register-link {
  font-size: 14px;
  color: #2196f3;
  padding: 0;
}

.register-link:hover {
  color: #1976d2;
}
</style> 
<script setup>
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { login } from '@/api/login'
import 'flag-icons/css/flag-icons.min.css'

const { t, locale } = useI18n()
const router = useRouter()

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
  
  // 先验证表单
  await formRef.value.validate((valid) => {
    if (valid) {
      // 表单验证通过，直接提交登录
      submitLogin()
    } else {
      ElMessage.error(t('login.formValidationFailed') || '表单验证失败')
    }
  })
}

// 登录API调用函数
const submitLogin = () => {
  // 调用登录API
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
      router.push('/')
    } else {
      ElMessage.error(t('login.loginFailed') + ':' + res.message)
    }
  })
}

const languages = [
  { 
    value: 'zh-CN', 
    label: '简体中文', 
    flag: 'cn'
  },
  { 
    value: 'en-US', 
    label: 'English', 
    flag: 'us'
  },
  {
    value: 'vi-VN',
    label: 'Tiếng Việt',
    flag: 'vn'
  },
  {
    value: 'th-TH',
    label: 'ภาษาไทย',
    flag: 'th'
  },
  {
    value: 'tl-PH',
    label: 'Filipino',
    flag: 'ph'
  },
  {
    value: 'ms-MY',
    label: 'Bahasa Melayu',
    flag: 'my'
  },
  {
    value: 'ru-RU',
    label: 'Русский',
    flag: 'ru'
  },
  {
    value: 'id-ID',
    label: 'Bahasa Indonesia',
    flag: 'id'
  },
  {
    value: 'ja-JP',
    label: '日本語',
    flag: 'jp'
  },
  {
    value: 'ko-KR',
    label: '한국어',
    flag: 'kr'
  },
  {
    value: 'fr-FR',
    label: 'Français',
    flag: 'fr'
  },
  {
    value: 'de-DE',
    label: 'Deutsch',
    flag: 'de'
  }
]

const currentLang = ref(languages.find(lang => lang.value === locale.value) || languages[0])

const handleLanguageChange = (lang) => {
  const selectedLang = languages.find(l => l.value === lang)
  if (selectedLang) {
    locale.value = selectedLang.value
    localStorage.setItem('language', selectedLang.value)
    currentLang.value = selectedLang
  }
}

// 初始化语言
handleLanguageChange(locale.value)
</script>

<template>
  <div class="login-container">
    <div class="language-switch">
      <el-dropdown @command="handleLanguageChange" trigger="click">
        <div class="selected-language">
          <span class="language-flag">
            <span :class="`fi fi-${currentLang.flag}`"></span>
          </span>
          <span>{{ currentLang.label }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item
              v-for="lang in languages"
              :key="lang.value"
              :command="lang.value"
              :class="{ 'active-lang': lang.value === locale.value }"
            >
              <span class="language-flag">
                <span :class="`fi fi-${lang.flag}`"></span>
              </span>
              <span>{{ lang.label }}</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="login-box">
      <div class="logo-container">
        <img src="@/assets/logo.png" alt="System Logo" class="system-logo">
      </div>
      <h2>{{ t('login.welcomeBack') }}</h2>
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
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            :placeholder="t('login.passwordPlaceholder')"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin">
            {{ t('login.loginButton') }}
          </el-button>
        </el-form-item>
        <div class="login-options">
          <!-- <el-button text>{{ t('login.forgotPassword') }}</el-button> -->
          <el-button link style="color: #1976d2; margin-right: 10px;" @click="openRegister">{{ t('login.register') }}</el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(120deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
}

.login-container::before {
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
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 2;
}

.selected-language {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 5px 10px;
}

.selected-language .language-flag {
  border-radius: 0;
}

.el-dropdown-menu .language-flag {
  border-radius: 0;
}

.language-flag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-right: 8px;
  border-radius: 0;
  overflow: hidden;
}

.language-flag .fi {
  font-size: 1.2em;
  border-radius: 0;
}

.login-box {
  width: 500px;
  padding: 50px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(149, 157, 165, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  position: relative;
  z-index: 1;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  margin-top: 0;
  color: #1976d2;
  font-size: 28px;
  font-weight: 600;
}

.login-form {
  margin-top: 20px;
}

.login-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
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
  display: flex;
  justify-content: end;
  margin-top: 20px;
  font-size: 14px;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #e3f2fd inset;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.8);
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #64b5f6 inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #2196f3 inset;
}

:deep(.el-button--text) {
  color: #2196f3;
}

:deep(.el-button--text:hover) {
  color: #1976d2;
}

:deep(.el-input__inner) {
  color: #1976d2;
}

:deep(.el-input__inner::placeholder) {
  color: #90caf9;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  padding: 10px 16px;
}

:deep(.el-dropdown-menu__item.active-lang) {
  background-color: #ecf5ff;
  color: #409EFF;
  font-weight: 500;
}

:deep(.el-dropdown-menu__item:hover) {
  background-color: #f5f7fa;
}

.logo-container {
  display: flex;
  justify-content: center;
  margin-top: -70px;
  margin-bottom: -30px;
}

.system-logo {
  width: 200px;
  height: 200px;
  object-fit: contain;
}
</style> 
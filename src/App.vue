<script setup>
import { useI18n } from 'vue-i18n'
import { watch, onMounted } from 'vue'
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import enUs from 'element-plus/dist/locale/en.mjs'
import viVn from 'element-plus/dist/locale/vi.mjs'
import { useGlobalConfig } from 'element-plus'

const { locale } = useI18n()
const config = useGlobalConfig()

// 语言配置映射
const localeMap = {
  'zh-CN': zhCn,
  'en-US': enUs,
  'vi-VN': viVn
}

// 确保初始化时设置正确的Element Plus语言
onMounted(() => {
  config.locale = localeMap[locale.value] || enUs
})

// 监听语言变化并更新 Element Plus 的语言配置
watch(
  () => locale.value,
  (val) => {
    config.locale = localeMap[val] || enUs
  },
  { immediate: true }
)
</script>

<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  height: 100%;
  width: 100%;
}

body {
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: 0;
  margin: 0;
  max-width: none;
}

.app-container {
  height: 100%;
  width: 100%;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: #f5f7fa;
}

/* Element Plus 主题覆盖 */
.el-button--text {
  color: #666;
}

.el-button--text:hover {
  color: #409EFF;
}

.el-button--primary {
  background-color: #409EFF;
  border-color: #409EFF;
}

.el-button--primary:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.el-tag--success {
  background-color: #f0f9eb;
  border-color: #e1f3d8;
  color: #67c23a;
}

.el-tag--danger {
  background-color: #fef0f0;
  border-color: #fde2e2;
  color: #f56c6c;
}
</style>

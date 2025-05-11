<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const settings = ref({
  siteName: 'Vue3 Admin',
  logo: '/vite.svg',
  theme: 'light',
  language: 'zh-CN'
})

const handleSave = () => {
  // 保存设置
  console.log('保存设置:', settings.value)
}
</script>

<template>
  <div class="settings-container">
    <div class="page-header">
      <h2>{{ t('menu.settings') }}</h2>
    </div>

    <el-card class="settings-card">
      <el-form :model="settings" label-width="120px">
        <el-form-item :label="t('settings.siteName')">
          <el-input v-model="settings.siteName" />
        </el-form-item>

        <el-form-item :label="t('settings.logo')">
          <el-upload
            class="logo-uploader"
            action="/api/upload"
            :show-file-list="false"
          >
            <img v-if="settings.logo" :src="settings.logo" class="logo-preview" />
            <el-icon v-else class="logo-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>

        <el-form-item :label="t('settings.theme')">
          <el-radio-group v-model="settings.theme">
            <el-radio label="light">{{ t('settings.lightTheme') }}</el-radio>
            <el-radio label="dark">{{ t('settings.darkTheme') }}</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item :label="t('settings.language')">
          <el-select v-model="settings.language">
            <el-option label="简体中文" value="zh-CN" />
            <el-option label="English" value="en-US" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSave">
            {{ t('common.save') }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.settings-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2f3d;
}

.settings-card {
  max-width: 800px;
}

.logo-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 178px;
  height: 178px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo-uploader:hover {
  border-color: #409EFF;
}

.logo-preview {
  width: 178px;
  height: 178px;
  object-fit: contain;
}

.logo-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
  line-height: 178px;
}
</style> 
<template>
  <div class="mobile-shop-settings">
    <div class="tabs-header">
      <div class="header-left" @click="router.back()">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">{{ t('menu.shopSettings') }}</div>
      <div class="header-right"></div>
    </div>

    <div class="content">
      <el-form 
        :model="shopForm" 
        :rules="shopRules" 
        ref="shopFormRef" 
        label-position="top"
        class="shop-form"
      >
        <el-form-item :label="t('shopSettings.shopName')" prop="shopName" align="left">
          <el-input v-model="shopForm.shopName" :placeholder="t('shopSettings.shopNamePlaceholder')" />
        </el-form-item>
        
        <el-form-item :label="t('shopSettings.shopLogo')" prop="logo" align="left">
          <el-upload
            class="logo-uploader"
            action="#"
            :http-request="handleLogoUpload"
            :show-file-list="false"
            :before-upload="beforeLogoUpload"
          >
            <img v-if="shopForm.logo && shopForm.logo !== 'null'" :src="shopForm.logo" class="logo-preview" />
            <div v-else class="upload-placeholder">
              <el-icon class="upload-icon"><Plus /></el-icon>
              <div class="upload-text">{{ t('shopSettings.clickToUpload') }}</div>
            </div>
          </el-upload>
          <div class="form-tip">{{ t('shopSettings.logoTip') }}</div>
        </el-form-item>
        
        <el-form-item label="Facebook" prop="facebook" align="left">
          <el-input 
            v-model="shopForm.facebook" 
            :placeholder="t('shopSettings.facebookPlaceholder')"
          >
            <template #prefix>
              <div class="social-prefix">facebook.com/</div>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="WhatsApp" prop="whatsapp" align="left">
          <el-input 
            v-model="shopForm.whatsapp" 
            :placeholder="t('shopSettings.whatsappPlaceholder')"
          >
            <template #prefix>
              <div class="social-prefix">+</div>
            </template>
          </el-input>
        </el-form-item>
        
        <el-form-item label="Zalo" prop="zalo" align="left">
          <el-input 
            v-model="shopForm.zalo" 
            :placeholder="t('shopSettings.zaloPlaceholder')"
          />
        </el-form-item>
        
        <el-form-item class="btn-container">
          <div class="btn-wrapper">
            <el-button type="primary" @click="submitForm" :loading="loading" class="submit-btn">
              {{ t('common.save') }}
            </el-button>
            <!-- <el-button @click="resetForm" class="reset-btn">
              {{ t('common.reset') }}
            </el-button> -->
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Plus } from '@element-plus/icons-vue'
import { getSettings, uploadImage, deleteImage, updateSettings } from '@/api/settings'

const { t } = useI18n()
const router = useRouter()
const shopFormRef = ref(null)
const loading = ref(false)

const oldLogo = ref(null)

// 商店表单数据
const shopForm = ref({
  shopName: sessionStorage.getItem('shopName') || '',
  logo: '/vite.svg',
  facebook: '',
  whatsapp: '',
  zalo: ''
})

// 表单验证规则
const shopRules = {
  shopName: [
    { required: true, message: t('shopSettings.shopNameRequired'), trigger: 'blur' },
    { min: 2, max: 50, message: t('shopSettings.shopNameLength'), trigger: 'blur' }
  ],
  facebook: [
    { max: 100, message: t('shopSettings.socialMaxLength'), trigger: 'blur' }
  ],
  whatsapp: [
    { max: 20, message: t('shopSettings.whatsappMaxLength'), trigger: 'blur' },
    { pattern: /^\d*$/, message: t('shopSettings.whatsappNumberOnly'), trigger: 'blur' }
  ],
  zalo: [
    { max: 20, message: t('shopSettings.zaloMaxLength'), trigger: 'blur' },
    { pattern: /^\d*$/, message: t('shopSettings.zaloNumberOnly'), trigger: 'blur' }
  ]
}

// Logo上传前验证
const beforeLogoUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error(t('shopSettings.logoImageOnly'))
    return false
  }
  if (!isLt2M) {
    ElMessage.error(t('shopSettings.logoSizeLimit'))
    return false
  }
  
  return true
}

// 处理Logo上传
const handleLogoUpload = async (options) => {
  const { file } = options
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', sessionStorage.getItem('userId'))
    formData.append('type', 'logo')
    
    // 如果已有原来的logo，先保存旧logo的URL，以便删除
    oldLogo.value = shopForm.value.logo !== '/vite.svg' ? shopForm.value.logo : null
    
    // 显示上传中状态
    loading.value = true
    
    // 调用上传图片API
    const res = await uploadImage(formData)
    
    if (res.code === 0) {
      // 上传成功，更新logo地址，添加基础URL前缀
      let logoUrl = res.data
      shopForm.value.logo = logoUrl
      // 立即更新sessionStorage中的shopLogo
      sessionStorage.setItem('shopLogo', logoUrl)
      ElMessage.success(t('shopSettings.logoUploadSuccess'))
    } else {
      ElMessage.error(res.message || t('shopSettings.logoUploadFailed'))
    }
  } catch (error) {
    console.error('上传logo失败:', error)
    ElMessage.error(t('shopSettings.logoUploadFailed'))
  } finally {
    loading.value = false
  }
}

// 提交表单
const submitForm = () => {
  shopFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const data = {
          userId: sessionStorage.getItem('userId'),
          shopName: shopForm.value.shopName,
          shopLogo: shopForm.value.logo,
          facebook: shopForm.value.facebook,
          whatsapp: shopForm.value.whatsapp,
          zalo: shopForm.value.zalo
        }
        
        const res = await updateSettings(data)
        
        if (res.code === 0) {
          // 更新成功，保存到sessionStorage
          sessionStorage.setItem('shopName', shopForm.value.shopName)
          // 保存shopLogo到sessionStorage
          if (shopForm.value.logo && shopForm.value.logo !== '/vite.svg') {
            sessionStorage.setItem('shopLogo', shopForm.value.logo)
          }
          
          // 刷新布局组件中的顶部店铺信息
          if (window.updateShopInfo) {
            window.updateShopInfo()
          }
          
          ElMessage.success(t('shopSettings.saveSuccess'))
          
          // 延迟返回上一页
          setTimeout(() => {
            router.back()
          }, 1500)
        } else {
          ElMessage.error(res.message || t('shopSettings.saveFailed'))
        }
      } catch (error) {
        console.error('保存设置失败:', error)
        ElMessage.error(t('shopSettings.saveFailed'))
      } finally {
        loading.value = false
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  shopFormRef.value.resetFields()
}

// 获取店铺设置
const getShopSettings = () => {
  loading.value = true
  const data = {
    userId: sessionStorage.getItem('userId')
  }
  getSettings(data).then(res => {
    if (res.code === 0) {
      // 处理返回的数据，确保logo URL有正确的前缀
      const shopData = {...res.data}
      let logoUrl = shopData.shopLogo
      
      // 映射API返回的shopLogo到表单的logo字段
      shopForm.value = {
        shopName: shopData.shopName || '',
        logo: logoUrl,
        facebook: shopData.facebook || '',
        whatsapp: shopData.whatsapp || '',
        zalo: shopData.zalo || ''
      }
    }
  }).catch(err => {
    console.error(err)
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  getShopSettings()
})
</script>

<style scoped>
.mobile-shop-settings {
  padding: 0;
  background-color: #f5f7fa;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

.tabs-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  border-bottom: 1px solid rgba(220, 223, 230, 0.5);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.header-left, .header-right {
  width: 24px;
  display: flex;
  align-items: center;
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.back-icon {
  font-size: 20px;
  cursor: pointer;
  color: #303133;
}

.content {
  padding: 0 16px 60px;
  padding-top: 50px;
  background-color: #fff;
  border-radius: 8px 8px 0 0;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
  margin-top: -4px;
  min-height: calc(100vh - 60px);
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  padding: 0 0 8px 0;
  color: #606266;
  line-height: 1.4;
  text-align: left;
}

:deep(.el-input.is-disabled .el-input__wrapper) {
  background-color: #f5f7fa;
}

.shop-form {
  padding-top: 10px;
  margin-bottom: 20px;
}

.logo-uploader {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  margin: 10px 0;
}

.logo-preview {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.upload-placeholder {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  border: 1px dashed #d9d9d9;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fbfdff;
  cursor: pointer;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}

.upload-text {
  font-size: 12px;
  color: #8c939d;
  margin-top: 5px;
  text-align: center;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
  text-align: left;
  width: 100%;
}

.social-prefix {
  color: #909399;
  padding-right: 4px;
  font-size: 13px;
}

:deep(.el-form-item__content) {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px rgba(220, 223, 230, 0.5) inset;
  width: 100%;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF inset !important;
}

.btn-container {
  margin-top: 30px;
}

.btn-wrapper {
  display: flex;
  flex-direction: row;
  width: 100%;
}

.submit-btn, .reset-btn {
  border-radius: 4px;
  height: 40px;
  margin-right: 12px;
  font-weight: 500;
  flex: 1;
}

:deep(.el-form) {
  margin-bottom: 60px;
}
</style> 
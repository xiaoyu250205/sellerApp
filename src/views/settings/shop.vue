<template>
  <div class="shop-settings-container">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <span>{{ t('menu.shopSettings') }}</span>
        </div>
      </template>
      
      <div class="content">
        <el-form 
          :model="shopForm" 
          :rules="shopRules" 
          ref="shopFormRef" 
          label-width="120px" 
          class="shop-form"
        >
          <h3 class="section-title">{{ t('shopSettings.basicInfo') }}</h3>
          
          <el-form-item :label="t('shopSettings.shopName')" prop="shopName">
            <el-input v-model="shopForm.shopName" :placeholder="t('shopSettings.shopNamePlaceholder')" />
          </el-form-item>
          
          <el-form-item :label="t('shopSettings.shopLogo')" prop="logo">
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
          
          <h3 class="section-title">{{ t('shopSettings.contactInfo') }}</h3>
          
          <el-form-item label="Facebook" prop="facebook">
            <el-input 
              v-model="shopForm.facebook" 
              :placeholder="t('shopSettings.facebookPlaceholder')"
              prefix-icon="el-icon-facebook"
            >
              <template #prefix>
                <div class="social-prefix">facebook.com/</div>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="WhatsApp" prop="whatsapp">
            <el-input 
              v-model="shopForm.whatsapp" 
              :placeholder="t('shopSettings.whatsappPlaceholder')"
            >
              <template #prefix>
                <div class="social-prefix">+</div>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="Zalo" prop="zalo">
            <el-input 
              v-model="shopForm.zalo" 
              :placeholder="t('shopSettings.zaloPlaceholder')"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="submitForm" :loading="loading">
              {{ t('common.save') }}
            </el-button>
            <el-button @click="resetForm">{{ t('common.reset') }}</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getSettings, uploadImage, deleteImage, updateSettings } from '@/api/settings'

const { t } = useI18n()
const shopFormRef = ref(null)
const loading = ref(false)

const oldLogo = ref(null)

// 商店表单数据
const shopForm = ref({
  shopName: sessionStorage.getItem('shopName') || '',
  logo: '',
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
          ElMessage.success(t('shopSettings.saveSuccess'))
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
        logo: logoUrl || '/shopLogo.jpg',
        facebook: shopData.facebook || '',
        whatsapp: shopData.whatsapp || '',
        zalo: shopData.zalo || ''
      }
      
      // 如果获取到有效的logo，更新sessionStorage
      if (logoUrl && logoUrl !== '/shopLogo.jpg') {
        sessionStorage.setItem('shopLogo', logoUrl)
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
.shop-settings-container {
  width: 100%;
}

.main-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.content {
  padding: 20px 0;
}

.shop-form {
  max-width: 700px;
  margin: 0 auto;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin: 30px 0 20px 0;
  padding-left: 10px;
  border-left: 3px solid #409EFF;
  color: #333;
}

.logo-uploader {
  border: 1px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 180px;
  height: 180px;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: border-color 0.3s;
}

.logo-uploader:hover {
  border-color: #409EFF;
}

.logo-preview {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  color: #909399;
}

.upload-icon {
  font-size: 28px;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
}

.form-tip {
  font-size: 12px;
  margin-top: 8px;
  color: #909399;
}

.social-prefix {
  color: #909399;
  font-size: 14px;
}
</style> 
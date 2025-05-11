<template>
  <div class="shop-express-container">
    <el-card class="main-card">
      <div class="content">
        
        <div class="package-list">
          <el-card v-for="(pkg, index) in packages" :key="index" class="package-card" :class="pkg.type">
            <div class="package-image">
              <img :src="pkg.image" :alt="pkg.title" />
            </div>
            <h2 class="package-title">{{ pkg.title }}</h2>
            <div class="package-products">
              {{ t('shopExpress.promotableProducts') }} 
              <span class="product-count">{{ pkg.productCount }}</span>
            </div>
            <div class="package-description">{{ pkg.description }}</div>
            <div class="package-price">
              <span class="price-symbol">$</span>
              <span class="price-value">{{ pkg.price }}</span>
            </div>
            <el-button 
              type="primary" 
              class="buy-button" 
              @click="openPurchaseDialog(pkg)"
              :disabled="!canBuyPackage(pkg.type)"
            >
              {{ getButtonText(pkg.type) }}
            </el-button>
          </el-card>
        </div>
      </div>
    </el-card>

    <!-- 购买确认对话框 -->
    <el-dialog
      v-model="purchaseDialogVisible"
      :title="t('shopExpress.purchaseDialog.title')"
      width="450px"
      class="purchase-dialog"
      :show-close="false"
    >
      <div class="dialog-content">
        <!-- 套餐信息 -->
        <div class="package-info-section">
          <h3>{{ t('shopExpress.purchaseDialog.packageInfo') }}</h3>
          <el-descriptions :column="1" border>
            <el-descriptions-item :label="t('shopExpress.purchaseDialog.packageName')">
              <span class="package-name">{{ selectedPackage?.title }}</span>
            </el-descriptions-item>
            <el-descriptions-item :label="t('shopExpress.purchaseDialog.packagePrice')">
              <span class="package-price-value">${{ selectedPackage?.price }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 安全验证 -->
        <div class="security-section">
          <h3>{{ t('shopExpress.purchaseDialog.securityVerification') }}</h3>
          <el-form :model="purchaseForm" :rules="purchaseRules" ref="purchaseFormRef">
            <el-form-item prop="fundPassword">
              <el-input
                v-model="purchaseForm.fundPassword"
                type="password"
                :placeholder="t('shopExpress.purchaseDialog.fundPasswordPlaceholder')"
                maxlength="6"
                show-password
              >
                <template #prefix>
                  <el-icon><Lock /></el-icon>
                </template>
              </el-input>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="purchaseDialogVisible = false">
            {{ t('shopExpress.purchaseDialog.cancel') }}
          </el-button>
          <el-button type="primary" @click="confirmPurchase" :loading="purchaseLoading">
            {{ t('shopExpress.purchaseDialog.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage} from 'element-plus'
import { Lock } from '@element-plus/icons-vue'
import { buyPromotionPackage } from '@/api/wallet'
const { t } = useI18n()

// 套餐数据
const packages = computed(() => [
  {
    type: '3',
    title: t('shopExpress.packageDetails.diamond.title'),
    image: '/vite.svg',
    productCount: '+20',
    description: t('shopExpress.packageDetails.diamond.description'),
    price: '499.99',
  },
  {
    type: '2',
    title: t('shopExpress.packageDetails.gold.title'),
    image: '/vite.svg',
    productCount: '+10',
    description: t('shopExpress.packageDetails.gold.description'),
    price: '299.99'
  },
  {
    type: '1',
    title: t('shopExpress.packageDetails.silver.title'),
    image: '/vite.svg',
    productCount: '+5',
    description: t('shopExpress.packageDetails.silver.description'),
    price: '199.99'
  }
])

// 购买对话框相关
const purchaseDialogVisible = ref(false)
const selectedPackage = ref(null)
const purchaseLoading = ref(false)
const purchaseFormRef = ref(null)

// 购买表单
const purchaseForm = reactive({
  fundPassword: ''
})

// 表单验证规则
const purchaseRules = {
  fundPassword: [
    { required: true, message: t('shopExpress.purchaseDialog.fundPasswordRequired'), trigger: 'blur' },
    { pattern: /^\d{6}$/, message: t('shopExpress.purchaseDialog.fundPasswordLength'), trigger: 'blur' }
  ]
}

// 获取当前用户的直通车等级
const currentDirectCar = ref(sessionStorage.getItem('directCar') || '0')

// 判断是否可以购买套餐
const canBuyPackage = (packageType) => {
  const currentLevel = parseInt(currentDirectCar.value)
  const targetLevel = parseInt(packageType)
  // 只能购买更高级的套餐
  return targetLevel > currentLevel
}

// 获取按钮文本
const getButtonText = (packageType) => {
  const currentLevel = parseInt(currentDirectCar.value)
  const targetLevel = parseInt(packageType)
  
  if (targetLevel === currentLevel) {
    return t('shopExpress.currentPackage')
  } else if (targetLevel < currentLevel) {
    return t('shopExpress.lowerPackage')
  }
  return t('shopExpress.buyPackage')
}

// 打开购买对话框
const openPurchaseDialog = (pkg) => {
  if (!canBuyPackage(pkg.type)) {
    return
  }
  selectedPackage.value = pkg
  purchaseForm.fundPassword = ''
  purchaseDialogVisible.value = true
}

// 确认购买
const confirmPurchase = () => {
  purchaseFormRef.value.validate((valid) => {
    if (valid) {
      purchaseLoading.value = true
      
      const data = {
        purchaseAmount: selectedPackage.value.price,
        userId: sessionStorage.getItem('userId'),
        type: selectedPackage.value.type,
        password: btoa(purchaseForm.fundPassword)
      }
      buyPromotionPackage(data).then(res => {
        if(res.code === 0){
          // 更新sessionStorage中的直通车等级
          sessionStorage.setItem('directCar', selectedPackage.value.type)
          currentDirectCar.value = selectedPackage.value.type
          
          ElMessage.success(t('shopExpress.purchaseDialog.successMessage', {
            package: selectedPackage.value.title
          }))
          purchaseDialogVisible.value = false
        }else if(res.code === -2){
          ElMessage.error(t('shopExpress.purchaseDialog.fundPasswordError'))
        }else if(res.code === -3){
          ElMessage.error(t('shopExpress.purchaseDialog.notEnoughBalance'))
        }else{
          console.log(res.message)
          ElMessage.error(t('shopExpress.purchaseDialog.purchaseFailed'))
        }
      }).catch(() => {
        ElMessage.error(t('shopExpress.purchaseDialog.purchaseFailed'))
      }).finally(() => {
        purchaseLoading.value = false
      })
    }
  })
}
</script>

<style scoped>
.shop-express-container {
  width: 100%;
}

.main-card {
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 40px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
}

.content {
  min-height: 400px;
  padding: 30px 0;
}

.page-title {
  text-align: center;
  font-size: 28px;
  margin-bottom: 50px;
  font-weight: 600;
  color: #333;
  position: relative;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #409EFF, #64B5F6);
  border-radius: 2px;
}

.package-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 40px;
  margin-top: 20px;
}

.package-card {
  width: 370px;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.package-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
}

.package-card.diamond::before {
  background: linear-gradient(90deg, #FF6B6B, #FF8E53);
}

.package-card.gold::before {
  background: linear-gradient(90deg, #FFD700, #FFA500);
}

.package-card.silver::before {
  background: linear-gradient(90deg, #B0BEC5, #78909C);
}

.package-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
}

.package-image {
  width: 100px;
  height: 100px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 50%;
  padding: 20px;
  margin-left: auto;
  margin-right: auto;
}

.package-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  display: block;
  margin: 0 auto;
}

.package-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 15px;
  color: #333;
}

.diamond .package-title {
  color: #FF6B6B;
}

.gold .package-title {
  color: #FFA500;
}

.silver .package-title {
  color: #78909C;
}

.package-products {
  font-size: 15px;
  color: #666;
  margin-bottom: 15px;
  background-color: #f5f7fa;
  padding: 8px 16px;
  border-radius: 20px;
  text-align: center;
  width: 100%;
}

.product-count {
  color: #409EFF;
  font-weight: bold;
  font-size: 18px;
}

.package-description {
  text-align: center;
  font-size: 14px;
  color: #666;
  margin-bottom: 25px;
  min-height: 90px;
  line-height: 1.6;
}

.package-price {
  font-size: 16px;
  color: #f56c6c;
  margin-bottom: 25px;
  display: flex;
  align-items: baseline;
  justify-content: center;
}

.price-symbol {
  font-size: 24px;
  font-weight: bold;
  margin-right: 2px;
}

.price-value {
  font-size: 32px;
  font-weight: bold;
}

.price-period {
  font-size: 14px;
  color: #999;
  margin-left: 5px;
}

.buy-button {
  width: 100%;
  padding: 12px 0;
  font-size: 16px;
  border-radius: 8px;
  transition: all 0.3s;
}

.buy-button:disabled {
  background-color: #f5f7fa;
  border-color: #e4e7ed;
  color: #c0c4cc;
  cursor: not-allowed;
}

.buy-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.3);
}

/* 购买对话框样式 */
:deep(.purchase-dialog .el-dialog__header) {
  padding: 20px;
  background: linear-gradient(135deg, #409EFF, #64B5F6);
  color: white;
  border-radius: 8px 8px 0 0;
  position: relative;
  z-index: 1;
}

:deep(.purchase-dialog .el-dialog__title) {
  color: white;
  font-weight: 600;
}

:deep(.purchase-dialog .el-dialog__body) {
  padding: 30px 20px;
}

.dialog-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
  padding-top: 20px;
}

.package-info-section h3,
.security-section h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.package-info-section h3::before,
.security-section h3::before {
  content: '';
  display: inline-block;
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 8px;
  border-radius: 2px;
}

:deep(.el-descriptions__label) {
  width: 100px;
}

.package-name {
  font-weight: 600;
  color: #409EFF;
}

.package-price-value {
  color: #f56c6c;
  font-weight: 600;
}

:deep(.el-input__wrapper) {
  padding: 0 15px;
}

:deep(.el-input__inner) {
  height: 42px;
}

:deep(.el-input__prefix) {
  color: #909399;
}

.dialog-footer {
  display: flex;
  justify-content: center; /* 使按钮居中 */
  gap: 20px; /* 增加按钮间距 */
}
</style> 
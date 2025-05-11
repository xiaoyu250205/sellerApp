<template>
  <div class="mobile-shop-express">
    <!-- 顶部标题栏 -->
    <div class="tabs-header">
      <div class="header-left" @click="router.back()">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">{{ t('shopExpress.title') }}</div>
      <div class="header-right"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 套餐列表 -->
      <div class="package-list">
        <div 
          v-for="(pkg, index) in packages" 
          :key="index" 
          class="package-card" 
          :class="[pkg.type, { 'current-package': isCurrentPackage(pkg.type) }]"
        >
          <div class="package-header">
            <div class="package-title">{{ pkg.title }}</div>
            <div class="package-price">
              <span class="price-symbol">$</span>
              <span class="price-value">{{ pkg.price }}</span>
            </div>
          </div>
          
          <div class="package-content">
            <div class="package-products">
              {{ t('shopExpress.promotableProducts') }} 
              <span class="product-count">{{ pkg.productCount }}</span>
            </div>
            <div class="package-description">{{ pkg.description }}</div>
          </div>
          
          <div class="package-footer">
            <el-button 
              type="primary" 
              class="buy-button" 
              @click="openPurchaseDialog(pkg)"
              :disabled="!canBuyPackage(pkg.type)"
              :class="{ 'current-btn': isCurrentPackage(pkg.type) }"
            >
              {{ getButtonText(pkg.type) }}
            </el-button>
          </div>
        </div>
      </div>
      
      <!-- 购买历史部分 -->
      <div class="history-section">
        <div class="history-title">
          <span>{{ t('menu.purchaseHistory') }}</span>
        </div>
        
        <div class="history-content">
          <div v-if="historyData.length === 0 && !historyLoading" class="empty-data">
            <el-empty :description="t('common.noData')" />
          </div>
          <div v-if="historyLoading" class="loading-container">
            <el-loading :visible="true" />
          </div>
          <div v-else-if="historyData.length > 0" class="history-items">
            <div v-for="(item, index) in historyData" :key="index" class="history-item">
              <div class="history-header">
                <span :class="['package-type', `type-${item.type}`]">
                  {{ getPackageTypeText(item.type) }}
                </span>
                <span class="history-time">{{ item.createTime }}</span>
              </div>
              
              <div class="history-info">
                <div class="info-row">
                  <span class="label">{{ t('purchaseHistory.paymentAmount') }}:</span>
                  <span class="value price">${{ item.purchaseAmount }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加载更多 -->
          <div class="load-more-trigger" ref="historyLoadMoreTrigger" v-show="hasMoreHistory"></div>
          <div class="no-more" v-if="!historyLoading && historyData.length > 0 && !hasMoreHistory">
            {{ t('common.noMoreData') }}
          </div>
        </div>
      </div>
    </div>

    <!-- 购买确认对话框 -->
    <el-dialog
      v-model="purchaseDialogVisible"
      :title="t('shopExpress.purchaseDialog.title')"
      width="90%"
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
import { ref, reactive, computed, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, ArrowRight, Lock } from '@element-plus/icons-vue'
import { buyPromotionPackage, getPurchaseHistory } from '@/api/wallet'

const { t } = useI18n()
const router = useRouter()

// 套餐数据
const packages = ref([
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
  ]
}

// 获取当前用户的直通车等级
const currentDirectCar = ref(sessionStorage.getItem('directCar') || '0')

// 判断是否为当前套餐
const isCurrentPackage = (packageType) => {
  return packageType === currentDirectCar.value
}

// 判断是否可以购买套餐
const canBuyPackage = (packageType) => {
  const currentLevel = parseInt(currentDirectCar.value)
  const targetLevel = parseInt(packageType)
  // 不能购买当前套餐和更低级的套餐
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
          // 刷新购买历史数据
          fetchHistoryData()
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

// 购买历史相关
const historyLoading = ref(false)
const historyData = ref([])
const historyPage = ref(1)
const historyPageSize = ref(10)
const historyTotal = ref(0)
const hasMoreHistory = computed(() => historyData.value.length < historyTotal.value)
const historyLoadMoreTrigger = ref(null)

// 获取套餐类型文本
const getPackageTypeText = (type) => {
  switch (type) {
    case '1':
    case 1:
      return t('shopExpress.packageDetails.silver.title')
    case '2':
    case 2:
      return t('shopExpress.packageDetails.gold.title')
    case '3':
    case 3:
      return t('shopExpress.packageDetails.diamond.title')
    default:
      return ''
  }
}

// 获取购买历史数据
const fetchHistoryData = (isLoadMore = false) => {
  if (historyLoading.value) return
  
  historyLoading.value = true
  const userId = sessionStorage.getItem('userId')
  
  getPurchaseHistory({
    userId,
    pageIndex: historyPage.value,
    pageSize: historyPageSize.value
  })
    .then(res => {
      if (res.code === 0) {
        const newData = res.data.records.map(item => ({
          id: item.id,
          type: item.type ? item.type.toString() : '',
          createTime: formatDate(item.startTime),
          purchaseAmount: item.amount
        }))
        
        if (isLoadMore) {
          historyData.value = [...historyData.value, ...newData]
        } else {
          historyData.value = newData
        }
        
        historyTotal.value = res.data.total || 0
      } else {
        if (!isLoadMore) {
          historyData.value = []
          historyTotal.value = 0
        }
      }
    })
    .catch(() => {
      if (!isLoadMore) {
        historyData.value = []
        historyTotal.value = 0
      }
    })
    .finally(() => {
      historyLoading.value = false
    })
}

// 设置滚动加载
const setupIntersectionObserver = () => {
  nextTick(() => {
    const loadMoreObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]
      if (entry.isIntersecting && hasMoreHistory.value && !historyLoading.value) {
        historyPage.value++
        fetchHistoryData(true)
      }
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px 100px 0px'
    })
    
    if (historyLoadMoreTrigger.value) {
      loadMoreObserver.observe(historyLoadMoreTrigger.value)
      historyObserver.value = loadMoreObserver
    }
  })
}

// 用于存储 observer 引用
const historyObserver = ref(null)

// 组件挂载时
onMounted(() => {
  setupIntersectionObserver()
  // 初始加载购买历史数据
  fetchHistoryData()
})

// 组件卸载前
onBeforeUnmount(() => {
  if (historyObserver.value) {
    historyObserver.value.disconnect()
  }
})

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return dateStr
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}`
}
</script>

<style scoped>
.mobile-shop-express {
  min-height: 100vh;
  background-color: #f5f7fa;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 顶部标题栏样式 */
.tabs-header {
  height: 45px;
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

.header-left {
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

.header-right {
  width: 24px;
}

.back-icon {
  font-size: 20px;
  cursor: pointer;
  color: #303133;
}

/* 内容区域样式 */
.content-container {
  padding: 65px 16px 30px;
}

.page-description {
  text-align: center;
  margin-bottom: 24px;
  padding: 0 20px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
}

/* 套餐列表样式 */
.package-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 30px;
}

.package-card {
  background-color: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s;
  position: relative;
  border: 1px solid rgba(220, 223, 230, 0.3);
}

.package-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}

.package-card[class*="3"]::before {
  background: linear-gradient(to bottom, #FF6B6B, #FF8E53);
}

.package-card[class*="2"]::before {
  background: linear-gradient(to bottom, #FFD700, #FFA500);
}

.package-card[class*="1"]::before {
  background: linear-gradient(to bottom, #B0BEC5, #78909C);
}

.package-card.current-package {
  transform: scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.package-header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f2f5;
}

.package-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.package-card[class*="3"] .package-title {
  color: #FF6B6B;
}

.package-card[class*="2"] .package-title {
  color: #FFA500;
}

.package-card[class*="1"] .package-title {
  color: #78909C;
}

.package-price {
  display: flex;
  align-items: baseline;
}

.price-symbol {
  font-size: 14px;
  font-weight: 600;
  color: #f56c6c;
}

.price-value {
  font-size: 20px;
  font-weight: 700;
  color: #f56c6c;
}

.package-content {
  padding: 16px;
}

.package-products {
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.product-count {
  color: #409EFF;
  font-weight: 600;
  margin-left: 4px;
}

.package-description {
  font-size: 13px;
  color: #909399;
  line-height: 1.5;
}

.package-footer {
  padding: 0 16px 16px;
  display: flex;
  justify-content: center;
}

.buy-button {
  width: 100%;
  border-radius: 20px;
  font-size: 14px;
}

.current-btn {
  background-color: #67c23a;
  border-color: #67c23a;
}

/* 历史记录按钮区域 */
.history-section {
  margin-top: 35px;
  background-color: #f5f7fa;
  border-radius: 12px;
  padding: 16px;
}

.history-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f2f5;
}

.history-content {
  margin-top: 10px;
}

.history-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  background-color: #fff;
  border-radius: 10px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;
}

.history-time {
  font-size: 13px;
  color: #909399;
}

.history-info {
  padding: 4px 0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.label {
  color: #606266;
  font-size: 14px;
}

.value {
  font-size: 14px;
  color: #303133;
}

.price {
  color: #f56c6c;
  font-weight: 600;
}

.empty-data {
  padding: 24px 0;
  text-align: center;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100px;
}

/* 加载更多触发器 */
.load-more-trigger {
  height: 50px;
  margin-top: 16px;
}

/* 无更多数据 */
.no-more {
  text-align: center;
  color: #909399;
  font-size: 14px;
  padding: 16px 0;
}

.package-type {
  font-weight: 500;
}

.type-1 {
  color: #909399;
}

.type-2 {
  color: #e6a23c;
}

.type-3 {
  color: #f56c6c;
}
</style> 
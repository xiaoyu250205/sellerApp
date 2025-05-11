<template>
  <div class="mobile-shop">

    <div class="shop-info-container">
      <el-card class="shop-info-card">
        <div class="shop-info-card-logo">
          <img class="shop-info-card-logo-img" src="@/assets/logo.png" alt="">
        </div>
        <div class="shop-info-card-user">
            <el-avatar :size="60" :src="shopLogo || '@/assets/logo.png'" />
            <div class="shop-info-card-user-level">
              <span class="shop-name" style="text-align: left;">{{ shopName }}</span>
              <div class="shop-info-card-user-level-star">
                <el-rate 
                  v-model="rating"
                  disabled
                  :allow-half="true"
                  :colors="['#99A9BF', '#F7BA2A', '#FF9900']"
                  :score-template="scoreTemplate"
                />
                <span class="rating-text">{{ rating }}</span>
              </div>
            </div>
        </div>

        <!-- 店铺数据概览 -->
        <div class="shop-data-overview">
          <div class="shop-data-item">
            <div class="shop-data-value">{{ dashboardData.totalProducts || 0 }}</div>
            <div class="shop-data-label">{{ t('products.totalProducts') }}</div>
          </div>
          <div class="shop-data-item">
            <div class="shop-data-value-container">
              <div class="shop-data-value">{{ dashboardData.sellerCredit || 0 }}</div>
              <el-tooltip 
                :content="t('dashboard.sellerCreditTip')" 
                placement="top"
                effect="light"
              >
                <el-icon class="info-icon-top"><InfoFilled /></el-icon>
              </el-tooltip>
            </div>
            <div class="shop-data-label">{{ t('dashboard.sellerCredit') }}</div>
          </div>
          <div class="shop-data-item">
            <div class="shop-data-value">{{ dashboardData.shopFollowers || 0 }}</div>
            <div class="shop-data-label">{{ t('dashboard.shopFollowers') }}</div>
          </div>
        </div>

      </el-card>
    </div>


    <!-- 第一行：财务概览 -->
    <div class="dashboard-section">
      <el-card class="finance-card">
        <div class="finance-stats">        
          <!-- 销售总额 -->
          <div class="finance-item">
            <div class="finance-icon" style="background-color: #67C23A15">
              <el-icon style="color: #67C23A"><Money /></el-icon>
            </div>
            <div class="finance-content">
              <div class="finance-value">{{ formatMoney(dashboardData.totalSales) }}</div>
              <div class="finance-label-wrapper" style="margin-top: 10px;text-align: center;">
                <div class="finance-label">{{ t('finance.totalSales') }}</div>
              </div>
            </div>
          </div>
          
          <!-- 总利润 -->
          <div class="finance-item">
            <div class="finance-icon" style="background-color: #E6A23C15">
              <el-icon style="color: #E6A23C"><DataLine /></el-icon>
            </div>
            <div class="finance-content">
              <div class="finance-value">{{ formatMoney(dashboardData.totalProfit) }}</div>
              <div class="finance-label-wrapper" style="margin-top: 10px;text-align: center;">
                <div class="finance-label">{{ t('finance.totalProfit') }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 第二行：订单概览 -->
    <div class="dashboard-section">
      <div class="stats-row">
        <!-- 总订单数卡片 -->
        <div class="stats-card order-card">
          <div class="stats-icon" style="background-color: #409EFF10">
            <el-icon style="color: #409EFF"><Document /></el-icon>
          </div>
          <div class="order-stats-content">
            <div class="order-stats-value">{{ dashboardData.totalOrders || 0 }}</div>
            <div class="order-stats-label-wrapper">
              <div class="order-stats-label">{{ t('dashboard.totalOrders') }}</div>
            </div>
          </div>
        </div>
        
        <!-- 进行中订单卡片 -->
        <div class="stats-card order-card">
          <div class="stats-icon" style="background-color: #E6A23C10">
            <el-icon style="color: #E6A23C"><RefreshRight /></el-icon>
          </div>
          <div class="order-stats-content">
            <div class="order-stats-value">{{ dashboardData.processingOrders || 0 }}</div>
            <div class="order-stats-label-wrapper">
              <div class="order-stats-label">{{ t('dashboard.processingOrders') }}</div>
            </div>
          </div>
        </div>
        
        <!-- 已完成订单卡片 -->
        <div class="stats-card order-card">
          <div class="stats-icon" style="background-color: #67C23A10">
            <el-icon style="color: #67C23A"><CircleCheck /></el-icon>
          </div>
          <div class="order-stats-content">
            <div class="order-stats-value">{{ dashboardData.completedOrders || 0 }}</div>
            <div class="order-stats-label-wrapper">
              <div class="order-stats-label">{{ t('dashboard.completedOrders') }}</div>
            </div>
          </div>
        </div>
        
        <!-- 退款订单卡片 -->
        <div class="stats-card order-card">
          <div class="stats-icon" style="background-color: #F56C6C10">
            <el-icon style="color: #F56C6C"><TurnOff /></el-icon>
          </div>
          <div class="order-stats-content">
            <div class="order-stats-value">{{ dashboardData.refundedOrders || 0 }}</div>
            <div class="order-stats-label-wrapper">
              <div class="order-stats-label">{{ t('dashboard.refundOrders') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 其他统计 -->
    <div class="dashboard-section">
      <!-- 今日数据卡片 -->
      <el-card class="today-stats-card">
        <div class="today-stats-title">{{ t('dashboard.todayStats') }}</div>
        <div class="today-stats-grid">
          <!-- 今日商品浏览量 -->
          <div class="today-stats-item">
            <div class="stats-icon small" style="background-color: #67C23A10">
              <el-icon style="color: #67C23A"><Reading /></el-icon>
            </div>
            <div class="today-stats-content">
              <div class="today-stats-value">{{ dashboardData.todayProductViews || 0 }}</div>
              <div class="today-stats-label-wrapper">
                <div class="today-stats-label">{{ t('dashboard.todayViews') }}</div>
              </div>
            </div>
          </div>
          
          <!-- 今日访客 -->
          <div class="today-stats-item">
            <div class="stats-icon small" style="background-color: #409EFF10">
              <el-icon style="color: #409EFF"><View /></el-icon>
            </div>
            <div class="today-stats-content">
              <div class="today-stats-value">{{ dashboardData.todayVisitors || 0 }}</div>
              <div class="today-stats-label-wrapper">
                <div class="today-stats-label">{{ t('dashboard.todayVisitors') }}</div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <!-- <div class="other-stats-section">
        <div class="section-title">{{ t('dashboard.otherStats') }}</div>
        <div class="other-stats-grid"> -->
          <!-- 今日商品浏览量 -->
          <!-- <div class="other-stats-item">
            <div class="stats-icon small" style="background-color: #67C23A10">
              <el-icon style="color: #67C23A"><Reading /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-title small">{{ t('dashboard.todayViews') }}</div>
              <div class="stats-value small">{{ dashboardData.todayProductViews || 0 }}</div>
            </div>
          </div> -->
          
          <!-- 今日访客 -->
          <!-- <div class="other-stats-item">
            <div class="stats-icon small" style="background-color: #409EFF10">
              <el-icon style="color: #409EFF"><View /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-title small">{{ t('dashboard.todayVisitors') }}</div>
              <div class="stats-value small">{{ dashboardData.todayVisitors || 0 }}</div>
            </div>
          </div> -->
          
          <!-- 综合评分 -->
          <!-- <div class="other-stats-item">
            <div class="stats-icon small" style="background-color: #E6A23C10">
              <el-icon style="color: #E6A23C"><Star /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-title small">{{ t('dashboard.overallRating') }}</div>
              <div class="stats-value small">{{ Number(dashboardData.overallRating).toFixed(1) || '0.0' }}/5</div>
            </div>
          </div> -->
          
          <!-- 卖家信用分 -->
          <!-- <div class="other-stats-item">
            <div class="stats-icon small" style="background-color: #409EFF10">
              <el-icon style="color: #409EFF"><ChatDotRound /></el-icon>
            </div>
            <div class="stats-content">
              <div class="stats-title small">
                {{ t('dashboard.sellerCredit') }}
                <el-tooltip 
                  :content="t('dashboard.sellerCreditTip')" 
                  placement="top"
                  effect="light"
                >
                  <el-icon class="info-icon"><InfoFilled /></el-icon>
                </el-tooltip>
              </div>
              <div class="stats-value small">{{ dashboardData.sellerCredit || 0 }}/100</div>
            </div>
          </div>
        </div>
      </div> -->
    </div>

    <!-- 订单图表 -->
    <div class="dashboard-section">
      <div class="chart-section">
        <div class="chart-header">
          <div class="chart-tabs">
            <div 
              class="chart-tab" 
              :class="{ active: chartType === 'orders' }" 
              @click="handleTabClick('orders')"
            >
              {{ t('dashboard.orderStats') }}
            </div>
            <div 
              class="chart-tab" 
              :class="{ active: chartType === 'views' }" 
              @click="handleTabClick('views')"
            >
              {{ t('dashboard.viewStats') }}
            </div>
            <div 
              class="chart-tab" 
              :class="{ active: chartType === 'visitors' }" 
              @click="handleTabClick('visitors')"
            >
              {{ t('dashboard.visitorStats') }}
            </div>
          </div>
        </div>
        <div ref="orderChartRef" class="order-chart" :key="chartType">
          <el-skeleton v-if="loading" animated>
            <template #template>
              <div style="height: 220px"></div>
            </template>
          </el-skeleton>
        </div>
      </div>
    </div>

    <!-- 热销商品和浏览量排行 -->
    <div class="dashboard-section">
      <div class="rankings-section">
        <div class="section-title">
          <div class="tab-switch">
            <div 
              class="tab" 
              :class="{ active: activeProductType === 'sales' }" 
              @click="activeProductType = 'sales'"
            >
              {{ t('dashboard.salesRank') }}
            </div>
            <div 
              class="tab" 
              :class="{ active: activeProductType === 'views' }" 
              @click="activeProductType = 'views'"
            >
              {{ t('dashboard.viewsRank') }}
            </div>
          </div>
        </div>
        <div class="ranking-list">
          <div v-for="(product, index) in activeProducts" :key="index" class="ranking-item">
            <div class="ranking-rank" :class="{ 'top3': index < 3 }">{{ index + 1 }}</div>
            <div class="ranking-image">
              <el-image :src="product.image || product.productImage" fit="cover"></el-image>
            </div>
            <div class="ranking-info" @click="showProductDetail(product)">
              <div class="ranking-name-wrapper">
                <div class="ranking-name">{{ product.name || product.productName }}</div>
                <div class="ranking-count">
                  <span v-if="activeProductType === 'sales'">{{ product.sales }}</span>
                  <span v-else>{{ product.views }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 商品详情弹窗 -->
    <el-dialog
      v-model="productDetailVisible"
      width="90%"
      top="15vh"
      :show-close="true"
      :before-close="closeProductDetail"
      class="product-detail-dialog"
    >
      <div class="product-detail-image">
        <el-image :src="selectedProduct?.image || selectedProduct?.productImage" fit="cover"></el-image>
      </div>
      <div class="product-detail-name">{{ selectedProduct?.name || selectedProduct?.productName }}</div>
      <div class="product-detail-data">
        <div class="detail-label">{{ activeProductType === 'sales' ? t('dashboard.sales') : t('dashboard.views') }}</div>
        <div class="detail-value">{{ activeProductType === 'sales' ? selectedProduct?.sales : selectedProduct?.views }}</div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import * as echarts from 'echarts'
import { formatMoney } from '@/utils/format'
import {
  Money,
  Goods,
  Star,
  Document,
  CircleCheck,
  RefreshRight,
  TurnOff,
  ChatDotRound,
  Collection,
  View,
  DataLine,
  Wallet,
  Reading,
  InfoFilled,
} from '@element-plus/icons-vue'
import { getDashboardData, getDashboardChartData, getHotSalesProducts, getTopViewedProducts } from '@/api/dashboard'

const { t } = useI18n()

const shopLogo = ref(sessionStorage.getItem('shopLogo'))
const shopName = ref(sessionStorage.getItem('shopName'))

// 商品类型切换
const activeProductType = ref('sales')

// 仪表盘数据
const dashboardData = ref({
  walletBalance: '0.00',
  totalSales: '7,540.00',
  totalProfit: '1,540.00',
  totalOrders: 0,
  processingOrders: 0,
  completedOrders: 0,
  refundedOrders: 0,
  totalProducts: 0,
  todayProductViews: 0,
  todayVisitors: 512,
  overallRating: 0,
  sellerCredit: 0,
  shopFollowers: 0
})

// 热销商品数据
const topSellingProducts = ref([])

// 浏览量商品数据
const topViewedProducts = ref([])

// 获取仪表盘数据
const fetchDashboardData = () => {
  const params = {
    userId: sessionStorage.getItem('userId'),
    shopId: sessionStorage.getItem('shopId')
  }
  getDashboardData(params).then(res => {
    if(res.code === 0) {
      dashboardData.value = {
        ...dashboardData.value,
        ...res.data
      }
    }
  }).catch(err => {
    console.log(err)
  })
}

// 获取热销商品数据
const fetchHotSalesProducts = () => {
  const params = {
    shopId: sessionStorage.getItem('shopId')
  }
  getHotSalesProducts(params).then(res => {
    if (res.code === 0 && Array.isArray(res.data)) {
      topSellingProducts.value = res.data
    }
  }).catch(err => {
    console.log(err)
  })
}

// 获取热门浏览商品数据
const fetchTopViewedProducts = () => {
  const params = {
    shopId: sessionStorage.getItem('shopId')
  }
  getTopViewedProducts(params).then(res => {
    if (res.code === 0 && Array.isArray(res.data)) {
      topViewedProducts.value = res.data
    }
  }).catch(err => {
    console.log(err)
  })
}

// 根据当前选择的类型返回对应的商品列表
const activeProducts = computed(() => {
  return activeProductType.value === 'sales' 
    ? topSellingProducts.value.slice(0, 10) 
    : topViewedProducts.value.slice(0, 10)
})

// 图表相关
const chartType = ref('orders')
const loading = ref(false)
const orderChartRef = ref(null)
let orderChart = null

// 获取当前日期和近30天的日期范围
const getCurrentDateRange = () => {
  const dates = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(today.getDate() - i)
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    dates.push(`${month}-${day}`)
  }
  
  return dates.slice(-14) // 移动端只显示最近14天数据
}

// 近30天数据
const last30DaysData = ref({
  orders: {},
  views: {},
  visitors: {}
})

// 计算当前图表颜色
const currentChartColor = computed(() => {
  switch (chartType.value) {
    case 'orders':
      return '#409EFF'
    case 'views':
      return '#67C23A'
    case 'visitors':
      return '#E6A23C'
    default:
      return '#409EFF'
  }
})

// 处理窗口大小变化
const handleResize = () => {
  if (orderChart) {
    orderChart.resize()
  }
}

// 清理图表实例和事件监听器
const cleanupChart = () => {
  if (orderChart) {
    orderChart.dispose()
    orderChart = null
  }
  window.removeEventListener('resize', handleResize)
}

// 获取图表数据
const fetchChartData = async (type) => {
  loading.value = true
  try {
    const params = {
      shopId: sessionStorage.getItem('shopId'),
      type: type
    }
    const res = await getDashboardChartData(params)
    if (res.code === 0 && res.data) {
      last30DaysData.value[type] = res.data
    }
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

// 切换图表类型
const handleTabClick = (type) => {
  if (type === chartType.value) return
  
  chartType.value = type
  
  // 完全重新初始化图表
  cleanupChart()
  
  // 确保DOM更新后再初始化
  nextTick(() => {
    initOrderChart()
  })
}

// 初始化订单图表
const initOrderChart = () => {
  if (!orderChartRef.value) {
    return
  }
  
  // 获取日期范围
  const dates = getCurrentDateRange()
  
  // 获取当前类型的数据
  const currentData = last30DaysData.value[chartType.value]
  if (!currentData) {
    return
  }
  
  // 准备图表数据
  const chartData = dates.map(date => {
    return currentData[date] || 0
  })
  
  // 计算Y轴最大值
  let yAxisMax = 0
  if (chartData.length > 0) {
    const maxValue = Math.max(...chartData)
    yAxisMax = Math.ceil(maxValue * 1.2)
  }
  
  try {
    // 如果图表实例存在，先销毁
    if (orderChart) {
      orderChart.dispose()
      orderChart = null
    }
    
    // 创建新的图表实例
    orderChart = echarts.init(orderChartRef.value)
    
    // 设置图表选项
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '20px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          interval: 2,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisMax > 0 ? yAxisMax : null,
        axisLabel: {
          fontSize: 10
        }
      },
      series: [
        {
          type: 'bar',
          data: chartData,
          itemStyle: {
            color: currentChartColor.value
          },
          barWidth: '60%'
        }
      ]
    }
    
    // 使用setOption更新图表
    orderChart.setOption(option)
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize)
  } catch (error) {
    console.error('图表初始化失败:', error)
  }
}

// 组件卸载时清理
onUnmounted(() => {
  cleanupChart()
})

// 组件挂载后初始化
onMounted(async () => {
  await nextTick()
  fetchDashboardData()
  fetchHotSalesProducts()
  fetchTopViewedProducts()
  
  // 初始化时获取所有类型的数据
  await Promise.all([
    fetchChartData('orders'),
    fetchChartData('views'),
    fetchChartData('visitors')
  ])
  
  // 等待DOM更新后初始化图表
  await nextTick()
  initOrderChart()
  window.addEventListener('resize', handleResize)
})

// 添加商品弹窗相关代码
const productDetailVisible = ref(false)
const selectedProduct = ref(null)

const showProductDetail = (product) => {
  selectedProduct.value = product
  productDetailVisible.value = true
}

const closeProductDetail = () => {
  selectedProduct.value = null
  productDetailVisible.value = false
}

// 评分格式化
const scoreTemplate = (score) => {
  // 将评分四舍五入到一位小数
  return Math.round(score * 10) / 10
}

// 计算评分
const rating = computed(() => {
  const score = Number(dashboardData.value.overallRating) || 5
  return scoreTemplate(score)
})
</script>

<style scoped>
.mobile-shop {
  min-height: 100vh;
  background: #f5f7fa;
  width: 100%;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  overflow: hidden;
}

.shop-info-container {
  padding: 8px;
  width: 100%;
  box-sizing: border-box;
}

.shop-info-card {
  position: relative;
  width: 100%;
  height: 180px;
  box-sizing: border-box;
  border-radius: 8px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e6f7f2 100%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* 添加装饰元素 */
.shop-info-card::before {
  content: '';
  position: absolute;
  top: -30px;
  right: -30px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(103, 194, 58, 0.1) 100%);
}

.shop-info-card::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: -20px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1) 0%, rgba(64, 158, 255, 0.1) 100%);
}

.shop-info-card-logo {
  height: 80px;
  width: 80px;
  position: absolute;
  top: 0px;
  right: 10px;
}

.shop-info-card-user {
  display: flex;
  align-items: self-start;
  justify-content: flex-start;
  gap: 10px;
  position: absolute;
  left: 20px;
  top: 20px;
}

.shop-info-card-logo-img {
  height: 100%;
  width: 100%;
  object-fit: cover;
}

.shop-info-card-user-level {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.shop-name {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  text-align: left;
  margin-bottom: 0px;
}

.shop-info-card-user-level-star {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 仪表盘区域样式 */
.dashboard-section {
  margin-bottom: 6px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 8px; /* 添加水平内边距确保一致性 */
}

.stats-row {
  padding: 8px 0;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
}

.finance-stats-row {
  padding: 8px 0;
  margin-top: 0;
  width: 100%;
  box-sizing: border-box;
}

.finance-card {
  border-radius: 10px;
  margin-top: 8px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.finance-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.finance-stats {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.finance-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.finance-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

.finance-icon .el-icon {
  font-size: 18px;
}

.finance-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 65px; /* 固定高度 */
  position: relative;
  align-items: center; /* 水平居中 */
  text-align: center;
}

.finance-value {
  font-size: 16px;
  font-weight: 600;
  color: red;
  position: absolute; /* 绝对定位 */
  top: 6px; /* 向下移动6px */
  /* 移除左侧定位，允许居中 */
  width: 100%; /* 占据整个宽度以便于居中 */
  text-align: center;
}

.finance-label-wrapper {
  position: absolute;
  top: 30px; /* 相应增加顶部距离，保持与数值的间距 */
  left: 0;
  right: 0;
  text-align: center; /* 文本居中 */
  width: 100%;
}

.finance-label {
  font-size: 12px;
  color: #606266;
  word-break: break-word;
  line-height: 1.3;
  text-align: center;
  margin: 0 auto; /* 居中显示 */
}

.stats-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.stats-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stats-icon.small {
  width: 28px;
  height: 28px;
}

.stats-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stats-title {
  font-size: 12px;
  color: #606266;
  margin-bottom: 2px;
  font-weight: 500;
}

.stats-title.small {
  font-size: 12px;
  margin-bottom: 2px;
}

.stats-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stats-value.small {
  font-size: 16px;
}

/* 今日数据卡片样式 */
.today-stats-card {
  border-radius: 10px;
  margin-bottom: 12px;
  overflow: hidden;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.today-stats-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.today-stats-grid {
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.today-stats-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.today-stats-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 60px;
  align-items: center;
  text-align: center;
}

.today-stats-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  position: absolute;
  top: 0;
  width: 100%;
  text-align: center;
}

.today-stats-label-wrapper {
  position: absolute;
  top: 28px;
  left: 0;
  right: 0;
  text-align: center;
  width: 100%;
}

.today-stats-label {
  font-size: 13px;
  color: #606266;
  word-break: break-word;
  line-height: 1.3;
  text-align: center;
  margin: 0 auto;
}

@media (max-width: 375px) {
  .today-stats-grid {
    flex-direction: column;
    gap: 12px;
  }
  
  .today-stats-item {
    width: 100%;
  }
}

/* 其他统计 */
.other-stats-section {
  padding: 10px 8px;
  background: #fff;
  box-sizing: border-box;
  width: 100%;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.other-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.other-stats-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 4px;
  background-color: #f9f9f9;
  border-radius: 6px;
  text-align: center;
}

.other-stats-item .stats-icon.small {
  margin-bottom: 4px;
}

.other-stats-item .stats-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 信息图标样式 */
.info-icon {
  font-size: 12px;
  color: #909399;
  margin-left: 4px;
  cursor: help;
  vertical-align: middle;
}

.other-stats-item .stats-title.small {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 图表区域 */
.chart-section {
  padding: 10px 8px;
  background: #fff;
  box-sizing: border-box;
  width: 100%;
}

.chart-header {
  display: flex;
  justify-content: center;
  margin-bottom: 10px;
}

.chart-tabs {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  width: 100%;
}

.chart-tab {
  flex: 1;
  padding: 6px 8px;
  cursor: pointer;
  background-color: #f5f7fa;
  color: #606266;
  font-size: 12px;
  transition: all 0.3s;
  user-select: none;
  border-right: 1px solid #dcdfe6;
  text-align: center;
  white-space: nowrap;
}

.chart-tab:last-child {
  border-right: none;
}

.chart-tab.active {
  background-color: #409EFF;
  color: #ffffff;
  font-weight: 500;
}

.order-chart {
  width: 100%;
  height: 180px;
}

/* 排行榜区域 */
.rankings-section {
  padding: 10px 8px;
  background: #fff;
  box-sizing: border-box;
  width: 100%;
}

.tab-switch {
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
  margin-top: 10px;
  width: 100%;
}

.tab {
  flex: 1;
  padding: 10px 0;
  font-size: 14px;
  background-color: #f5f7fa;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
  border-right: 1px solid #dcdfe6;
  text-align: center;
  font-weight: 500;
}

.tab:last-child {
  border-right: none;
}

.tab.active {
  background-color: #409EFF;
  color: #ffffff;
  font-weight: 600;
}

.ranking-list {
  margin-top: 10px;
}

.ranking-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  gap: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-item:last-child {
  border-bottom: none;
}

.ranking-rank {
  min-width: 30px;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #606266;
  font-weight: bold;
  border-radius: 4px;
  font-size: 14px;
}

.ranking-rank.top3 {
  background-color: #409EFF;
  color: white;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.2);
}

.ranking-item:nth-child(1) .ranking-rank.top3 {
  background: linear-gradient(135deg, #FF4500, #FF6347);
  box-shadow: 0 2px 6px rgba(255, 99, 71, 0.3);
  font-size: 16px;
}

.ranking-item:nth-child(2) .ranking-rank.top3 {
  background: linear-gradient(135deg, #FFA500, #FFD700);
  box-shadow: 0 2px 6px rgba(255, 215, 0, 0.3);
  font-size: 15px;
}

.ranking-item:nth-child(3) .ranking-rank.top3 {
  background: linear-gradient(135deg, #20B2AA, #48D1CC);
  box-shadow: 0 2px 6px rgba(32, 178, 170, 0.3);
}

.ranking-item:nth-child(1) {
  background-color: rgba(255, 99, 71, 0.05);
  border-radius: 8px;
  margin-bottom: 4px;
}

.ranking-item:nth-child(2) {
  background-color: rgba(255, 215, 0, 0.05);
  border-radius: 8px;
  margin-bottom: 4px;
}

.ranking-item:nth-child(3) {
  background-color: rgba(32, 178, 170, 0.05);
  border-radius: 8px;
  margin-bottom: 4px;
}

.ranking-image {
  width: 36px;
  height: 36px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ebeef5;
}

.ranking-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ranking-info {
  flex: 1;
  overflow: hidden;
  cursor: pointer;
}

.ranking-name-wrapper {
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
}

.ranking-name {
  font-size: 13px;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.ranking-count {
  font-size: 13px;
  color: #F56C6C;
  font-weight: 600;
  margin-right: 10px;
}

/* 响应式布局 */
@media (max-width: 360px) {
  .other-stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 576px) {
  .stats-row {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* 商品详情弹窗样式 */
.product-detail-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.product-detail-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-detail-name {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.4;
}

.product-detail-data {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-detail-data:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #909399;
  margin-right: 12px;
  min-width: 70px;
}

.detail-value {
  font-size: 16px;
  color: #F56C6C;
  font-weight: 600;
}

/* 商品详情弹窗全局样式 */
:deep(.product-detail-dialog .el-dialog__header) {
  padding: 0;
  height: 0;
}

:deep(.product-detail-dialog .el-dialog__title) {
  display: none;
}

:deep(.product-detail-dialog .el-dialog__body) {
  padding: 20px;
}

.shop-info-card-user-level-star {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-text {
  font-size: 14px;
  color: #F7BA2A;
  font-weight: 500;
}

:deep(.el-rate) {
  display: inline-flex;
  align-items: center;
}

:deep(.el-rate__icon) {
  font-size: 16px;
  margin-right: 4px;
}

:deep(.el-rate__decimal) {
  position: absolute;
  top: 0;
  left: 0;
  display: inline-flex;
  overflow: hidden;
}

/* 店铺数据概览样式 */
.shop-data-overview {
  position: absolute;
  bottom: 15px;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding: 0 15px;
  box-sizing: border-box;
}

.shop-data-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.shop-data-value-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.shop-data-value {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 4px;
}

.shop-data-label-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.shop-data-label {
  font-size: 12px;
  color: #606266;
}

.info-icon-top {
  font-size: 12px;
  color: #909399;
  cursor: help;
  position: absolute;
  top: 0;
  right: -14px;
}

.order-stats-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  height: 60px;
  align-items: center;
  text-align: center;
}

.order-stats-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  position: absolute;
  top: 0;
  width: 100%;
  text-align: center;
}

.order-stats-label-wrapper {
  position: absolute;
  top: 28px;
  left: 0;
  right: 0;
  text-align: center;
  width: 100%;
}

.order-stats-label {
  font-size: 13px;
  color: #606266;
  word-break: break-word;
  line-height: 1.3;
  text-align: center;
  margin: 0 auto;
}
</style> 
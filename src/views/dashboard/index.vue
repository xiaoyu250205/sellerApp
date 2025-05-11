<script setup>
import { ref, onMounted, computed, nextTick, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
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
  InfoFilled
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { getDashboardData, getDashboardChartData, getHotSalesProducts, getTopViewedProducts } from '@/api/dashboard'
const { t, locale } = useI18n()

const dashboardData = ref({})
// 金额格式化函数
const formatMoney = (value) => {
      if (!value) return '0.00'
      return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    }   

const fetchDashboardData = () => {
  const params = {
    userId: sessionStorage.getItem('userId'),
    shopId: sessionStorage.getItem('shopId')
  }
  getDashboardData(params).then(res => {
    // 格式化数据
    const data = res.data || {}
    dashboardData.value = {
      walletBalance: formatMoney(data.walletBalance),
      totalSales: formatMoney(data.totalSales),
      totalProfit: formatMoney(data.totalProfit),
      totalOrders: data.totalOrders || 0,
      processingOrders: data.processingOrders || 0,
      completedOrders: data.completedOrders || 0,
      refundedOrders: data.refundedOrders || 0,
      totalProducts: data.totalProducts || 0,
      todayProductViews: data.todayProductViews || 0,
      todayVisitors: data.todayVisitors || 0,
      overallRating: data.overallRating ? Number(data.overallRating).toFixed(1) : 5,
      sellerCredit: data.sellerCredit || 0,
      shopFollowers: data.shopFollowers || 0
    }
  }).catch(err => {
    console.log(err)
  })
}



// 热销商品TOP10 - 直接使用虚拟数据
const topSellingProducts = ref()

const fetchHotSalesProducts = () => {
  const params = {
    shopId: sessionStorage.getItem('shopId')
  }
  getHotSalesProducts(params).then(res => {
    topSellingProducts.value = res.data
  }).catch(err => {
    console.log(err)
  })
} 
// 浏览量TOP10 - 直接使用虚拟数据
const topViewedProducts = ref()

const fetchTopViewedProducts = () => {
  const params = {
    shopId: sessionStorage.getItem('shopId')
  }
  getTopViewedProducts(params).then(res => {
    topViewedProducts.value = res.data
  }).catch(err => {
    console.log(err)
  })
}
// 图表类型切换
const chartType = ref('orders') // 'orders', 'views', 'visitors'

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
  
  // 输出日期范围信息以便调试
  // console.log('当前日期范围:', dates)
  return dates
}

// 近30天数据（模拟后端返回的数据格式）
const last30DaysData = ref({
  orders: {},
  views: {},
  visitors: {}
})

// 计算当前图表标题
const currentChartTitle = computed(() => {
  switch (chartType.value) {
    case 'orders':
      return t('dashboard.last30DaysOrders')
    case 'views':
      return t('dashboard.last30DaysViews')
    case 'visitors':
      return t('dashboard.last30DaysVisitors')
    default:
      return t('dashboard.last30DaysOrders')
  }
})

// 计算当前图表的颜色
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

// 加载数据
const loading = ref(false)
const orderChartRef = ref(null)
let orderChart = null

// 清理图表实例和事件监听器
const cleanupChart = () => {
  if (orderChart) {
    orderChart.dispose()
    orderChart = null
  }
  window.removeEventListener('resize', handleResize)
}

// 处理窗口大小变化
const handleResize = () => {
  if (orderChart) {
    orderChart.resize()
  }
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
    if (res.data) {
      last30DaysData.value[type] = res.data
    }
  } catch (err) {
    console.log(err)
  } finally {
    loading.value = false
  }
}

// 切换图表类型
const switchChartType = (type) => {
  // console.log('切换图表类型', type, '当前类型', chartType.value)
  
  if (type === chartType.value) return
  
  chartType.value = type
  // console.log('设置新类型', chartType.value)
  
  // 完全重新初始化图表
  cleanupChart()
  
  // 使用nextTick确保DOM更新后再初始化
  nextTick(() => {
    // console.log('DOM更新后初始化图表', chartType.value)
    initOrderChart()
  })
}

// 处理选项卡点击
const handleTabClick = (type) => {
  // console.log('选项卡点击:', type)
  switchChartType(type)
}

// 初始化订单图表
const initOrderChart = () => {
  if (!orderChartRef.value) {
    // console.error('图表容器不存在')
    return
  }
  
  // 获取日期范围
  const dates = getCurrentDateRange()
  
  // 获取当前类型的数据
  const currentData = last30DaysData.value[chartType.value]
  if (!currentData) {
    // console.error('没有', chartType.value, '类型的数据')
    return
  }
  
  // 准备图表数据
  const chartData = dates.map(date => {
    return currentData[date] || 0
  })
  
  // console.log('图表数据准备完成:', chartType.value, chartData)
  
  // 计算Y轴最大值以确保数据完全展示
  let yAxisMax = 0
  if (chartData.length > 0) {
    const maxValue = Math.max(...chartData)
    // 将最大值增加20%作为Y轴最大值，确保数据可视化效果更好
    yAxisMax = Math.ceil(maxValue * 1.2)
  }
  
  // 根据数据类型确定Y轴刻度
  let yAxisInterval = 10; // 默认间隔
  
  if (chartType.value === 'views') {
    // 如果是浏览量数据，使用更大的间隔
    yAxisInterval = 500;
  } else if (chartType.value === 'visitors') {
    // 如果是访客数据，使用中等间隔
    yAxisInterval = 200;
  } else {
    // 订单数据使用较小间隔
    yAxisInterval = 10;
  }
  
  try {
    // 如果图表实例存在，先销毁
    if (orderChart) {
      // console.log('销毁旧图表实例')
      orderChart.dispose()
      orderChart = null
    }
    
    // 创建新的图表实例
    // console.log('创建新图表实例')
    orderChart = echarts.init(orderChartRef.value)
    
    // 设置图表选项
    const option = {
      title: {
        text: currentChartTitle.value,
        left: 'center',
        top: 0,
        textStyle: {
          fontSize: 14,
          fontWeight: 'normal'
        }
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        },
        formatter: function(params) {
          const data = params[0];
          return `${data.name}: ${data.value}`;
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: '50px',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLabel: {
          interval: 4,
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: yAxisMax > 0 ? yAxisMax : null,
        minInterval: 1,
        interval: yAxisInterval,
        axisLabel: {
          fontSize: 10,
          formatter: function(value) {
            // 对于大数值显示K单位
            if (chartType.value === 'views' && value >= 1000) {
              return (value / 1000).toFixed(1) + 'K';
            }
            return value;
          }
        }
      },
      series: [
        {
          name: currentChartTitle.value,
          type: 'bar',
          data: chartData,
          itemStyle: {
            color: currentChartColor.value
          },
          emphasis: {
            itemStyle: {
              color: currentChartColor.value === '#409EFF' ? '#66b1ff' : 
                     currentChartColor.value === '#67C23A' ? '#85ce61' : '#ebcb8d'
            }
          },
          barWidth: '60%'
        }
      ]
    }
    
    // 使用setOption更新图表
    // console.log('正在设置图表选项', option)
    orderChart.setOption(option)
    
    // 添加窗口大小变化监听器
    window.addEventListener('resize', handleResize)
    
    // console.log('图表初始化完成，类型:', chartType.value, '标题:', currentChartTitle.value, '颜色:', currentChartColor.value)
  } catch (error) {
    // console.error('图表初始化失败:', error)
  }
}

// 组件卸载时清理
onUnmounted(() => {
  cleanupChart()
})

// 组件挂载后初始化
onMounted(async () => {
  await fetchDashboardData()
  await fetchHotSalesProducts()
  await fetchTopViewedProducts()
  // 初始化时获取所有类型的数据
  await Promise.all([
    fetchChartData('orders'),
    fetchChartData('views'),
    fetchChartData('visitors')
  ])
  // 等待DOM更新后初始化图表
  await nextTick()
  initOrderChart()
})

// 监听语言变化
watch(
  () => locale.value,
  () => {
    // 完全重新初始化图表
    nextTick(() => {
      cleanupChart()
      initOrderChart()
    })
  }
)
</script>

<template>
  <div class="dashboard-container">
    <!-- 第一行：财务概览 -->
    <div class="dashboard-section">
      <div class="stats-row">
        <!-- 钱包余额卡片 -->
        <div class="stats-card finance-card">
          <div class="stats-icon" style="background-color: #409EFF10">
            <el-icon style="color: #409EFF"><Wallet /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">{{t('dashboard.walletBalance')}}</div>
            <div class="stats-value">${{ dashboardData.walletBalance }}</div>
          </div>
        </div>
        
        <!-- 销售总额卡片 -->
        <div class="stats-card finance-card">
          <div class="stats-icon" style="background-color: #67C23A10">
            <el-icon style="color: #67C23A"><Money /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">{{t('dashboard.totalSales')}}</div>
            <div class="stats-value">${{ dashboardData.totalSales }}</div>
          </div>
        </div>
        
        <!-- 总利润卡片 -->
        <div class="stats-card finance-card">
          <div class="stats-icon" style="background-color: #E6A23C10">
            <el-icon style="color: #E6A23C"><DataLine /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">{{t('dashboard.totalProfit')}}</div>
            <div class="stats-value">${{ dashboardData.totalProfit }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第二行：订单概览 -->
    <div class="dashboard-section">
      <div class="stats-row">
        <!-- 总订单数卡片 -->
        <div class="stats-card order-card">
          <div class="stats-icon" style="background-color: #409EFF10">
            <el-icon style="color: #409EFF"><Document /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">{{t('dashboard.totalOrders')}}</div>
            <div class="stats-value">{{ dashboardData.totalOrders }}</div>
          </div>
        </div>
        
        <!-- 进行中订单卡片 -->
        <div class="stats-card order-card">
          <div class="stats-icon" style="background-color: #E6A23C10">
            <el-icon style="color: #E6A23C"><RefreshRight /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">{{t('dashboard.processingOrders')}}</div>
            <div class="stats-value">{{ dashboardData.processingOrders }}</div>
          </div>
        </div>
        
        <!-- 已完成订单卡片 -->
        <div class="stats-card order-card">
          <div class="stats-icon" style="background-color: #67C23A10">
            <el-icon style="color: #67C23A"><CircleCheck /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">{{t('dashboard.completedOrders')}}</div>
            <div class="stats-value">{{ dashboardData.completedOrders }}</div>
          </div>
        </div>
        
        <!-- 退款订单卡片 -->
        <div class="stats-card order-card">
          <div class="stats-icon" style="background-color: #F56C6C10">
            <el-icon style="color: #F56C6C"><TurnOff /></el-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">{{t('dashboard.refundOrders')}}</div>
            <div class="stats-value">{{ dashboardData.refundedOrders }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 第三行：其他统计和订单图表 -->
    <div class="dashboard-section">
      <div class="stats-row combined-row">
        <!-- 其他统计大卡片 -->
        <el-card class="big-card" shadow="never">
          <div class="big-card-title">{{t('dashboard.otherStats')}}</div>
          <div class="other-stats-grid">
            <!-- 商品总数 -->
            <div class="other-stats-item">
              <div class="stats-icon small" style="background-color: #409EFF10">
                <el-icon style="color: #409EFF"><Goods /></el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-title small">{{t('dashboard.totalProducts')}}</div>
                <div class="stats-value small">{{ dashboardData.totalProducts }}</div>
              </div>
            </div>
            
            <!-- 今日商品浏览量 -->
            <div class="other-stats-item">
              <div class="stats-icon small" style="background-color: #67C23A10">
                <el-icon style="color: #67C23A"><Reading /></el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-title small">{{t('dashboard.todayViews')}}</div>
                <div class="stats-value small">{{ dashboardData.todayProductViews }}</div>
              </div>
            </div>
            
            <!-- 今日访客 -->
            <div class="other-stats-item">
              <div class="stats-icon small" style="background-color: #409EFF10">
                <el-icon style="color: #409EFF"><View /></el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-title small">{{t('dashboard.todayVisitors')}}</div>
                <div class="stats-value small">{{ dashboardData.todayVisitors }}</div>
              </div>
            </div>
            
            <!-- 综合评分 -->
            <div class="other-stats-item">
              <div class="stats-icon small" style="background-color: #E6A23C10">
                <el-icon style="color: #E6A23C"><Star /></el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-title small">{{t('dashboard.overallRating')}}</div>
                <div class="stats-value small">{{ dashboardData.overallRating  }}/5</div>
              </div>
            </div>
            
            <!-- 卖家信用分 -->
            <div class="other-stats-item">
              <div class="stats-icon small" style="background-color: #409EFF10">
                <el-icon style="color: #409EFF"><ChatDotRound /></el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-title small">
                  {{t('dashboard.sellerCredit')}}
                  <el-tooltip :content="t('dashboard.sellerCreditTip')" placement="top">
                    <el-icon class="info-icon"><InfoFilled /></el-icon>
                  </el-tooltip>
                </div>
                <div class="stats-value small">{{ dashboardData.sellerCredit }}/100</div>
              </div>
            </div>
            
            <!-- 店铺关注 -->
            <div class="other-stats-item">
              <div class="stats-icon small" style="background-color: #F56C6C10">
                <el-icon style="color: #F56C6C"><Collection /></el-icon>
              </div>
              <div class="stats-content">
                <div class="stats-title small">{{t('dashboard.shopFollowers')}}</div>
                <div class="stats-value small">{{ dashboardData.shopFollowers }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 订单图表 -->
        <el-card class="big-card chart-card" shadow="never">
          <div class="chart-header">
            <div class="chart-tabs">
              <div 
                class="chart-tab" 
                :class="{ active: chartType === 'orders' }" 
                @click="handleTabClick('orders')"
              >
                {{t('dashboard.ordersTab')}}
              </div>
              <div 
                class="chart-tab" 
                :class="{ active: chartType === 'views' }" 
                @click="handleTabClick('views')"
              >
                {{t('dashboard.viewsTab')}}
              </div>
              <div 
                class="chart-tab" 
                :class="{ active: chartType === 'visitors' }" 
                @click="handleTabClick('visitors')"
              >
                {{t('dashboard.visitorsTab')}}
              </div>
            </div>
          </div>
          <div ref="orderChartRef" class="order-chart" :key="chartType">
            <el-skeleton v-if="loading" animated>
              <template #template>
                <div style="height: 320px"></div>
              </template>
            </el-skeleton>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 第四行：热销商品和浏览量TOP10 -->
    <div class="dashboard-section rankings">
      <div class="rankings-row">
        <!-- 热销商品TOP10 -->
        <el-card class="ranking-card" shadow="never">
          <div class="ranking-card-title">{{t('dashboard.topSellingProducts')}}</div>
          <div class="ranking-table">
            <table>
              <thead>
                <tr>
                  <th class="rank-col">{{t('dashboard.rank')}}</th>
                  <th class="image-col">{{t('dashboard.productImage')}}</th>
                  <th class="name-col">{{t('dashboard.productName')}}</th>
                  <th class="data-col">{{t('dashboard.sales')}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in topSellingProducts" :key="index">
                  <td class="rank-col">
                    <div class="ranking-rank" :class="{ 'top3': index <= 2 }">{{ index +1 }}</div>
                  </td>
                  <td class="image-col">
                    <el-image class="ranking-image" :src="product.productImage" fit="cover"></el-image>
                  </td>
                  <td class="name-col">
                    <el-tooltip :content="product.productName" placement="top" :show-after="200">
                      <div class="ranking-name">{{ product.productName }}</div>
                    </el-tooltip>
                  </td>
                  <td class="data-col">
                    <div class="ranking-data">{{ product.sales }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </el-card>

        <!-- 浏览量TOP10 -->
        <el-card class="ranking-card" shadow="never">
          <div class="ranking-card-title">{{t('dashboard.topViewedProducts')}}</div>
          <div class="ranking-table">
            <table>
              <thead>
                <tr>
                  <th class="rank-col">{{t('dashboard.rank')}}</th>
                  <th class="image-col">{{t('dashboard.productImage')}}</th>
                  <th class="name-col">{{t('dashboard.productName')}}</th>
                  <th class="data-col">{{t('dashboard.views')}}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(product, index) in topViewedProducts" :key="index">
                  <td class="rank-col">
                    <div class="ranking-rank" :class="{ 'top3': index <= 2 }">{{ index +1 }}</div>
                  </td>
                  <td class="image-col">
                    <el-image class="ranking-image" :src="product.productImage" fit="cover"></el-image>
                  </td>
                  <td class="name-col">
                    <el-tooltip :content="product.productName" placement="top" :show-after="200">
                      <div class="ranking-name">{{ product.productName }}</div>
                    </el-tooltip>
                  </td>
                  <td class="data-col">
                    <div class="ranking-data">{{ product.views }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f5f7fa;
}

.dashboard-section {
  display: flex;
  flex-direction: column;
}

.stats-row {
  display: flex;
  gap: 16px;
}

.stats-card {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 18px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s, box-shadow 0.3s;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.stats-icon {
  width: 52px;
  height: 52px;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stats-icon.small {
  width: 40px;
  height: 40px;
}

.stats-icon .el-icon {
  font-size: 26px;
}

.stats-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stats-title {
  font-size: 15px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.stats-title.small {
  font-size: 13px;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stats-value.small {
  font-size: 20px;
}

/* 大卡片样式 */
.combined-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.big-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 0;
  position: relative;
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

.big-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.big-card-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.other-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
  padding: 20px;
}

.other-stats-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 10px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.other-stats-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.chart-header {
  display: flex;
  justify-content: center;
  padding: 18px 24px 0;
}

.chart-tabs {
  display: flex;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #dcdfe6;
}

.chart-tab {
  padding: 8px 16px;
  cursor: pointer;
  background-color: #f5f7fa;
  color: #606266;
  font-size: 14px;
  transition: all 0.3s;
  user-select: none;
}

.chart-tab:not(:last-child) {
  border-right: 1px solid #dcdfe6;
}

.chart-tab:hover {
  color: #409EFF;
  background-color: #ecf5ff;
}

.chart-tab.active {
  background-color: #409EFF;
  color: white;
}

.order-chart {
  width: 100%;
  height: 320px;
}

/* 排行榜卡片样式 */
.rankings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.ranking-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 0 0 16px 0;
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.ranking-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.ranking-card-title {
  font-size: 18px;
  font-weight: 500;
  color: #303133;
  padding: 18px 24px;
  border-bottom: 1px solid #f0f0f0;
}

.ranking-table {
  padding: 0;
  overflow: visible;
  flex-grow: 1;
}

.ranking-table table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.ranking-table thead {
  background-color: #f5f7fa;
  height: 44px;
}

.ranking-table th, .ranking-table td {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  padding: 10px;
  text-align: center;
}

.ranking-table tbody tr {
  height: 52px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s;
}

.ranking-table tbody tr:hover {
  background-color: #f5f7fa;
}

.ranking-table tbody tr:last-child {
  border-bottom: none;
}

.rank-col {
  width: 80px;
}

.image-col {
  width: 150px;
}

.name-col {
  text-align: left !important;
  min-width: 200px;
}

.data-col {
  width: 120px;
}

.ranking-rank {
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f0f0;
  color: #606266;
  font-weight: bold;
  border-radius: 6px;
  margin: 0 auto;
  font-size: 14px;
}

.ranking-rank.top3 {
  background-color: #E6A23C;
  color: white;
}

tr:nth-child(1) .ranking-rank.top3 {
  background-color: #F56C6C;
}

tr:nth-child(2) .ranking-rank.top3 {
  background-color: #409EFF;
}

.ranking-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #ebeef5;
  display: inline-block;
  vertical-align: middle;
  transition: transform 0.2s;
}

.ranking-image:hover {
  transform: scale(1.1);
}

.ranking-name {
  font-size: 14px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: left;
  font-weight: 400;
  transition: color 0.2s;
  cursor: pointer;
}

.ranking-name:hover {
  color: #409EFF;
}

.ranking-data {
  font-size: 16px;
  color: #303133;
  font-weight: 600;
  text-align: center;
}

/* 媒体查询 */
@media (max-width: 1200px) {
  .combined-row,
  .rankings-row {
    grid-template-columns: 1fr;
  }
  
  .ranking-name {
    max-width: 300px;
  }
}

@media (max-width: 768px) {
  .stats-row {
    flex-direction: column;
  }
  
  .other-stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .ranking-name {
    max-width: 200px;
  }
}

@media (max-width: 480px) {
  .other-stats-grid {
    grid-template-columns: 1fr;
  }
  
  .ranking-name {
    max-width: 150px;
  }
}

.info-icon {
  margin-left: 4px;
  font-size: 14px;
  color: #909399;
  cursor: help;
}
</style> 
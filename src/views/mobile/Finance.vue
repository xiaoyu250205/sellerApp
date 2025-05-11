<template>
  <div class="mobile-finance-container">
    <div class="page-header">
      <div class="header-left">
        <el-icon class="back-icon" @click="router.back()"><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">{{ t('finance.reportTitle') }}</div>
      <div class="header-right"></div>
    </div>
    
    <!-- 数据卡片 -->
    <div class="data-cards">
      <div class="card-wrapper">
        <div class="card blue">
          <div class="card-value">{{ formatMoney(financeData.pendingAmount) }}</div>
          <div class="card-title">{{ t('finance.dataCards.pendingAmount') }}</div>
        </div>
      </div>
      <div class="card-wrapper">
        <div class="card cyan">
          <div class="card-value">{{ formatMoney(financeData.totalSales) }}</div>
          <div class="card-title">{{ t('finance.dataCards.totalSales') }}</div>
        </div>
      </div>
      <div class="card-wrapper">
        <div class="card green">
          <div class="card-value">{{ formatMoney(financeData.totalProfit) }}</div>
          <div class="card-title">{{ t('finance.dataCards.totalProfit') }}</div>
        </div>
      </div>
      <div class="card-wrapper">
        <div class="card gray">
          <div class="card-value">{{ financeData.totalOrders }}</div>
          <div class="card-title">{{ t('finance.dataCards.totalOrders') }}</div>
        </div>
      </div>
      <div class="card-wrapper">
        <div class="card orange">
          <div class="card-value">{{ financeData.cancelOrders }}</div>
          <div class="card-title">{{ t('finance.dataCards.cancelOrders') }}</div>
        </div>
      </div>
      <div class="card-wrapper">
        <div class="card red">
          <div class="card-value">{{ financeData.refundOrders }}</div>
          <div class="card-title">{{ t('finance.dataCards.refundOrders') }}</div>
        </div>
      </div>
    </div>

    <!-- 财务报表数据（卡片式） -->
    <div class="data-table">
      <!-- 卡片列表 -->
      <div class="report-list" v-loading="loading">
        <div v-if="tableData.length === 0" class="empty-data">
          <el-empty :description="t('finance.table.noData')" />
        </div>
        <div v-else class="report-items">
          <div v-for="item in tableData" :key="item.date" class="report-item">
            <div class="report-header">
              <span class="date">{{ item.date }}</span>
            </div>
            
            <div class="report-info">
              <div class="info-row">
                <span class="label">{{ t('finance.table.newOrders') }}</span>
                <span class="value">{{ item.newOrders }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ t('finance.table.newOrderAmount') }}</span>
                <span class="value price">{{ formatMoney(item.newOrderAmount) }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ t('finance.table.orderAmount') }}</span>
                <span class="value price">{{ formatMoney(item.orderAmount) }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ t('finance.table.profitAmount') }}</span>
                <span class="value profit">{{ formatMoney(item.profitAmount) }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ t('finance.table.cancelOrders') }}</span>
                <span class="value">{{ item.cancelOrders }}</span>
              </div>
              <div class="info-row">
                <span class="label">{{ t('finance.table.refundOrders') }}</span>
                <span class="value">{{ item.refundOrders }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 加载状态 -->
        <div class="loading-indicator" v-if="loading">
          <el-icon class="loading-icon"><Loading /></el-icon>
          <span>{{ t('common.loading') }}...</span>
        </div>
        <div class="no-more" v-if="!hasMore && tableData.length > 0">{{ t('common.noMoreData') }}</div>
        <div class="scroll-indicator" v-if="hasMore && tableData.length > 0" ref="loadMoreTrigger">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Loading } from '@element-plus/icons-vue'
import { formatMoney } from '@/utils/format'
import { getFinanceReportCards, getFinanceReportTable } from '@/api/wallet'

const { t } = useI18n()
const router = useRouter()

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)  // 增加每页数据量
const total = ref(0)
const disabled = ref(false)
const loading = ref(false)
const hasMore = computed(() => tableData.value.length < total.value)
const loadMoreTrigger = ref(null)
const scrollContainer = ref(null)

// 财务数据
const financeData = ref({
  pendingAmount: 0,
  totalSales: 0,
  totalProfit: 0,
  totalOrders: 0,
  cancelOrders: 0,
  refundOrders: 0
})

// 表格数据
const tableData = ref([])


// 获取财务报表表格数据
const getFinanceReportTableData = async () => {
  if (disabled.value || loading.value) return
  
  loading.value = true
  disabled.value = true
  
  try {
    const userId = sessionStorage.getItem('userId')
    if (!userId) {
      console.error('未找到用户ID')
      ElMessage.error(t('common.userIdMissing'))
      return
    }
    
    const data = {
      pageIndex: currentPage.value,
      pageSize: pageSize.value,
      userId
    }
    
    // console.log('获取财务报表数据, 页码:', currentPage.value, '每页数量:', pageSize.value)
    const res = await getFinanceReportTable(data)
    
    if (res && res.code === 0 && res.data) {
      if (currentPage.value === 1) {
        tableData.value = res.data.records || []
      } else {
        // 追加新数据
        tableData.value = [...tableData.value, ...(res.data.records || [])]
      }
      
      // 更新总数
      total.value = res.data.total || 0
      // console.log('数据加载成功, 总记录数:', total.value, '当前条数:', tableData.value.length)
    } else {
      console.error('API返回错误:', res)
      ElMessage.error(res?.message || t('finance.fetchDataFailed'))
    }
  } catch (err) {
    console.error('获取财务数据失败:', err)
    ElMessage.error(t('finance.fetchDataFailed'))
  } finally {
    loading.value = false
    disabled.value = false
  }
}

// 获取卡片数据的方法
const getFinanceCardsData = async () => {
  disabled.value = true
  
  try {
    const userId = sessionStorage.getItem('userId')
    if (!userId) {
      console.error('未找到用户ID')
      ElMessage.error(t('common.userIdMissing'))
      return
    }
    
    const data = { userId }
    
    // console.log('调用财务卡片API, 参数:', data)
    const res = await getFinanceReportCards(data)
    // console.log('财务卡片API返回:', res)
    
    if (res && res.code === 0 && res.data) {
      // 更新财务数据
      financeData.value = {
        pendingAmount: res.data.pendingAmount || 0,
        totalSales: res.data.totalSales || 0,
        totalProfit: res.data.totalProfit || 0,
        totalOrders: res.data.totalOrders || 0,
        cancelOrders: res.data.cancelOrders || 0,
        refundOrders: res.data.refundOrders || 0
      }
      // console.log('财务卡片数据更新成功:', financeData.value)
    } else {
      console.error('API返回错误:', res)
      ElMessage.error(res?.message || t('finance.fetchDataFailed'))
    }
  } catch (err) {
    console.error('获取财务卡片数据失败:', err)
    ElMessage.error(t('finance.fetchDataFailed'))
  } finally {
    disabled.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  // console.log('组件挂载，初始化数据')
  // 初始加载数据
  currentPage.value = 1
  getFinanceReportTableData()
  getFinanceCardsData()
  
  // 使用IntersectionObserver实现滚动加载
  nextTick(() => {
    // console.log('设置IntersectionObserver')
    const loadMoreObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]
      // console.log('观察到变化:', entry.isIntersecting, hasMore.value, disabled.value)
      // 当底部指示器进入视图且有更多数据可加载时
      if (entry.isIntersecting && hasMore.value && !disabled.value && !loading.value) {
        // console.log('触发加载更多数据, 当前页:', currentPage.value)
        currentPage.value++
        getFinanceReportTableData()
      }
    }, {
      threshold: 0.5, // 元素有一半可见时触发
      rootMargin: '0px 0px 150px 0px'  // 提前150px触发
    })
    
    // 获取加载更多指示器并添加观察
    setTimeout(() => {
      if (loadMoreTrigger.value) {
        // console.log('设置观察元素:', loadMoreTrigger.value)
        loadMoreObserver.observe(loadMoreTrigger.value)
        // 保存observer引用以便销毁时使用
        scrollContainer.value = loadMoreObserver
      } else {
        // console.error('未找到加载触发元素')
      }
    }, 500) // 延迟观察，确保元素已渲染
  })
})

// 组件卸载前移除监听
onBeforeUnmount(() => {
  if (scrollContainer.value) {
    scrollContainer.value.disconnect()
  }
})

</script>

<style scoped>
.mobile-finance-container {
  padding: 0;
  background-color: #f5f7fa;
  min-height: 100vh;
  overflow-x: hidden;
  overflow-y: auto;
  padding-top: 44px; /* 为固定标题栏留出空间 */
}

.page-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
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

.data-cards {
  margin-top: 10px;
  padding: 0 16px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.card-wrapper {
  width: 100%;
}

.card {
  border-radius: 12px;
  padding: 20px 16px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  height: 100px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-value {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
}

.card-title {
  font-size: 12px;
  opacity: 0.9;
}

.blue { background: linear-gradient(135deg, #4481eb, #04befe); }
.cyan { background: linear-gradient(135deg, #0ba360, #3cba92); }
.green { background: linear-gradient(135deg, #11998e, #38ef7d); }
.gray { background: linear-gradient(135deg, #636fa4, #8490c8); }
.orange { background: linear-gradient(135deg, #f46b45, #eea849); }
.red { background: linear-gradient(135deg, #eb3349, #f45c43); }

.data-table {
  background: transparent;
  padding: 16px 16px 70px;
  position: relative;
  overflow-y: auto;
  min-height: 300px;
  display: flex;
  flex-direction: column;
}

.table-title {
  margin: 0 0 16px;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
  padding-left: 8px;
}

/* 卡片列表样式 */
.report-list {
  margin-top: 8px;
}

.report-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 8px;
}

.report-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;
}

.report-header .date {
  font-weight: 600;
  color: #303133;
  font-size: 15px;
}

.report-info {
  margin-bottom: 5px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-row .label {
  color: #606266;
}

.info-row .value {
  color: #303133;
  font-weight: 500;
}

.value.price {
  color: #409EFF;
  font-weight: 600;
}

.value.profit {
  color: #67C23A;
  font-weight: 600;
}

/* 空数据与加载更多 */
.empty-data {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 16px 0;
  font-size: 14px;
  color: #909399;
}

.loading-icon {
  margin-right: 8px;
  animation: rotating 2s linear infinite;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.no-more {
  text-align: center;
  padding: 16px 0;
  font-size: 14px;
  color: #909399;
}

/* 添加滚动指示器样式 */
.scroll-indicator {
  padding: 20px 0;
  text-align: center;
  margin-top: 10px;
  min-height: 60px; /* 确保触发元素有足够的高度 */
  background-color: rgba(0,0,0,0.01); /* 几乎透明的背景，但可以占据空间 */
}

.loading-dots {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  margin: 0 3px;
  background-color: #409EFF; /* 使用更明显的颜色 */
  border-radius: 50%;
  display: inline-block;
  animation: dots 1.4s infinite ease-in-out both;
}

@keyframes dots {
  0%, 80%, 100% { 
    transform: scale(0);
  } 
  40% { 
    transform: scale(1.0);
  }
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}
</style> 
<template>
  <div class="finance-container">
    <!-- 数据卡片 -->
    <div class="data-cards">
      <div class="card blue">
        <div class="card-value">{{ formatMoney(financeData.pendingAmount) }}</div>
        <div class="card-title">{{ t('finance.dataCards.pendingAmount') }}</div>
      </div>
      <div class="card cyan">
        <div class="card-value">{{ formatMoney(financeData.totalSales) }}</div>
        <div class="card-title">{{ t('finance.dataCards.totalSales') }}</div>
      </div>
      <div class="card green">
        <div class="card-value">{{ formatMoney(financeData.totalProfit) }}</div>
        <div class="card-title">{{ t('finance.dataCards.totalProfit') }}</div>
      </div>
      <div class="card gray">
        <div class="card-value">{{ financeData.totalOrders }}</div>
        <div class="card-title">{{ t('finance.dataCards.totalOrders') }}</div>
      </div>
      <div class="card orange">
        <div class="card-value">{{ financeData.cancelOrders }}</div>
        <div class="card-title">{{ t('finance.dataCards.cancelOrders') }}</div>
      </div>
      <div class="card red">
        <div class="card-value">{{ financeData.refundOrders }}</div>
        <div class="card-title">{{ t('finance.dataCards.refundOrders') }}</div>
      </div>
    </div>

    <!-- 数据表格 -->
    <div class="data-table">
      <el-table 
        :data="tableData" 
        style="width: 100%"
        :empty-text="t('finance.table.noData')"
        highlight-current-row
        :header-cell-style="{ background: '#f5f7fa', color: '#606266', fontWeight: 'bold', fontSize: '14px' }"
        :cell-style="{ fontSize: '14px' }"
        :row-style="{ height: '50px' }">
        <el-table-column prop="date" :label="t('finance.table.date')" align="center" min-width="120" />
        <el-table-column prop="newOrders" :label="t('finance.table.newOrders')" align="center" min-width="120" />
        <el-table-column prop="newOrderAmount" :label="t('finance.table.newOrderAmount')" align="right" min-width="120" >
          <template #default="scope">
              {{ formatMoney(scope.row.newOrderAmount) }}
          </template>
        </el-table-column>
          <el-table-column prop="orderAmount" :label="t('finance.table.orderAmount')" align="right" min-width="120" >
          <template #default="scope">
              {{ formatMoney(scope.row.orderAmount) }}
          </template>
        </el-table-column>
        <el-table-column prop="profitAmount" :label="t('finance.table.profitAmount')" align="right" min-width="120" >
          <template #default="scope">
              {{ formatMoney(scope.row.profitAmount) }} 
          </template>
        </el-table-column>
        <el-table-column prop="cancelOrders" :label="t('finance.table.cancelOrders')" align="center" min-width="120" />
        <el-table-column prop="refundOrders" :label="t('finance.table.refundOrders')" align="center" min-width="120" />
      </el-table>
      
      <!-- 分页 -->
      <Pagination
        v-model:page-index="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :disabled="disabled"
        @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import Pagination from '@/components/Pagination.vue'
import { formatMoney } from '@/utils/format'
import { getFinanceReportCards, getFinanceReportTable } from '@/api/wallet'

const { t } = useI18n()

// 格式化日期为 YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}


// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const disabled = ref(false)

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
const getFinanceReportTableData = () => {
  disabled.value = true
  const data = {
    pageIndex: currentPage.value,
    pageSize: pageSize.value,
    userId: sessionStorage.getItem('userId')
  }
  
  getFinanceReportTable(data).then(res => {
    if (res.code === 0) {
      // 更新表格数据
      tableData.value = res.data.records || []
      
      // 更新总数
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.message || t('finance.fetchDataFailed'))
    }
  }).catch(err => {
    console.error('获取财务数据失败:', err)
    ElMessage.error(t('finance.fetchDataFailed'))
  }).finally(() => {
    disabled.value = false
  })
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  getFinanceReportTableData()
}

// 处理当前页变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  getFinanceData()
}

// 获取卡片数据的方法
const getFinanceCardsData = () => {
  disabled.value = true
  const data = {
    userId: sessionStorage.getItem('userId')
  }
  
  getFinanceReportCards(data).then(res => {
    if (res.code === 0) {
      // 更新财务数据
      financeData.value = {
        pendingAmount: res.data.pendingAmount || 0,
        totalSales: res.data.totalSales || 0,
        totalProfit: res.data.totalProfit || 0,
        totalOrders: res.data.totalOrders || 0,
        cancelOrders: res.data.cancelOrders || 0,
        refundOrders: res.data.refundOrders || 0
      }

    } else {
      ElMessage.error(res.message || t('finance.fetchDataFailed'))
    }
  }).catch(err => {
    console.error('获取财务数据失败:', err)
    ElMessage.error(t('finance.fetchDataFailed'))
  }).finally(() => {
    disabled.value = false
  })
}

// 组件挂载时获取数据
onMounted(() => {
  // 初始加载数据
  getFinanceCardsData()
  getFinanceReportTableData()
})
</script>

<style scoped>
.finance-container {
  padding: 0px;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 24px;
  margin-bottom: 24px; /* 减小卡片与表格之间的间距 */
}

.card {
  border-radius: 12px;
  padding: 24px;
  color: white;
  text-align: center;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 20px 0 rgba(0, 0, 0, 0.15);
}

.card-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
}

.card-title {
  font-size: 15px;
  opacity: 0.9;
}

.blue { background: linear-gradient(135deg, #4481eb, #04befe); }
.cyan { background: linear-gradient(135deg, #0ba360, #3cba92); }
.green { background: linear-gradient(135deg, #11998e, #38ef7d); }
.gray { background: linear-gradient(135deg, #636fa4, #8490c8); }
.orange { background: linear-gradient(135deg, #f46b45, #eea849); }
.red { background: linear-gradient(135deg, #eb3349, #f45c43); }

.data-table {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.08);
  position: relative;
  padding-bottom: 80px; /* 为固定的分页组件留出空间 */
  height: 650px; /* 增加表格卡片高度 */
  min-height: 650px; /* 确保最小高度 */
  overflow: hidden; /* 防止内容溢出 */
}

/* 表格样式优化 */
:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
  height: 100%; /* 让表格占满容器高度 */
}

:deep(.el-table__body-wrapper) {
  height: calc(100% - 50px); /* 减去表头高度 */
  overflow-y: auto; /* 添加垂直滚动 */
}

:deep(.el-table th) {
  padding: 12px 0;
}

:deep(.el-table td) {
  padding: 12px 0;
}

:deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: #fafafa;
}

:deep(.el-table--enable-row-hover .el-table__body tr:hover > td) {
  background-color: #f5f7fa;
}

/* 利润显示样式 */
.profit-positive {
  color: #67C23A;
  font-weight: bold;
}

.profit-negative {
  color: #F56C6C;
  font-weight: bold;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .data-cards {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .data-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .data-cards {
    grid-template-columns: 1fr;
  }
}
</style> 
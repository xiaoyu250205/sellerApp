<template>
  <div class="purchase-history-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>{{ t('menu.purchaseHistory') }}</span>
        </div>
      </template>
      <div class="content">
        <el-table
          v-loading="loading"
          :data="tableData"
          style="width: 100%"
          border
        >
          <el-table-column type="index" :label="t('common.index')" width="80" align="center" />
          <el-table-column prop="type" :label="t('purchaseHistory.packageType')" min-width="150" align="center">
            <template #default="{ row }">
              <span :class="['package-type', `type-${row.type}`]">
                {{ getPackageTypeText(row.type) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="createTime" :label="t('purchaseHistory.purchaseTime')" min-width="200" align="center" />
          <el-table-column prop="purchaseAmount" :label="t('purchaseHistory.paymentAmount')" min-width="150" align="center">
            <template #default="{ row }">
              ${{ row.purchaseAmount }}
            </template>
          </el-table-column>
        </el-table>

        <div class="pagination-container">
          <pagination
            v-model:page="currentPage"
            v-model:limit="pageSize"
            :total="total"
            @pagination="handlePagination"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Pagination from '@/components/Pagination.vue'
import { getPurchaseHistory } from '@/api/wallet'

const { t } = useI18n()
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const tableData = ref([])

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
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

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
const fetchData = () => {
  loading.value = true
  const userId = sessionStorage.getItem('userId')
  
  getPurchaseHistory({
    userId,
    pageIndex: currentPage.value,
    pageSize: pageSize.value
  })
    .then(res => {
      if (res.code === 0) {
        tableData.value = res.data.records.map(item => ({
          id: item.id,
          type: item.type ? item.type.toString() : '',
          createTime: formatDate(item.startTime),
          purchaseAmount: item.amount
        }))
        total.value = res.data.total || 0
      } else {
        tableData.value = []
        total.value = 0
      }
    })
    .catch(() => {
      tableData.value = []
      total.value = 0
    })
    .finally(() => {
      loading.value = false
    })
}

// 分页处理
const handlePagination = ({ page, limit }) => {
  currentPage.value = page
  pageSize.value = limit
  fetchData()
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.purchase-history-container {
  width: 100%;
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
}

:deep(.el-table) {
  margin-top: 20px;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
}

:deep(.el-table__header) {
  background-color: var(--el-fill-color-light);
}

:deep(.el-table th) {
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-primary);
  font-weight: 600;
  height: 50px;
  padding: 8px 0;
}

:deep(.el-table td) {
  padding: 12px 0;
  height: 50px;
}

:deep(.el-table--border .el-table__cell) {
  border-right: 1px solid var(--el-border-color-lighter);
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

.pagination-container {
  margin-top: 20px;
  padding: 0 20px;
}
</style> 
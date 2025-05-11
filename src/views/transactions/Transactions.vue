<template>
  <div class="transactions-container">
    <el-card>
      <div class="content">
        <!-- 查询表单 -->
        <div class="query-container">
          <el-form :model="queryForm" label-width="180px" class="query-form">
            <el-form-item :label="t('wallet.changeType')" class="change-type-item">
              <el-select v-model="queryForm.changeType" :placeholder="t('wallet.pleaseSelectChangeType')" clearable>
                <el-option :label="t('wallet.recharge')" value="1" />
                <el-option :label="t('wallet.transferWithdraw')" value="2" />
                <el-option :label="t('wallet.procurement')" value="3" />
                <el-option :label="t('wallet.orderRevenue')" value="4" />
                <el-option :label="t('wallet.refund')" value="5" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('wallet.changeTime')">
              <el-date-picker
                v-model="queryForm.changeTime"
                type="daterange"
                range-separator="至"
                :start-placeholder="t('common.startDate')"
                :end-placeholder="t('common.endDate')"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item class="query-buttons">
              <el-button type="primary" @click="handleQuery">{{ t('common.query') }}</el-button>
              <el-button @click="resetQuery">{{ t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 资金记录表格 -->
        <el-table :data="transactions" style="width: 100%" highlight-current-row v-loading="loading">
          <el-table-column prop="id" :label="t('wallet.sequence')" align="center" width="280"/>
          <el-table-column prop="type" :label="t('wallet.changeType')" width="280" align="center">
            <template #default="{ row }">
              <el-tag :type="getChangeTypeTag(row.type)">
                {{ getChangeTypeText(row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" :label="t('wallet.changeAmount')" align="right">
            <template #default="{ row }">
              <span :class="{ 'amount-positive': row.type == '1' || row.type == '4' || row.type == '5', 'amount-negative': row.type == '2' || row.type == '3' }">
                {{ row.type == '1' || row.type == '4' || row.type == '5' ? '+' : '-' }}{{ formatMoney(row.amount) }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="balanceBefore" :label="t('wallet.beforeAmount')" align="right">
            <template #default="{ row }">
              {{ formatMoney(row.balanceBefore) }}
            </template>
          </el-table-column>
          <el-table-column prop="balanceAfter" :label="t('wallet.afterAmount')" align="right">
            <template #default="{ row }">
              {{ formatMoney(row.balanceAfter) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" :label="t('wallet.changeTime')" align="center" />
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <div class="pagination-info">{{ t('common.pagination.total', { total: total }) }}</div>
          <el-pagination
            v-model:current-page="pageIndex"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getWalletRecord } from '@/api/wallet'
import { formatMoney } from '@/utils/format'


const { t } = useI18n()

// 查询表单
const queryForm = ref({
  changeType: '',
  changeTime: []
})

// 分页相关
const pageIndex = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 资金记录列表数据
const transactions = ref([])
// 加载状态
const loading = ref(false)

// 获取资金记录列表
const getTransactionsList = () => {
  loading.value = true
  // 调用API获取数据
  const data = {
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    type: queryForm.value.changeType,
    userId: sessionStorage.getItem('userId'),
    startTime: queryForm.value.changeTime[0],
    endTime: queryForm.value.changeTime[1]
  }
  getWalletRecord(data).then(res => {
    if(res.code === 0) {
      transactions.value = res.data.records
      total.value = res.data.total 
    }
    loading.value = false
  }).catch(err => {
    console.log(err)
    loading.value = false
  })
}

// 获取变更类型标签样式
const getChangeTypeTag = (type) => {
  const tagMap = {
    1: 'success',
    2: 'danger',
    3: 'warning',
    4: 'info',
    5: 'primary'
  }
  return tagMap[type] || 'info'
}

// 获取变更类型文本
const getChangeTypeText = (type) => {
  const textMap = {
    1: t('wallet.recharge'),
    2: t('wallet.transferWithdraw'),
    3: t('wallet.procurement'),
    4: t('wallet.orderRevenue'),
    5: t('wallet.refund')
  }
  return textMap[type] || type
}

// 查询方法
const handleQuery = () => {
  pageIndex.value = 1
  getTransactionsList()
}

// 重置查询
const resetQuery = () => {
  queryForm.value = {
    changeType: '',
    changeTime: []
  }
  handleQuery()
}

// 分页
const handleCurrentChange = (page) => {
  pageIndex.value = page
  getTransactionsList()
}

onMounted(() => {
  getTransactionsList()
})
</script>

<style scoped>
.transactions-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  min-height: 300px;
}

.query-container {
  margin-bottom: 20px;
  padding: 20px;
  border-radius: 4px;
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

:deep(.el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  width: 180px !important;
  font-weight: 500;
  color: #606266;
}

:deep(.el-input),
:deep(.el-select) {
  width: 220px;
}

:deep(.el-date-editor) {
  width: 360px;
}

.query-buttons {
  margin-left: 0;
  margin-right: 0;
}

:deep(.el-button) {
  padding: 8px 20px;
}

:deep(.el-button--primary) {
  background-color: #409EFF;
  border-color: #409EFF;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

:deep(.el-table) {
  margin-top: 10px;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  padding: 12px 0;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.amount-positive {
  color: #67C23A;
  font-weight: bold;
}

.amount-negative {
  color: #F56C6C;
  font-weight: bold;
}

:deep(.change-type-item .el-form-item__label) {
  width: 100px !important;
}
</style> 
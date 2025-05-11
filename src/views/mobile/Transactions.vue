<template>
  <div class="mobile-transactions-container">
    <!-- 顶部标题栏 -->
    <div class="tabs-header">
      <div class="header-left" @click="router.back()">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
      </div>
      <div class="header-title">{{ t('wallet.transactionRecords') }}</div>
      <div class="header-right"></div>
    </div>

    <div class="content-container">
      <!-- 筛选区域 -->
      <div class="filter-area">
        <div class="filter-item">
          <el-select 
            v-model="queryForm.changeType" 
            :placeholder="t('wallet.changeType')" 
            clearable 
            size="small"
            @change="handleSearch"
          >
            <el-option :label="t('common.all')" :value="''" />
            <el-option :label="t('wallet.recharge')" :value="1" />
            <el-option :label="t('wallet.transferWithdraw')" :value="2" />
            <el-option :label="t('wallet.procurement')" :value="3" />
            <el-option :label="t('wallet.orderRevenue')" :value="4" />
            <el-option :label="t('wallet.refund')" :value="5" />
          </el-select>
        </div>
      </div>

      <!-- 交易列表 -->
      <div class="transaction-list" v-loading="loading">
        <div v-if="transactions.length === 0" class="empty-data">
          <el-empty :description="t('common.noData')" />
        </div>
        <div v-else class="transaction-items">
          <div v-for="item in transactions" :key="item.id" class="transaction-item">
            <div class="transaction-header">
              <div class="transaction-type">
                <el-tag :type="getChangeTypeTag(item.type)" size="small">
                  {{ getChangeTypeText(item.type) }}
                </el-tag>
              </div>
              <div class="transaction-time">{{ item.createdAt }}</div>
            </div>
            <div class="transaction-content">
              <div class="transaction-id">{{ t('wallet.sequence') }}: {{ item.id }}</div>
              <div class="transaction-amount" :class="{ 'amount-positive': item.type == 1 || item.type == 4 || item.type == 5, 'amount-negative': item.type == 2 || item.type == 3 }">
                {{ item.type == 1 || item.type == 4 || item.type == 5 ? '+' : '-' }}{{ formatMoney(item.amount) }}
              </div>
            </div>
            <div class="transaction-details">
              <div class="detail-item">
                <span class="detail-label">{{ t('wallet.beforeAmount') }}:</span>
                <span class="detail-value">{{ formatMoney(item.balanceBefore) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ t('wallet.afterAmount') }}:</span>
                <span class="detail-value">{{ formatMoney(item.balanceAfter) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 加载更多 -->
        <div class="load-more-trigger" ref="loadMoreTrigger" v-show="hasMore"></div>
        <div class="no-more" v-if="!loading && transactions.length > 0 && !hasMore">
          {{ t('common.noMoreData') }}
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
import { ArrowLeft } from '@element-plus/icons-vue'
import { getWalletRecord } from '@/api/wallet'
import { formatMoney } from '@/utils/format'

const { t } = useI18n()
const router = useRouter()

// 查询表单
const queryForm = ref({
  changeType: ''
})

// 分页相关
const pageIndex = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = computed(() => transactions.value.length < total.value)
const loadMoreTrigger = ref(null)

// 资金记录列表数据
const transactions = ref([])
// 加载状态
const loading = ref(false)

// 获取资金记录列表
const getTransactionsList = (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  // 调用API获取数据
  const data = {
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    type: queryForm.value.changeType,
    userId: sessionStorage.getItem('userId')
  }
  
  getWalletRecord(data).then(res => {
    if(res.code === 0) {
      if (isLoadMore) {
        transactions.value = [...transactions.value, ...(res.data.records || [])]
      } else {
        transactions.value = res.data.records || []
      }
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res?.message || t('common.requestFailed'))
    }
  }).catch(err => {
    console.error('获取资金记录失败:', err)
    ElMessage.error(t('common.requestFailed'))
  }).finally(() => {
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
const handleSearch = () => {
  pageIndex.value = 1
  getTransactionsList()
}

// 组件挂载时获取数据
onMounted(() => {
  getTransactionsList()
  
  // 使用IntersectionObserver实现滚动加载
  nextTick(() => {
    const loadMoreObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]
      // 当底部指示器进入视图且有更多数据可加载时
      if (entry.isIntersecting && hasMore.value && !loading.value) {
        pageIndex.value++
        getTransactionsList(true)
      }
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px 100px 0px'
    })
    
    if (loadMoreTrigger.value) {
      loadMoreObserver.observe(loadMoreTrigger.value)
      // 保存observer引用以便销毁时使用
      scrollObserver.value = loadMoreObserver
    }
  })
})

// 用于存储 observer 引用
const scrollObserver = ref(null)

// 组件卸载前移除监听
onBeforeUnmount(() => {
  if (scrollObserver.value) {
    scrollObserver.value.disconnect()
  }
})
</script>

<style scoped>
.mobile-transactions-container {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 44px; /* 为固定标题栏留出空间 */
  overflow-y: auto;
  overflow-x: hidden;
}

/* 顶部标题栏样式 */
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

/* 内容区域样式 */
.content-container {
  padding: 16px;
}

/* 筛选区域样式 */
.filter-area {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.filter-item {
  flex: 1;
  min-width: 140px;
}

.filter-item :deep(.el-select) {
  width: 100%;
}

.filter-item :deep(.el-date-editor) {
  width: 100%;
}

/* 交易列表样式 */
.transaction-list {
  margin-top: 16px;
}

.transaction-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.transaction-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;
}

.transaction-time {
  font-size: 13px;
  color: #909399;
}

.transaction-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.transaction-id {
  font-size: 14px;
  color: #606266;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.transaction-amount {
  font-size: 18px;
  font-weight: 600;
}

.amount-positive {
  color: #67C23A;
}

.amount-negative {
  color: #F56C6C;
}

.transaction-details {
  font-size: 13px;
  color: #909399;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.detail-item:last-child {
  margin-bottom: 0;
}

.detail-label {
  color: #909399;
}

.detail-value {
  color: #606266;
  font-weight: 500;
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

/* 空数据状态 */
.empty-data {
  margin-top: 40px;
}
</style> 
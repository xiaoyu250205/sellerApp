<template>
  <div class="mobile-payment-history">
    <!-- 标签页切换 -->
    <div class="tabs-header">
      <div class="header-left" @click="router.back()">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
      </div>
      <div 
        v-for="(tab, index) in tabs" 
        :key="index" 
        class="tab-item" 
        :class="{ active: activeTab === tab.name }"
        @click="switchTab(tab.name)"
      >
        {{ t(tab.title) }}
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-container">
      <!-- 充值记录列表 -->
      <div v-if="activeTab === 'deposit'" class="payment-list" v-loading="loading">
        <div v-if="recordsList.length === 0" class="empty-data">
          <el-empty :description="t('common.noData')" />
        </div>
        <div v-else class="payment-items">
          <div v-for="item in recordsList" :key="item.id" class="payment-item">
            <div class="payment-header">
              <div class="payment-id">{{ t('wallet.orderId') }}: {{ item.id }}</div>
              <div class="payment-status">
                <el-tag :type="getStatusType(item.status)" size="small">
                  {{ item.status == '1' ? t('wallet.status.completed') : t('wallet.status.pending') }}
                </el-tag>
              </div>
            </div>
            <div class="payment-content">
              <div class="content-row">
                <span class="label">{{ t('wallet.depositAmount') }}:</span>
                <span class="value amount">{{ formatMoney(item.amount) }}</span>
              </div>
              <div class="content-row">
                <span class="label">{{ t('wallet.actualAmount') }}:</span>
                <span class="value amount">{{ formatMoney(item.actualAmount) }}</span>
              </div>
              <div class="content-row" v-if="item.coinType">
                <span class="label">{{ t('wallet.coinType') }}:</span>
                <span class="value">{{ item.coinType }}</span>
              </div>
              <div class="content-row">
                <span class="label">{{ t('wallet.completedTime') }}:</span>
                <span class="value">{{ formatDate(item.arrivalTime) || '-' }}</span>
              </div>
            </div>
            <div class="payment-footer" v-if="item.voucher">
              <el-button type="primary" size="small" text @click="viewVoucher(item)">
                {{ t('wallet.viewVoucher') }} <el-icon class="icon"><View /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 加载更多 -->
        <div class="load-more-trigger" ref="depositLoadMoreTrigger" v-show="hasMore"></div>
        <div class="no-more" v-if="!loading && recordsList.length > 0 && !hasMore">
          {{ t('common.noMoreData') }}
        </div>
      </div>

      <!-- 提现记录列表 -->
      <div v-if="activeTab === 'withdraw'" class="payment-list" v-loading="loading">
        <div v-if="recordsList.length === 0" class="empty-data">
          <el-empty :description="t('common.noData')" />
        </div>
        <div v-else class="payment-items">
          <div v-for="item in recordsList" :key="item.id" class="payment-item">
            <div class="payment-header">
              <div class="payment-id">{{ t('wallet.orderId') }}: {{ item.id }}</div>
              <div class="payment-status">
                <el-tag :type="getStatusType(item.status)" size="small">
                  {{ getStatusStr(item.status) }}
                </el-tag>
              </div>
            </div>
            <div class="payment-content">
              <div class="content-row">
                <span class="label">{{ t('wallet.withdrawAmount') }}:</span>
                <span class="value amount">{{ formatMoney(item.amount) }}</span>
              </div>
              <div class="content-row">
                <span class="label">{{ t('wallet.fee') }}:</span>
                <span class="value amount">{{ formatMoney(item.fee) }}</span>
              </div>
              <div class="content-row">
                <span class="label">{{ t('wallet.actualAmount') }}:</span>
                <span class="value amount">{{ formatMoney(item.actualAmount) }}</span>
              </div>
              <div class="content-row" v-if="item.withdrawMethod">
                <span class="label">{{ t('wallet.withdrawMethod') }}:</span>
                <span class="value">
                  {{ item.withdrawMethod === 'crypto' ? t('wallet.withdrawMethods.crypto') : t('wallet.withdrawMethods.bank') }}
                </span>
              </div>
              <div class="content-row" v-if="item.createdAt">
                <span class="label">{{ t('wallet.applyTime') }}:</span>
                <span class="value">{{ formatDate(item.createdAt) }}</span>
              </div>
              <div class="content-row" v-if="item.arrivalTime">
                <span class="label">{{ t('wallet.completedTime') }}:</span>
                <span class="value">{{ formatDate(item.arrivalTime) }}</span>
              </div>
              <div class="content-row" v-if="item.remark">
                <span class="label">{{ t('wallet.remark') }}:</span>
                <span class="value remark-text" @click="viewRemark(item.remark)">{{ item.remark }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 加载更多 -->
        <div class="load-more-trigger" ref="withdrawLoadMoreTrigger" v-show="hasMore"></div>
        <div class="no-more" v-if="!loading && recordsList.length > 0 && !hasMore">
          {{ t('common.noMoreData') }}
        </div>
      </div>
    </div>

    <!-- 查看凭证对话框 -->
    <el-dialog v-model="voucherDialogVisible" :title="t('wallet.paymentVoucher')" width="90%">
      <div class="voucher-image-container">
        <el-image :src="currentVoucher" fit="contain" style="width: 100%;" />
      </div>
    </el-dialog>

    <!-- 查看备注对话框 -->
    <el-dialog v-model="remarkDialogVisible" :title="t('wallet.remark')" width="90%">
      <div class="remark-container">
        {{ currentRemark }}
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getRechargeWithdrawRecord } from '@/api/wallet'
import { formatMoney, formatDate } from '@/utils/format'  


const { t } = useI18n()
const router = useRouter()

// 标签页
const tabs = [
  { name: 'deposit', title: 'wallet.deposit' },
  { name: 'withdraw', title: 'wallet.withdraw' }
]
const activeTab = ref('deposit') // 充值记录是默认标签

// 切换标签
const switchTab = (tab) => {
  if (activeTab.value === tab) return
  activeTab.value = tab
  // 重置分页和数据
  pageIndex.value = 1
  recordsList.value = []
  // 获取数据
  getRecords()
}

// 分页相关
const pageIndex = ref(1)
const pageSize = ref(10)
const total = ref(0)
const hasMore = computed(() => recordsList.value.length < total.value)
const depositLoadMoreTrigger = ref(null)
const withdrawLoadMoreTrigger = ref(null)

// 记录列表数据
const recordsList = ref([])
// 加载状态
const loading = ref(false)

// 查看凭证对话框
const voucherDialogVisible = ref(false)
const currentVoucher = ref('')

// 查看备注对话框
const remarkDialogVisible = ref(false)
const currentRemark = ref('')

// 获取记录列表
const getRecords = (isLoadMore = false) => {
  if (loading.value) return
  
  loading.value = true
  // 调用API获取数据
  const data = {
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    userId: sessionStorage.getItem('userId'),
    type: activeTab.value === 'deposit' ? 1 : 2, // 1-充值, 2-提现
  }
  
  getRechargeWithdrawRecord(data).then(res => {
    if(res.code === 0) {
      if (isLoadMore) {
        recordsList.value = [...recordsList.value, ...(res.data.records || [])]
      } else {
        recordsList.value = res.data.records || []
      }
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res?.message || t('common.requestFailed'))
    }
  }).catch(err => {
    console.error(`获取${activeTab.value === 'deposit' ? '充值' : '提现'}记录失败:`, err)
    ElMessage.error(t('common.requestFailed'))
  }).finally(() => {
    loading.value = false
  })
}

//获取文本
const getStatusStr = (status) => {
  switch (status) {
    case 2:
      return t('wallet.status.rejected')
    case 1:
      return t('wallet.status.completed')
    case 0:
      return t('wallet.status.pending')
    default:
      return ''
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  switch (status) {
    case 2:
      return 'danger'
    case 1:
      return 'success'
    case 0:
      return 'warning'
  }
}

// 查看备注内容
const viewRemark = (remark) => {
  currentRemark.value = remark
  remarkDialogVisible.value = true
}

// 查看支付凭证
const viewVoucher = (item) => {
  currentVoucher.value = item.voucher
  voucherDialogVisible.value = true
}

// 设置滚动加载
const setupIntersectionObserver = () => {
  nextTick(() => {
    // 创建观察器
    const loadMoreObserver = new IntersectionObserver((entries) => {
      const entry = entries[0]
      // 当底部指示器进入视图且有更多数据可加载时
      if (entry.isIntersecting && hasMore.value && !loading.value) {
        pageIndex.value++
        getRecords(true)
      }
    }, {
      threshold: 0.5,
      rootMargin: '0px 0px 100px 0px'
    })
    
    // 根据当前标签页选择不同的触发器
    const triggerRef = activeTab.value === 'deposit' ? depositLoadMoreTrigger.value : withdrawLoadMoreTrigger.value
    
    if (triggerRef) {
      loadMoreObserver.observe(triggerRef)
      // 保存observer引用以便销毁时使用
      if (activeTab.value === 'deposit') {
        depositObserver.value = loadMoreObserver
      } else {
        withdrawObserver.value = loadMoreObserver
      }
    }
  })
}

// 用于存储 observer 引用
const depositObserver = ref(null)
const withdrawObserver = ref(null)

// 监听标签页变化，重新设置滚动加载
watch(activeTab, () => {
  // 断开之前的观察器
  if (depositObserver.value) depositObserver.value.disconnect()
  if (withdrawObserver.value) withdrawObserver.value.disconnect()
  
  // 重新设置新的观察器
  setupIntersectionObserver()
})

// 组件挂载时获取数据
onMounted(() => {
  getRecords()
  setupIntersectionObserver()
})

// 组件卸载前移除监听
onBeforeUnmount(() => {
  if (depositObserver.value) depositObserver.value.disconnect()
  if (withdrawObserver.value) withdrawObserver.value.disconnect()
})
</script>

<style scoped>
.mobile-payment-history {
  min-height: 100vh;
  background-color: #f5f7fa;
  padding-top: 0; /* 移除顶部填充 */
  overflow-y: auto;
  overflow-x: hidden;
}

/* 标签页导航样式 */
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
  margin-right: 10px;
}

.back-icon {
  font-size: 20px;
  cursor: pointer;
  color: #303133;
}

.tab-item {
  flex: 1;
  text-align: center;
  padding: 14px 0;
  font-size: 15px;
  color: #606266;
  position: relative;
  transition: all 0.3s;
  cursor: pointer;
  margin: 0;
}

.tab-item.active {
  color: #409EFF;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 3px;
  background-color: #409EFF;
  border-radius: 3px 3px 0 0;
}

/* 内容区域样式 */
.content-container {
  margin-top: 25px;
  padding: 16px;
}

/* 支付记录列表样式 */
.payment-list {
  margin-top: 16px;
}

.payment-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.payment-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.payment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f2f5;
}

.payment-id {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 70%;
}

.payment-content {
  margin-bottom: 12px;
}

.content-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.content-row:last-child {
  margin-bottom: 0;
}

.content-row .label {
  color: #909399;
}

.content-row .value {
  color: #606266;
  font-weight: 500;
}

.content-row .value.amount {
  color: #303133;
  font-weight: 600;
}

.content-row .value.remark-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
  cursor: pointer;
  color: #409EFF;
}

.payment-footer {
  padding-top: 8px;
  border-top: 1px solid #f0f2f5;
  display: flex;
  justify-content: flex-end;
}

.payment-footer .icon {
  margin-left: 4px;
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

/* 凭证图片容器 */
.voucher-image-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.remark-container {
  padding: 10px;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}
</style> 
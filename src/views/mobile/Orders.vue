<template>
  <div class="mobile-orders-container">
    <!-- 顶部标签导航 -->
    <div class="tabs-header">
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
    <div class="content-container" @scroll="handleScroll">
      <!-- 店铺订单 -->
      <div v-if="activeTab === 'orders'" class="tab-content">
        <!-- 筛选条件 -->
        <div class="filter-area">
          <div class="filter-row">
            <div class="filter-item">
              <el-select
                v-model="queryForm.purchaseStatus"
                :placeholder="t('orders.purchaseStatus')"
                clearable
                class="filter-select"
                size="small"
                @change="handleQuery"
              >
                <el-option :label="t('common.all')" :value="''" />
                <el-option :label="t('orders.purchase')" :value="0" />
                <el-option :label="t('orders.purchased')" :value="1" />
              </el-select>
            </div>
            <div class="filter-item">
              <el-select
                v-model="queryForm.logisticsStatus"
                :placeholder="t('orders.shippingStatus')"
                clearable
                class="filter-select"
                size="small"
                @change="handleQuery"
              >
                <el-option :label="t('common.all')" :value="''" />
                <el-option 
                  v-for="status in [
                    { value: 0, label: t('orders.shipping') },
                    { value: 1, label: t('orders.transition') },
                    { value: 2, label: t('orders.signed') },
                    { value: 3, label: t('orders.completed') },
                    { value: 4, label: t('orders.refunding') },
                    { value: 5, label: t('orders.cancelled') },
                    { value: 6, label: t('orders.refunded') }
                  ]"
                  :key="status.value"
                  :label="status.label"
                  :value="status.value"
                  :disabled="queryForm.purchaseStatus === 0 && status.value !== 0"
                />
              </el-select>
            </div>
          </div>
        </div>
        
        <!-- 订单列表 -->
        <div class="order-list" v-loading="loading">
          <div v-if="orders.length === 0" class="empty-data">
            <el-empty :description="t('common.noData')" />
          </div>
          <div v-else class="order-items">
            <div v-for="item in orders" :key="item.orderNo" class="order-item">
              <div class="order-header">
                <span class="order-no">{{ item.orderNo }}</span>
                <span class="order-time">{{ item.orderTime }}</span>
              </div>
              
              <div class="order-info">
                <div class="info-row">
                  <span class="label">{{ t('orders.orderStatus') }}:</span>
                  <el-tag :type="item.payStatus == 1 ? 'success' : 'warning'" size="small">
                    {{ item.payStatus == 1 ? t('orders.paid') : t('orders.pending') }}
                  </el-tag>
                </div>
                <div class="info-row">
                  <span class="label">{{ t('orders.purchaseStatus') }}:</span>
                  <el-tag :type="item.purchaseStatus == 0 ? 'danger' : 'success'" size="small">
                    {{ item.purchaseStatus == 0 ? t('orders.purchase') : t('orders.purchased') }}
                  </el-tag>
                </div>
                <div class="info-row">
                  <span class="label">{{ t('orders.shippingStatus') }}:</span>
                  <el-tag :type="getLogisticsStatusType(item.logisticsStatus)" size="small">
                    {{ getShippingStatus(item.logisticsStatus) }}
                  </el-tag>
                </div>
              </div>
              
              <div class="order-actions">
                <div class="amount-info">
                  <div class="amount">{{ item.orderAmount }}</div>
                  <div class="profit">{{ t('orders.profit') }}: {{ item.profit }}</div>
                </div>
                <div class="action-links">
                  <span class="action-link" @click="goToDetail(item)">{{ t('orders.detail') }}</span>
                  <span 
                    v-if="item.purchaseStatus === 0 && item.logisticsStatus !== 5"
                    class="action-link purchase-link" 
                    @click="handlePurchase(item)"
                  >
                    {{ t('orders.purchaseing') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 加载更多 -->
          <div class="load-more" v-if="hasMore && loading">
            <el-icon class="loading-icon"><Loading /></el-icon>
            <span>{{ t('common.loading') }}...</span>
          </div>
          <div class="load-more" v-else-if="hasMore">
            <el-button size="small" @click="loadMoreOrders" :loading="loading">
              {{ t('common.loadMore') }}
            </el-button>
          </div>
          <div class="no-more" v-else-if="!hasMore">{{ t('common.noMoreData') }}</div>
        </div>
      </div>
      
      <!-- 退款申请 -->
      <div v-if="activeTab === 'refunds'" class="tab-content">
        <!-- 筛选条件 -->
        <div class="filter-area">
          <div class="filter-row">
            <div class="filter-item">
              <el-select
                v-model="refundSearchForm.refundStatus"
                :placeholder="t('orders.refundStatus')"
                clearable
                class="filter-select"
                size="small"
                @change="getRefunds"
              >
                <el-option :label="t('common.all')" :value="''" />
                <el-option :label="t('orders.pending')" :value="0" />
                <el-option :label="t('orders.approved')" :value="1" />
              </el-select>
            </div>
          </div>
        </div>
        
        <!-- 退款列表 -->
        <div class="refund-list" v-loading="refundLoading">
          <div v-if="refunds.length === 0" class="empty-data">
            <el-empty :description="t('common.noData')" />
          </div>
          <div v-else class="refund-items">
            <div v-for="item in refunds" :key="item.orderNo" class="refund-item">
              <div class="refund-header">
                <span class="order-no">{{ item.orderNo }}</span>
                <span class="refund-time">{{ item.refundTime }}</span>
              </div>
              
              <div class="refund-info">
                <div class="info-row">
                  <span class="label">{{ t('orders.amount') }}:</span>
                  <span class="value price">{{ item.orderAmount }}</span>
                </div>
                <div class="info-row">
                  <span class="label">{{ t('orders.refundReason') }}:</span>
                  <span class="value">{{ getRefundReason(item.refundReason) }}</span>
                </div>
                <div class="info-row">
                  <span class="label">{{ t('orders.refundMark') }}:</span>
                  <span class="value">{{ item.refundMark }}</span>
                </div>
                <div class="info-row">
                  <span class="label">{{ t('orders.refundStatus') }}:</span>
                  <el-tag :type="item.refundStatus === 0 ? 'warning' : 'success'" size="small">
                    {{ getRefundStatus(item.refundStatus) }}
                  </el-tag>
                </div>
              </div>
              
              <div class="refund-actions">
                <div class="amount-info">
                  <!-- <div class="amount">{{ item.orderAmount }}</div> -->
                </div>
                <div class="action-links">
                  <span class="action-link" @click="goToRefundDetail(item)">{{ t('orders.detail') }}</span>
                  <span 
                    v-if="item.refundStatus === 0"
                    class="action-link approve-link" 
                    @click="handleApprove(item)"
                  >
                    {{ t('orders.approve') }}
                  </span>
                </div>
              </div>
            </div>
            
            <!-- 加载更多 -->
            <div class="load-more" v-if="hasMoreRefunds && refundLoading">
              <el-icon class="loading-icon"><Loading /></el-icon>
              <span>{{ t('common.loading') }}...</span>
            </div>
            <div class="load-more" v-else-if="hasMoreRefunds">
              <el-button size="small" @click="loadMoreRefunds" :loading="refundLoading">
                {{ t('common.loadMore') }}
              </el-button>
            </div>
            <div class="no-more" v-else-if="!hasMoreRefunds">{{ t('common.noMoreData') }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 采购确认对话框 -->
    <el-dialog
      v-model="purchaseDialogVisible"
      :title="t('orders.confirmPurchase')"
      width="90%"
      :close-on-click-modal="false"
      class="purchase-dialog"
    >
      <div class="purchase-container">
        <div class="amount-info">
          <div class="info-item" v-if="selectedOrders.length === 0">
            <span class="label">{{ t('orders.orderId') }}:</span>
            <span class="value order-id">{{ currentPurchaseOrder.orderNo }}</span>
          </div>
          <div class="info-item" v-else>
            <span class="label">{{ t('orders.selectedOrders') }}:</span>
            <span class="value">{{ currentPurchaseOrder.orderNo }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('orders.purchaseAmount') }}:</span>
            <span class="value price-value">{{ currentPurchaseOrder.purchaseAmount }}</span>
          </div>
          <div class="info-item">
            <span class="label">{{ t('orders.accountBalance') }}:</span>
            <span class="value balance-value">{{ formatMoney(accountBalance) }}</span>
          </div>
        </div>
        <div class="divider"></div>
        <el-form :model="purchaseForm" label-position="top" class="purchase-form">
          <el-form-item :label="t('orders.password')" required>
            <el-input 
              v-model="purchaseForm.password" 
              type="password"
              :placeholder="t('orders.pleaseInputPassword')" 
              show-password
              clearable 
            />
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="purchaseDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleConfirmPurchase">
            {{ t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 充值提示对话框 -->
    <el-dialog
      v-model="rechargeDialogVisible"
      :title="t('orders.insufficientBalance')"
      width="90%"
      :close-on-click-modal="false"
      class="recharge-dialog"
    >
      <div class="recharge-container">
        <div class="recharge-info">
          <el-icon class="warning-icon" color="#E6A23C"><Warning /></el-icon>
          <p class="message">{{ t('orders.balanceNotEnough') }}</p>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="rechargeDialogVisible = false">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="handleRecharge">
            {{ t('orders.goRecharge') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getOrderList, getOrderDetail, getPendingOrderCount, confirmPurchase, getAccountBalance } from '@/api/order'
import { getRefundList, approveRefund } from '@/api/product'
import { formatMoney, unformatMoney } from '@/utils/format'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useOrderStore } from '@/stores/order'
import { Picture, Warning, Loading } from '@element-plus/icons-vue'

const { t } = useI18n()
const router = useRouter()
const orderStore = useOrderStore()

// 标签页配置
const tabs = [
  { name: 'orders', title: 'menu.orders' },
  { name: 'refunds', title: 'menu.refundRequests' }
]
const activeTab = ref('orders')

// 切换标签页
const switchTab = (tab) => {
  activeTab.value = tab
  
  // 切换到退款标签页时，获取退款数据
  if (tab === 'refunds' && refunds.value.length === 0) {
    refundPageIndex.value = 1
    getRefunds()
  }
}

// 订单相关
const pageIndex = ref(1)
const pageSize = ref(10)
const total = ref(0)
const selectedOrders = ref([])
const pendingOrderCount = ref(0)

const queryForm = ref({
  orderNo: '',
  purchaseStatus: '',
  logisticsStatus: ''
})

// 监听采购状态变化
watch(() => queryForm.value.purchaseStatus, (newValue) => {
  if (newValue !== 0) { // 不是待采购时，重置物流状态
    queryForm.value.logisticsStatus = ''
  } else if (queryForm.value.logisticsStatus !== 0 && queryForm.value.logisticsStatus !== '') {
    // 如果是待采购，且当前物流状态不是待发货也不是空，则重置为空
    queryForm.value.logisticsStatus = ''
  }
})

// 获取物流状态
const getShippingStatus = (status) => {
  switch (status) {
    case 0:
      return t('orders.shipping')
    case 1:
      return t('orders.transition')
    case 2:
      return t('orders.signed')
    case 3:
      return t('orders.completed')
    case 4:
      return t('orders.refunding')
    case 5:
      return t('orders.cancelled')
    case 6:
      return t('orders.refunded')
  }
}

// 获取物流状态类型
const getLogisticsStatusType = (status) => {
  switch (status) {
    case 0: // 发货中
      return 'warning'
    case 1: // 运输中
      return 'primary'
    case 2: // 已签收
      return 'success'
    case 3: // 已完成
      return 'success'
    case 4: // 退款中
      return 'warning'
    case 5: // 已取消
      return 'info'
    case 6: // 已退款
      return 'info'
    default:
      return 'info'
  }
}

// 模拟订单数据
const orders = ref([])

// 处理表格选择
const handleSelectionChange = (selection) => {
  selectedOrders.value = selection
}

// 查询方法
const handleQuery = () => {
  pageIndex.value = 1
  getOrders()
}

// 重置查询
const resetQuery = () => {
  queryForm.value = {
    orderNo: '',
    purchaseStatus: '',
    logisticsStatus: ''
  }
  handleQuery()
}

// 分页
const handleCurrentChange = (page) => {
  pageIndex.value = page
  getOrders()
}

// 获取订单列表
const loading = ref(false)
const hasMore = ref(true)

const getOrders = () => {
  loading.value = true
  const data = {
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    shopId: sessionStorage.getItem('shopId'),
    orderNo: queryForm.value.orderNo,
    purchaseStatus: queryForm.value.purchaseStatus,
    logisticsStatus: queryForm.value.logisticsStatus
  }
  getOrderList(data).then(res => {
    if (res.code === 0) {
      const newOrders = res.data.records.map(item => ({
        orderNo: item.orderNo,
        receiverName: item.receiverName,
        purchaseAmount: formatMoney(item.purchaseAmount),
        orderAmount: formatMoney(item.orderAmount),
        profit: formatMoney(item.profit),
        payStatus: item.payStatus,
        purchaseStatus: item.purchaseStatus,
        logisticsStatus: item.logisticsStatus,
        orderTime: item.orderTime
      }))
      
      if (pageIndex.value === 1) {
        orders.value = newOrders
      } else {
        orders.value = [...orders.value, ...newOrders]
      }
      
      total.value = res.data.total
      hasMore.value = orders.value.length < total.value
    } else {
      ElMessage.error(t('common.error'))
    }
  }).catch(err => {
    console.error('获取订单列表失败:', err)
    ElMessage.error(t('common.error'))
  }).finally(() => {
    loading.value = false
  })
}

// 加载更多订单
const loadMoreOrders = () => {
  if (loading.value || !hasMore.value) return
  pageIndex.value++
  getOrders()
}

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentOrder = ref({})
const purchaseDialogVisible = ref(false)
const rechargeDialogVisible = ref(false)
const purchaseForm = ref({
  password: '',
  purchaseAmount: 0,
  orderTime: ''
})
const accountBalance = ref(0) // 假数据：账户余额

// 获取账户余额
const getBalance = () => {
  const params = {
    shopId: sessionStorage.getItem('shopId')
  }
  getAccountBalance(params).then(res => {
    if(res.code == 0){
      accountBalance.value = res.data
    }else{
      console.log(res.message)
      ElMessage.error(t('common.error'))
    }
  })
}

const currentPurchaseOrder = ref({})

// 处理查看详情 - 跳转到详情页面
const goToDetail = (row) => {
  sessionStorage.setItem('currentOrderNo', row.orderNo)
  router.push('/m/order-detail')
}

// 处理采购点击
const handlePurchase = (row) => {
  currentPurchaseOrder.value = row
  console.log('采购订单：', row)
  // 使用unformatMoney处理金额
  purchaseForm.value.purchaseAmount = unformatMoney(row.purchaseAmount)
  selectedOrders.value = [row]  
  purchaseDialogVisible.value = true
}

// 确认采购
const handleConfirmPurchase = () => {
  if (!purchaseForm.value.password) {
    ElMessage.warning(t('orders.pleaseInputPassword'))
    return
  }
  
  // 检查余额是否充足
  const purchaseAmount = purchaseForm.value.purchaseAmount
  console.log('采购金额：', purchaseAmount, '账户余额：', accountBalance.value)
  if (accountBalance.value < purchaseAmount) {
    purchaseDialogVisible.value = false
    rechargeDialogVisible.value = true
    return
  }

  const data = {
    shopId: sessionStorage.getItem('shopId'),
    orders: selectedOrders.value.map(order => ({
      orderNo: order.orderNo,
      createdAt: order.orderTime
    })),
    purchaseAmount: purchaseAmount,
    password: btoa(purchaseForm.value.password)
  }
  
  confirmPurchase(data).then(res => {
    if(res.code == 0){
      ElMessage.success(t('orders.purchaseSuccess'))
      // 更新待处理订单数量
      orderStore.updatePendingOrderCount()
    }else if(res.code == -2){
      ElMessage.error(t('orders.wrongPassword'))
    }else if(res.code == -3){
      ElMessage.error(t('orders.balanceNotEnough'))
    }else{
      ElMessage.error(t('orders.purchaseFailed'))
    }
    // 刷新订单列表
    getOrders()
  })

  if (selectedOrders.value.length > 0) {
    console.log('批量采购订单：', selectedOrders.value)
  } else {
    console.log('采购单个订单：', currentPurchaseOrder.value)
  }
  
  purchaseDialogVisible.value = false
  purchaseForm.value.password = ''
  // 清空选中的订单
  selectedOrders.value = []
}

// 去充值
const handleRecharge = () => {
  rechargeDialogVisible.value = false
  router.push('/m/wallet')
}

// 获取待处理订单数量
const getPendingOrderCountData = () => {
  const params = {
    shopId: sessionStorage.getItem('shopId')
  }
  getPendingOrderCount(params).then(res => {
    pendingOrderCount.value = res.data
  })
}

// 退款相关
const refundSearchForm = ref({
  refundStatus: ''
})
const refunds = ref([])
const refundTotal = ref(0)
const refundLoading = ref(false)
const refundPageIndex = ref(1)
const refundPageSize = ref(10)
const hasMoreRefunds = ref(true)

// 获取退款列表
const getRefunds = () => {
  refundLoading.value = true
  const data = {
    pageIndex: refundPageIndex.value,
    pageSize: refundPageSize.value,
    shopId: sessionStorage.getItem('shopId'),
    refundStatus: refundSearchForm.value.refundStatus
  }
  getRefundList(data).then(res => {
    if (res.code === 0) {
      const newRefunds = res.data.records.map(item => ({
        orderNo: item.orderNo,
        orderAmount: formatMoney(item.orderAmount),
        refundReason: item.refundReason,
        refundMark: item.refundMark,
        refundStatus: item.refundStatus,
        refundTime: item.refundTime,
        buyerId: item.buyerId,
        sellerId: item.sellerId,
        purchaseAmount: item.purchaseAmount
      }))
      
      if (refundPageIndex.value === 1) {
        refunds.value = newRefunds
      } else {
        refunds.value = [...refunds.value, ...newRefunds]
      }
      
      refundTotal.value = res.data.total
      hasMoreRefunds.value = refunds.value.length < refundTotal.value
    } else {
      ElMessage.error(t('common.error'))
    }
  }).finally(() => {
    refundLoading.value = false
  })
}

// 重置退款查询
const resetRefundQuery = () => {
  refundSearchForm.value.refundStatus = ''
  refundPageIndex.value = 1
  getRefunds()
}

// 加载更多退款
const loadMoreRefunds = () => {
  if (refundLoading.value || !hasMoreRefunds.value) return
  refundPageIndex.value++
  getRefunds()
}

// 获取退款原因
const getRefundReason = (status) => {
  switch (status) {
    case 0:
      return t('orders.dontWant')
    case 1:
      return t('orders.qualityIssues')
    case 2:
      return t('orders.logisticsIssues')
    case 3:
      return t('orders.other')
  }
}

// 获取退款状态
const getRefundStatus = (status) => {
  switch (status) {
    case 0:
      return t('orders.pending')
    case 1:
      return t('orders.approved')
    case 2:
      return t('orders.rejected')
    default:
      return '-'
  }
}

// 处理查看退款详情 - 跳转到详情页面
const goToRefundDetail = (row) => {
  sessionStorage.setItem('currentOrderNo', row.orderNo)
  router.push('/m/order-detail')
}

// 处理退款审批
const handleApprove = (row) => {
  ElMessageBox.confirm(
    t('orders.confirmApproveRefund', { orderNo: row.orderNo }),
    t('orders.confirmApprove'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    const data = {
      orderNo: row.orderNo,
      buyerId: row.buyerId,
      sellerId: row.sellerId,
      orderAmount: unformatMoney(row.orderAmount),
      purchaseAmount: unformatMoney(row.purchaseAmount)
    }
    approveRefund(data).then(res => {
      if (res.code === 0) {
        ElMessage.success(t('orders.approveSuccess'))
        getRefunds()
      } else {
        ElMessage.error(t('common.error'))
      }
    })
  }).catch(() => {})
}

// 滚动处理函数
const handleScroll = (e) => {
  const container = e.target
  
  // 计算距离底部的距离
  const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
  
  // 当距离底部小于100px时加载更多数据
  if (distanceToBottom < 100) {
    // 根据当前活动的标签页加载相应的数据
    if (activeTab.value === 'orders') {
      // 如果正在加载或没有更多数据，则直接返回
      if (loading.value || !hasMore.value) return
      loadMoreOrders()
    } else if (activeTab.value === 'refunds') {
      // 如果正在加载或没有更多退款数据，则直接返回
      if (refundLoading.value || !hasMoreRefunds.value) return
      loadMoreRefunds()
    }
  }
}

onMounted(() => {
  getBalance()
  getOrders()
  getRefunds()
  
  // 检查是否已经有可加载的数据
  setTimeout(() => {
    const container = document.querySelector('.content-container')
    if (container && container.scrollHeight <= container.clientHeight) {
      // At this point I will check which tab is active and load more if needed
      if (activeTab.value === 'orders' && hasMore.value) {
        loadMoreOrders()
      } else if (activeTab.value === 'refunds' && hasMoreRefunds.value) {
        loadMoreRefunds()
      }
    }
  }, 500)
})
</script>

<style scoped>
.mobile-orders-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 90;
  background-color: #f5f7fa;
}

.tabs-header {
  display: flex;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 90;
  height: 45px;
  flex-shrink: 0;
}

.tab-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-size: 14px;
  color: #606266;
  position: relative;
  cursor: pointer;
}

.tab-item.active {
  color: #409EFF;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 3px;
  background-color: #409EFF;
  border-radius: 2px;
}

.content-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 60px;
  -webkit-overflow-scrolling: touch;
}

.tab-content {
  padding: 10px 12px;
}

.filter-area {
  background-color: #fff;
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  gap: 10px;
}

.filter-item {
  flex: 1;
}

.filter-select {
  width: 100%;
}

.order-list {
  margin-top: 8px;
}

.order-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-no {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.order-time {
  color: #909399;
  font-size: 12px;
}

.order-info {
  margin-bottom: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.info-row .label {
  color: #606266;
  font-size: 12px;
  margin-right: 8px;
}

.order-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.amount-info {
  display: flex;
  flex-direction: column;
}

.amount {
  color: #f56c6c;
  font-weight: 500;
  font-size: 14px;
}

.profit {
  color: #67c23a;
  font-size: 12px;
  margin-top: 2px;
}

.action-links {
  display: flex;
  gap: 15px;
}

.action-link {
  color: #409eff;
  font-size: 14px;
  cursor: pointer;
}

.action-link.purchase-link {
  color: #67c23a;
}

.detail-container {
  padding: 0 0 24px 0;
}

.detail-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
  padding: 16px 24px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.summary-grid,
.receiver-grid {
  padding: 16px 24px;
}

.info-row {
  display: flex;
  margin-bottom: 16px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  flex: 1;
  align-items: flex-start;
}

.info-item.full-width {
  flex: 2;
}

.info-item.status-item {
  align-items: center;
}

.info-item .value {
  flex: 1;
  color: #303133;
  font-weight: 500;
  text-align: left;
}

.value.text-left {
  text-align: left;
  padding-left: 4px;
}

.price-value {
  color: #f56c6c;
  font-weight: 500;
}

.status-tag {
  border-radius: 2px;
  height: 24px;
  line-height: 24px;
  margin-top: 4px;
}

.table-wrapper {
  padding: 16px 24px 0;
}

:deep(.el-table) {
  width: 100% !important;
}

:deep(.el-table__header) {
  background-color: #fafafa;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  padding: 12px 0;
}

:deep(.el-table__fixed-right-patch) {
  background-color: #fafafa !important;
}

:deep(.el-table td) {
  padding: 12px 8px;
}

.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  background-color: #f5f7fa;
}

.order-total {
  text-align: right;
  padding: 16px 40px;
  font-size: 14px;
  color: #606266;
  border-top: 1px solid #ebeef5;
  margin: 0 24px;
}

.total-amount {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
  margin-left: 8px;
}

.purchase-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    background-color: #f5f7fa;
  }

  :deep(.el-dialog__headerbtn) {
    top: 16px;
    right: 16px;
  }

  :deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 500;
    color: #303133;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 12px 16px;
    border-top: 1px solid #ebeef5;
    background-color: #f5f7fa;
  }
}

.purchase-container {
  padding: 20px 16px;
}

.amount-info {
  display: flex;
  flex-direction: column;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #606266;
  font-size: 14px;
  width: 100px;
  margin-right: 8px;
}

.info-item .value {
  color: #303133;
  font-size: 14px;
  font-weight: 500;
}

.value.order-id {
  color: #409eff;
  font-weight: normal;
  font-family: monospace;
}

.value.price-value {
  color: #f56c6c;
}

.value.balance-value {
  color: #67c23a;
}

.divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 20px 0;
}

.purchase-form {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  padding: 0 0 8px;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
  text-align: left;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.recharge-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    background-color: #f5f7fa;
  }

  :deep(.el-dialog__body) {
    padding: 24px 16px;
  }
}

.recharge-container {
  text-align: center;
}

.recharge-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.warning-icon {
  font-size: 48px;
}

.message {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.refund-list {
  margin-top: 8px;
}

.refund-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.refund-item {
  background-color: #fff;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 0;
  border-bottom: none;
}

.refund-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.refund-header .order-no {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.refund-header .refund-time {
  color: #909399;
  font-size: 12px;
}

.refund-info {
  margin-bottom: 10px;
}

.refund-info .info-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.refund-info .info-row .label {
  color: #606266;
  font-size: 12px;
  margin-right: 8px;
}

.refund-info .value.price {
  color: #f56c6c;
  font-weight: 500;
}

.refund-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.load-more {
  text-align: center;
  margin: 12px 0;
}

.loading-icon {
  animation: rotating 1s linear infinite;
}

.no-more {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 12px 0;
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style> 
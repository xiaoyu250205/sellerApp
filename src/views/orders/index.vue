<template>
  <div class="orders-container">
      <el-card class="table-card">
        <div class="query-container">
          <el-form :model="queryForm" label-width="100px" :inline="true" class="query-form">
            <el-form-item :label="t('orders.orderId')">
              <el-input v-model="queryForm.orderNo" :placeholder="t('orders.pleaseInputOrderId')" clearable />
            </el-form-item>
            <el-form-item :label="t('orders.purchaseStatus')">
              <el-select v-model="queryForm.purchaseStatus" :placeholder="t('orders.pleaseSelectPurchaseStatus')" clearable>
                <el-option :label="t('orders.purchase')" :value="0" />
                <el-option :label="t('orders.purchased')" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item :label="t('orders.shippingStatus')">
              <el-select 
                v-model="queryForm.logisticsStatus" 
                :placeholder="t('orders.pleaseSelectShippingStatus')" 
                clearable
              >
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
            </el-form-item>
            <el-form-item class="query-buttons">
              <el-button type="primary" @click="handleQuery">{{ t('common.query') }}</el-button>
              <el-button @click="resetQuery">{{ t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
      </div>

      <div class="batch-container" style="margin-bottom: 20px;display: flex;justify-content: flex-start;">
        <el-button type="primary" @click="handleBatchPurchase">{{ t('orders.batchPurchase') }}</el-button>
      </div>

      <el-table :data="orders" style="width: 100%" @selection-change="handleSelectionChange">
        <el-table-column 
          type="selection" 
          :selectable="row => row.purchaseStatus === 0 && row.logisticsStatus !== 5" 
          width="55" 
        />
        <el-table-column prop="orderNo" :label="t('orders.orderId')"  width="200"/>
        <el-table-column prop="receiverName" :label="t('orders.receiverName')"  />
        <el-table-column prop="purchaseAmount" :label="t('orders.purchaseAmount')" >
          <template #default="{ row }">
            {{ row.purchaseAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="orderAmount" :label="t('orders.amount')" >
          <template #default="{ row }">
            {{ row.orderAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="profit" :label="t('orders.profit')" >
          <template #default="{ row }">
            {{ row.profit }}
          </template>
        </el-table-column>
        <el-table-column prop="payStatus" :label="t('orders.orderStatus')" >
          <template #default="{ row }">
            {{ row.payStatus == 1 ? t('orders.paid') : t('orders.pending') }}
          </template>
        </el-table-column>
        <el-table-column prop="purchaseStatus" :label="t('orders.purchaseStatus')" >
          <template #default="{ row }">
            <el-tag :type="row.purchaseStatus == 0 ? 'danger' : 'success'">
              {{ row.purchaseStatus == 0 ? t('orders.purchase') : t('orders.purchased') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="logisticsStatus" :label="t('orders.shippingStatus')" >
          <template #default="{ row }">
            <el-tag :type="getLogisticsStatusType(row.logisticsStatus)">
              {{ getShippingStatus(row.logisticsStatus) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="orderTime" :label="t('orders.createdAt')" width="180"/>
        <el-table-column :label="t('common.actions')" align="center" width="150">
          <template #default="{ row }">
            <div class="action-links">
              <span class="action-link" @click="handleDetail(row)">{{ t('orders.detail') }}</span>
              <span 
                v-if="row.purchaseStatus === 0 && row.logisticsStatus !== 5" 
                class="action-link purchase-link" 
                @click="handlePurchase(row)"
              >
                {{ t('orders.purchaseing') }}
              </span>
              <span v-else class="action-link purchase-link placeholder"></span>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <div class="pagination-info">{{ t('common.pagination.total', { total: total }) }}</div>
        <el-pagination
        v-model:current-page="pageIndex"
        v-model:page-size="pageSize"
        :disabled="disabled"
        :total="total"
        layout="prev, pager, next"
        @current-change="handleCurrentChange"
      />
      </div>
      
      
    </el-card>

    <!-- 订单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      :title="t('orders.orderDetail')"
      width="900px"
      :close-on-click-modal="false"
    >
      <div class="detail-container">
        <!-- 订单摘要 -->
        <div class="detail-section">
          <h3 class="section-title">{{ t('orders.orderSummary') }}</h3>
          <div class="summary-grid">
            <div class="info-row">
              <div class="info-item">
                <span class="label">{{ t('orders.orderId') }}:</span>
                <span class="value text-left">{{ currentOrder.orderNo }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('orders.createdAt') }}:</span>
                <span class="value text-left">{{ currentOrder.orderTime }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="label">{{ t('orders.amount') }}:</span>
                <span class="value text-left price-value">{{ formatMoney(currentOrder.orderAmount) }}</span>
              </div>
              <div class="info-item status-item">
                <span class="label">{{ t('orders.purchaseStatus') }}:</span>
                <el-tag :type="currentOrder.purchaseStatus == 0 ? 'warning' : 'success'" class="status-tag">
                  {{ currentOrder.purchaseStatus == 0 ? t('orders.purchase') : t('orders.purchased') }}
                </el-tag>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="label">{{ t('orders.purchaseAmount') }}:</span>
                <span class="value text-left">{{ formatMoney(currentOrder.purchaseAmount) || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('orders.purchaseTime') }}:</span>
                <span class="value text-left">{{ currentOrder.purchaseTime || '-' }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="label">{{ t('orders.profit') }}:</span>
                <span class="value text-left price-value">{{ formatMoney(currentOrder.profit) || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('orders.paymentMethod') }}:</span>
                <span class="value text-left">{{ currentOrder.paymentMethod || '-' }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item status-item">
                <span class="label">{{ t('orders.orderStatus') }}:</span>
                <el-tag :type="currentOrder.payStatus == 1 ? 'success' : 'warning'" class="status-tag">
                  {{ currentOrder.payStatus == 1 ? t('orders.paid') : t('orders.pending') }}
                </el-tag>
              </div>
              <div class="info-item status-item">
                <span class="label">{{ t('orders.shippingStatus') }}:</span>
                <el-tag :type="getLogisticsStatusType(currentOrder.logisticsStatus)" class="status-tag">
                  {{ getShippingStatus(currentOrder.logisticsStatus) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <!-- 收货人信息 -->
        <div class="detail-section">
          <h3 class="section-title">{{ t('orders.receiverInfo') }}</h3>
          <div class="receiver-grid">
            <div class="info-row">
              <div class="info-item">
                <span class="label">{{ t('orders.receiverName') }}:</span>
                <span class="value text-left">{{ currentOrder.receiverName }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('orders.receiverPhone') }}:</span>
                <span class="value text-left">{{ currentOrder.receiverPhone }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item full-width">
                <span class="label">{{ t('orders.receiverAddress') }}:</span>
                <span class="value text-left">{{ currentOrder.receiverAddress }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="detail-section">
          <h3 class="section-title">{{ t('orders.productInfo') }}</h3>
          <div class="table-wrapper">
            <el-table :data="currentOrder.orderItems" border>
              <el-table-column :label="t('orders.productImage')" width="120" align="center" show-overflow-tooltip="false">
                <template #default="{ row }">
                  <div class="image-container">
                    <el-image 
                      style="width: 60px; height: 60px" 
                      :src="row.imageUrl" 
                      fit="cover"
                      :preview-src-list="[row.imageUrl]"
                    >
                      <template #error>
                        <div class="image-placeholder">
                          <el-icon><Picture /></el-icon>
                        </div>
                      </template>
                    </el-image>
                  </div>
                </template>
              </el-table-column>
              <el-table-column prop="productName" :label="t('orders.productName')" min-width="120" show-overflow-tooltip />
              <el-table-column prop="quantity" :label="t('orders.quantity')" width="80" align="center" />
              <el-table-column prop="unitPrice" :label="t('orders.price')" width="120" align="right">
                <template #default="{ row }">
                  {{ formatMoney(row.unitPrice) }}
                </template>
              </el-table-column>
              <el-table-column prop="totalAmount" :label="t('orders.totalAmount')" width="120" align="right">
                <template #default="{ row }">
                  {{ formatMoney(row.quantity * row.unitPrice) }}
                </template>
              </el-table-column>
            </el-table>
          </div>
          <div class="order-total">
            <span>{{ t('orders.orderAmount') }}:</span>
            <span class="total-amount">{{ formatMoney(currentOrder.orderAmount) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 采购确认对话框 -->
    <el-dialog
      v-model="purchaseDialogVisible"
      :title="t('orders.confirmPurchase')"
      width="460px"
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
        <el-form :model="purchaseForm" label-width="120px" class="purchase-form">
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
      width="360px"
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
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { getOrderList, getOrderDetail, getPendingOrderCount, confirmPurchase, getAccountBalance } from '@/api/order'
import { formatMoney, unformatMoney } from '@/utils/format'
import { ElMessage } from 'element-plus'
import { useOrderStore } from '@/stores/order'

const { t } = useI18n()
const router = useRouter()

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

const orderStore = useOrderStore()

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
    orderId: '',
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
const getOrders = () => {
  const data = {
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    shopId: sessionStorage.getItem('shopId'),
    orderNo: queryForm.value.orderNo,
    purchaseStatus: queryForm.value.purchaseStatus,
    logisticsStatus: queryForm.value.logisticsStatus
  }
  getOrderList(data).then(res => {
    orders.value = res.data.records.map(item => ({
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
    total.value = res.data.total
  })
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
// 处理查看详情
const handleDetail = (row) => {
  const params = {
    orderNo: row.orderNo
  }
  getOrderDetail(params).then(res => {
    if(res.code == 0){
      currentOrder.value = res.data
      detailDialogVisible.value = true
    }else{
      console.log(res.message)
      ElMessage.error(t('common.error'))
    }
  })
}

// 处理采购点击
const handlePurchase = (row) => {
  currentPurchaseOrder.value = row
  // 使用unformatMoney处理金额
  purchaseForm.value.purchaseAmount = unformatMoney(row.purchaseAmount)
  selectedOrders.value = [row]  
  purchaseDialogVisible.value = true
}

// 处理批量采购点击
const handleBatchPurchase = () => {
  if (selectedOrders.value.length === 0) {
    ElMessage.warning(t('orders.pleaseSelectOrders'))
    return
  }

  // 计算总采购金额
  const totalAmount = selectedOrders.value.reduce((sum, order) => {
    return sum + unformatMoney(order.purchaseAmount)
  }, 0)

  currentPurchaseOrder.value = {
    orderNo: `${t('orders.selectedOrderCount', { count: selectedOrders.value.length })}`,
    purchaseAmount: formatMoney(totalAmount)
  }
  purchaseForm.value.purchaseAmount = totalAmount
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
    if(res.code === 0){
      ElMessage.success(t('orders.purchaseSuccess'))
      // 更新待处理订单数量
      orderStore.updatePendingOrderCount()
    }else if(res.code === -2){
      ElMessage.error(t('orders.wrongPassword'))
    }else if(res.code === -3){
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
  const userInfo = {
    uid: sessionStorage.getItem('shopId'),
    name: sessionStorage.getItem('shopName'),
    email: sessionStorage.getItem('userId'),
  }
  const userInfoStr = encodeURIComponent(JSON.stringify(userInfo))
  window.open(`https://qptkyyb.hjmckjwosnqjry.top/index?key=c5da9e9a97eab000f608f44c8f2fa996&gid=801104f71e7812dfed530fd8f58effbd&userInfo=${userInfoStr}`, '_blank')
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

onMounted(() => {
  getBalance()
  getOrders()
})


</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h2 {
  margin: 0;
  font-size: 24px;
  color: #1f2f3d;
}

.table-card {
  margin-top: 20px;
}

:deep(.el-card__body) {
  padding: 20px;
}

.pagination-container {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.query-container {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}

:deep(.el-input),
:deep(.el-select) {
  width: 220px;
}

.query-buttons {
  margin-left: auto;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
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

.action-links {
  display: flex;
  justify-content: center;
  gap: 12px;
  min-width: 120px;
}

.action-link {
  color: #409EFF;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  min-width: 48px;
  text-align: center;
}

.action-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.placeholder {
  visibility: hidden;
  pointer-events: none;
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

.info-item .label {
  color: #606266;
  width: 120px;
  text-align: right;
  margin-right: 12px;
  flex-shrink: 0;
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
    padding: 20px 24px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fafafa;
  }

  :deep(.el-dialog__headerbtn) {
    top: 20px;
    right: 20px;
  }

  :deep(.el-dialog__title) {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid #ebeef5;
    background-color: #fafafa;
  }
}

.purchase-container {
  padding: 32px 24px;
}

.amount-info {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 14px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item .label {
  color: #606266;
  width: 120px;
  text-align: right;
  margin-right: 12px;
  flex-shrink: 0;
}

.info-item .value {
  flex: 1;
  color: #303133;
  font-weight: 500;
  text-align: left;
  padding-left: 4px;
}

.info-item .order-id {
  font-family: Consolas, Monaco, monospace;
  letter-spacing: 0.5px;
}

.info-item .price-value {
  color: #f56c6c;
  font-size: 16px;
  font-weight: 600;
}

.info-item .balance-value {
  color: #67c23a;
  font-size: 16px;
  font-weight: 600;
}

.divider {
  height: 1px;
  background-color: #ebeef5;
  margin: 24px 0;
}

.purchase-form {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
  padding-right: 12px;
}

:deep(.el-form-item__content) {
  flex: 1;
}

:deep(.el-input__wrapper) {
  width: 100%;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset !important;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}

:deep(.el-button) {
  min-width: 100px;
  padding: 8px 20px;
  font-weight: 500;
  border-radius: 4px;
  font-size: 14px;
  height: 36px;
}

:deep(.el-button--default) {
  border-color: #dcdfe6;
}

:deep(.el-button--default:hover) {
  border-color: #c0c4cc;
  color: #606266;
  background-color: #f5f7fa;
}

:deep(.el-button--primary) {
  background-color: #409eff;
  border-color: #409eff;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.recharge-dialog {
  :deep(.el-dialog__header) {
    margin: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fafafa;
  }

  :deep(.el-dialog__body) {
    padding: 32px 24px;
  }

  :deep(.el-dialog__footer) {
    padding: 16px 24px;
    border-top: 1px solid #ebeef5;
    background-color: #fafafa;
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
</style> 
<template>
  <div class="refunds-container">
    <el-card>
      <div class="content">
        <div class="query-container">
          <el-form :model="queryForm" label-width="100px" :inline="true" class="query-form">
            <el-form-item :label="t('orders.orderId')">
              <el-input v-model="queryForm.orderNo" :placeholder="t('orders.pleaseInputOrderId')" clearable />
            </el-form-item>
            <el-form-item :label="t('orders.refundStatus')"label-width="160px">
              <el-select v-model="queryForm.refundStatus" :placeholder="t('orders.pleaseSelectRefundStatus')" clearable>
                <el-option :label="t('orders.pending')" :value="0" />
                <el-option :label="t('orders.approved')" :value="1" />
              </el-select>
            </el-form-item>
            <el-form-item class="query-buttons">
              <el-button type="primary" @click="handleQuery">{{ t('common.query') }}</el-button>
              <el-button @click="resetQuery">{{ t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="refunds" style="width: 100%">
          <el-table-column prop="orderNo" :label="t('orders.orderId')" width="200"/>
          <el-table-column prop="refundTime" :label="t('orders.refundTime')" width="200"/>
          <el-table-column prop="orderAmount" :label="t('orders.amount')">
            <template #default="{ row }">
              {{ formatMoney(row.orderAmount) }}
            </template>
          </el-table-column>
          <el-table-column prop="refundReason" :label="t('orders.refundReason')">
            <template #default="{ row }">
              {{ getRefundReason(row.refundReason) }}
          </template>
          </el-table-column
          <el-table-column prop="refundMark" :label="t('orders.refundMark')"/>
          <el-table-column prop="purchaseStatus" :label="t('orders.purchaseStatus')" >
          <template #default="{ row }">
            <el-tag :type="row.purchaseStatus == 0 ? 'danger' : 'success'">
              {{ row.purchaseStatus == 0 ? t('orders.purchase') : t('orders.purchased') }}
            </el-tag>
          </template>
        </el-table-column>
          <el-table-column prop="orderTime" :label="t('orders.createdAt')" width="200"/>
          <el-table-column prop="refundStatus" :label="t('orders.refundStatus')">
            <template #default="{ row }">
              {{ getRefundStatus(row.refundStatus) }}
            </template>
          </el-table-column>
          <el-table-column :label="t('common.actions')" align="center" width="160">
            <template #default="{ row }">
              <div class="action-links">
                <span class="action-link" @click="handleDetail(row)">{{ t('orders.detail') }}</span>
                <span 
                  v-if="row.refundStatus === 0" 
                  class="action-link approve-link" 
                  @click="handleApprove(row)"
                >
                  {{ t('orders.approve') }}
                </span>
                <span v-else class="action-link placeholder"></span>
              </div>
            </template>
          </el-table-column>
        </el-table>

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

    <!-- 退款详情对话框 -->
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
                <span class="value text-left">{{ currentRefund.orderNo }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('orders.createdAt') }}:</span>
                <span class="value text-left">{{ currentRefund.orderTime }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="label">{{ t('orders.amount') }}:</span>
                <span class="value text-left price-value">{{ formatMoney(currentRefund.orderAmount) }}</span>
              </div>
              <div class="info-item status-item">
                <span class="label">{{ t('orders.purchaseStatus') }}:</span>
                <el-tag :type="currentRefund.purchaseStatus == 0 ? 'warning' : 'success'" class="status-tag">
                  {{ currentRefund.purchaseStatus == 0 ? t('orders.purchase') : t('orders.purchased') }}
                </el-tag>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="label">{{ t('orders.purchaseAmount') }}:</span>
                <span class="value text-left">{{ formatMoney(currentRefund.purchaseAmount) || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('orders.purchaseTime') }}:</span>
                <span class="value text-left">{{ currentRefund.purchaseTime || '-' }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="label">{{ t('orders.profit') }}:</span>
                <span class="value text-left price-value">{{ formatMoney(currentRefund.profit) || '-' }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('orders.paymentMethod') }}:</span>
                <span class="value text-left">{{ currentRefund.paymentMethod || '-' }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item status-item">
                <span class="label">{{ t('orders.orderStatus') }}:</span>
                <el-tag :type="currentRefund.payStatus == 1 ? 'success' : 'warning'" class="status-tag">
                  {{ currentRefund.payStatus == 1 ? t('orders.paid') : t('orders.pending') }}
                </el-tag>
              </div>
              <div class="info-item status-item">
                <span class="label">{{ t('orders.shippingStatus') }}:</span>
                <el-tag :type="getShippingStatusType(currentRefund.logisticsStatus)" class="status-tag">
                  {{ getShippingStatus(currentRefund.logisticsStatus) }}
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
                <span class="value text-left">{{ currentRefund.receiverName }}</span>
              </div>
              <div class="info-item">
                <span class="label">{{ t('orders.receiverPhone') }}:</span>
                <span class="value text-left">{{ currentRefund.receiverPhone }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item full-width">
                <span class="label">{{ t('orders.receiverAddress') }}:</span>
                <span class="value text-left">{{ currentRefund.receiverAddress }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 商品信息 -->
        <div class="detail-section">
          <h3 class="section-title">{{ t('orders.productInfo') }}</h3>
          <div class="table-wrapper">
            <el-table :data="currentRefund.orderItems" border>
              <el-table-column :label="t('orders.productImage')" width="100" align="center">
                <template #default="{ row }">
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
                </template>
              </el-table-column>
              <el-table-column prop="productName" :label="t('orders.productName')" min-width="140" show-overflow-tooltip />
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
            <span class="total-amount">{{ formatMoney(currentRefund.orderAmount) }}</span>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatMoney } from '@/utils/format'
import { getRefundList, approveRefund } from '@/api/product'
import { getOrderDetail } from '@/api/order'

const { t } = useI18n()

// 查询表单
const queryForm = ref({
  orderNo: '',
  refundStatus: ''
})

// 分页相关
const pageIndex = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 退款列表数据
const refunds = ref([])

// 获取退款列表
const getRefundListData = () => {
  const data = {
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    shopId: sessionStorage.getItem('shopId'),
    orderNo: queryForm.value.orderNo,
    refundStatus: queryForm.value.refundStatus
  }
  getRefundList(data).then(res => {
    if(res.code === 0) {
      refunds.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(t('common.error'))
    }
  }).catch(err => {
    console.error('获取退款列表失败:', err)
    ElMessage.error(t('common.error'))
  })
}

// 查询方法
const handleQuery = () => {
  pageIndex.value = 1
  getRefundListData()
}

// 重置查询
const resetQuery = () => {
  queryForm.value = {
    orderNo: '',
    refundStatus: ''
  }
  handleQuery()
}

// 分页
const handleCurrentChange = (page) => {
  pageIndex.value = page
  getRefundListData()
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

// 获取退款状态类型
const getRefundStatusType = (status) => {
  switch (status) {
    case 0: // 待处理
      return 'warning'
    case 1: // 已通过
      return 'success'
    case 2: // 已拒绝
      return 'danger'
    default:
      return 'info'
  }
}

// 详情对话框相关
const detailDialogVisible = ref(false)
const currentRefund = ref({})

// 处理查看详情
const handleDetail = (row) => {
  const params = {
    orderNo: row.orderNo
  }
  getOrderDetail(params).then(res => {
    if(res.code === 0) {
      currentRefund.value = res.data
      detailDialogVisible.value = true
    } else {
      ElMessage.error(t('common.error'))
    }
  }).catch(err => {
    console.error('获取订单详情失败:', err)
    ElMessage.error(t('common.error'))
  })
}

// 处理审批点击
const handleApprove = (row) => {
  currentRefund.value = row
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
      orderNo: currentRefund.value.orderNo,
      buyerId: currentRefund.value.buyerId,
      sellerId: currentRefund.value.sellerId,
      orderAmount: currentRefund.value.orderAmount,
      purchaseAmount: currentRefund.value.purchaseAmount
    }
    approveRefund(data).then(res => {
      if(res.code === 0) {
        ElMessage.success(t('orders.approveSuccess'))
        getRefundListData()
      } else {
        ElMessage.error(t('common.error'))
      }
    }).catch(() => {
      ElMessage.error(t('common.error'))
    })
  }).catch(() => {})
}

// 处理拒绝点击
const handleReject = (row) => {
  currentRefund.value = row
  ElMessageBox.confirm(
    t('orders.confirmRejectRefund', { orderNo: row.orderNo }),
    t('orders.confirmReject'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    ElMessage.success(t('orders.rejectSuccess'))
    getRefundListData()
  }).catch(() => {})
}

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
const getShippingStatusType = (status) => {
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

onMounted(() => {
  getRefundListData()
})
</script>

<style scoped>
.refunds-container {
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

.approve-link {
  color: #67C23A;
}

.reject-link {
  color: #F56C6C;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
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
  background-color: #fafafa !important;
  color: #606266;
  font-weight: 500;
  padding: 8px;
}

:deep(.el-table__fixed-right) {
  border-left: 1px solid #EBEEF5;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.15);
}

:deep(.el-table__fixed-right::before) {
  display: none;
}

:deep(.el-table__fixed-right-patch) {
  background-color: #fafafa !important;
  border-bottom: 1px solid #EBEEF5;
}

:deep(.el-table__fixed-right .el-table__cell) {
  border-left: 1px solid #EBEEF5;
}

:deep(.el-table td) {
  padding: 12px 8px;
}

.image-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  border-radius: 4px;
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

.action-link.placeholder {
  visibility: hidden;
  pointer-events: none;
}
</style> 
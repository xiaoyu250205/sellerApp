<template>
  <div class="mobile-order-detail">
    <!-- 顶部标题栏 -->
    <div class="header">
      <div class="back-button" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="title">{{ t('orders.orderDetail') }}</div>
      <div class="placeholder"></div>
    </div>

    <!-- 内容区域 -->
    <div class="content-container" v-loading="loading">
      <!-- 订单摘要 -->
      <div class="detail-section">
        <h3 class="section-title">{{ t('orders.orderSummary') }}</h3>
        <div class="summary-grid">
          <div class="info-row">
            <div class="info-item">
              <span class="label">{{ t('orders.orderId') }}:</span>
              <span class="value text-left">{{ orderDetail.orderNo }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('orders.createdAt') }}:</span>
              <span class="value text-left">{{ orderDetail.orderTime }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">{{ t('orders.amount') }}:</span>
              <span class="value text-left price-value">{{ formatMoney(orderDetail.orderAmount) }}</span>
            </div>
            <div class="info-item status-item">
              <span class="label">{{ t('orders.purchaseStatus') }}:</span>
              <el-tag :type="orderDetail.purchaseStatus == 0 ? 'warning' : 'success'" class="status-tag">
                {{ orderDetail.purchaseStatus == 0 ? t('orders.purchase') : t('orders.purchased') }}
              </el-tag>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">{{ t('orders.purchaseAmount') }}:</span>
              <span class="value text-left">{{ formatMoney(orderDetail.purchaseAmount) || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('orders.purchaseTime') }}:</span>
              <span class="value text-left">{{ orderDetail.purchaseTime || '-' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">{{ t('orders.profit') }}:</span>
              <span class="value text-left price-value">{{ formatMoney(orderDetail.profit) || '-' }}</span>
            </div>
            <div class="info-item">
              <span class="label">{{ t('orders.paymentMethod') }}:</span>
              <span class="value text-left">{{ orderDetail.paymentMethod || '-' }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item">
              <span class="label">{{ t('orders.orderStatus') }}:</span>
              <span class="value text-left">{{ orderDetail.payStatus == 1 ? t('orders.paid') : t('orders.pending') }}</span>
            </div>
            <div class="info-item status-item">
              <span class="label">{{ t('orders.shippingStatus') }}:</span>
              <el-tag :type="getLogisticsStatusType(orderDetail.logisticsStatus)" class="status-tag">
                {{ getShippingStatus(orderDetail.logisticsStatus) }}
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
              <span class="value text-left">{{ orderDetail.receiverName }}</span>
            </div>
            <div class="info-item" >
              <span class="label">{{ t('orders.receiverPhone') }}:</span>
              <span class="value text-left">{{ orderDetail.receiverPhone }}</span>
            </div>
          </div>
          <div class="info-row">
            <div class="info-item full-width">
              <span class="label">{{ t('orders.receiverAddress') }}:</span>
              <span class="value text-left" style="overflow: hidden; white-space: nowrap; visibility: visible; max-width: 100%;">{{ orderDetail.receiverAddress }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="detail-section">
        <h3 class="section-title">{{ t('orders.productInfo') }}</h3>
        <div class="table-wrapper">
          <el-table :data="orderDetail.orderItems" border>
            <el-table-column :label="t('orders.productImage')" width="120" align="center" show-overflow-tooltip="false">
              <template #default="{ row }">
                <div class="image-container">
                  <el-image 
                    style="width: 60px; height: 60px" 
                    :src="row.imageUrl" 
                    fit="cover"
                    :preview-src-list="[row.imageUrl]"
                    :preview-teleported="true"
                    :initial-index="0"
                    preview-class="image-preview"
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
            <el-table-column prop="productName" :label="t('orders.productName')" min-width="180" show-overflow-tooltip />
            <el-table-column prop="quantity" :label="t('orders.quantity')" width="80" align="center" />
            <el-table-column prop="unitPrice" :label="t('orders.price')" width="100" align="right">
              <template #default="{ row }">
                {{ formatMoney(row.unitPrice) }}
              </template>
            </el-table-column>
            <el-table-column prop="totalAmount" :label="t('orders.totalAmount')" width="100" align="right">
              <template #default="{ row }">
                {{ formatMoney(row.quantity * row.unitPrice) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="order-total">
          <span>{{ t('orders.orderAmount') }}:</span>
          <span class="total-amount">{{ formatMoney(orderDetail.orderAmount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { getOrderDetail } from '@/api/order'
import { formatMoney } from '@/utils/format'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Picture } from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()
const loading = ref(false)
const orderDetail = ref({})

// 返回上一页
const goBack = () => {
  router.go(-1)
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

// 获取订单详情
const getOrderData = () => {
  const orderNo = sessionStorage.getItem('currentOrderNo')
  if (!orderNo) {
    ElMessage.error(t('orders.orderNotFound'))
    router.push('/m/orders')
    return
  }

  loading.value = true
  getOrderDetail({ orderNo }).then(res => {
    if (res.code === 0) {
      orderDetail.value = res.data
    } else {
      ElMessage.error(t('common.error'))
    }
  }).catch(err => {
    console.error('获取订单详情失败:', err)
    ElMessage.error(t('common.error'))
  }).finally(() => {
    loading.value = false
  })
}

onMounted(() => {
  getOrderData()
})
</script>

<style scoped>
.mobile-order-detail {
  padding: 0;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 50px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  padding: 0 16px;
}

.back-button {
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  flex: 1;
  text-align: center;
}

.placeholder {
  width: 24px;
}

.content-container {
  padding-top: 60px;
  padding-bottom: 24px;
}

.detail-section {
  margin-bottom: 16px;
  background-color: #fff;
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin: 0;
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  background-color: #fafafa;
}

.summary-grid,
.receiver-grid {
  padding: 16px;
}

.info-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
}

.info-row:last-child {
  margin-bottom: 0;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  align-items: center;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item.full-width {
  flex-direction: row;
}

.info-item.status-item {
  align-items: center;
}

.label {
  color: #606266;
  font-size: 14px;
  width: 120px;
  flex-shrink: 0;
  text-align: right;
  margin-right: 5px;
}

.info-item.full-width .label {
  margin-bottom: 8px;
}

.value {
  flex: 1;
  color: #303133;
  font-size: 14px;
}

.text-left {
  text-align: left;
}

.price-value {
  color: #f56c6c;
}

.status-tag {
  padding: 0 8px;
  height: 24px;
  line-height: 22px;
}

.table-wrapper {
  padding: 16px 16px 0;
  overflow-x: auto;
}

:deep(.el-table) {
  width: 100% !important;
  font-size: 14px;
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
  width: 60px;
  height: 60px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
  background-color: #f5f7fa;
}

.order-total {
  text-align: right;
  padding: 16px;
  font-size: 14px;
  color: #606266;
  border-top: 1px solid #ebeef5;
}

.total-amount {
  color: #f56c6c;
  font-weight: 600;
  font-size: 16px;
  margin-left: 8px;
}

:deep(.image-preview) {
  max-width: 100%;
  max-height: 100%;
  width: auto !important;
}

:deep(.el-image-viewer__wrapper) {
  max-width: 100vw;
  max-height: 100vh;
}

:deep(.el-image-viewer__img) {
  max-width: 90vw;
  max-height: 70vh;
}
</style> 
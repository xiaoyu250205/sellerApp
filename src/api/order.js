import request from '@/utils/request'

// 获取订单列表
export function getOrderList(data) {
  return request({
    url: '/order/getOrderList',
    method: 'post',
    data
  })
}

//获取待采购订单数量
export function getPendingOrderCount(params) {
  return request({
    url: '/order/getPurchaseOrderCount',
    method: 'get',
    params
  })
}

//获取订单详情
export function getOrderDetail(params) {
  return request({
    url: '/order/getOrderDetail',
    method: 'get',
    params
  })
}

// 确认采购
export function confirmPurchase(data) {
  return request({
    url: '/order/purchaseOrder',
    method: 'post',
    data
  })
}

//获取账户余额
export function getAccountBalance(params) {
  return request({
    url: '/order/getAccountBalance',
    method: 'get',
    params
  })
}

// 审批退款
export function approveRefund(data) {
  return request({
    url: '/order/approveRefund',
    method: 'post',
    data
  })
}

// 获取退款列表
export function getRefundList(data) {
  return request({
    url: '/order/getRefundList',
    method: 'post',
    data
  })
}
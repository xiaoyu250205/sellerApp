import request from '@/utils/request'

//获取资金记录
export function getWalletRecord(data) {
  return request({
    url: '/wallet/getWalletRecord',
    method: 'post',
    data
  })
}

//发起提现申请
export function createWithdraw(data) {
  return request({
    url: '/wallet/withdrawal',
    method: 'post',
    data
  })
}

//获取充值或提现记录
export function getRechargeWithdrawRecord(data) {
  return request({
    url: '/wallet/getRechargeWithdrawRecord',
    method: 'post',
    data
  })
}

//获取账户余额  
export function getWalletBalance(data) {
  return request({
    url: '/wallet/getAccountBalance',
    method: 'post',
    data
  })
}

//获取财务报表卡片数据
export function getFinanceReportCards(data) {
  return request({
    url: '/wallet/getFinanceCardData',
    method: 'post',
    data
  })
}

//获取财务报表表格数据
export function getFinanceReportTable(data) {
  return request({
    url: '/wallet/getFinanceTableData',
    method: 'post',
    data
  })
}

//购买店铺套餐
export function buyPromotionPackage(data) {
  return request({
    url: '/wallet/buyPromotionPackage',
    method: 'post',
    data
  })
}

//获取购买历史记录
export function getPurchaseHistory(data) {
  return request({
    url: '/wallet/getPurchaseRecord',
    method: 'post',
    data
  })
}

import request from '@/utils/request'

// 获取优惠券列表
export function getCouponList(params) {
  return request({
    url: '/marketing/coupon/list',
    method: 'get',
    params
  })
}

// 创建优惠券
export function createCoupon(data) {
  return request({
    url: '/marketing/coupon/create',
    method: 'post',
    data
  })
}

// 更新优惠券
export function updateCoupon(data) {
  return request({
    url: '/marketing/coupon/update',
    method: 'put',
    data
  })
}

// 删除优惠券
export function deleteCoupon(id) {
  return request({
    url: `/marketing/coupon/delete/${id}`,
    method: 'delete'
  })
}

// 获取活动列表
export function getPromotionList(params) {
  return request({
    url: '/marketing/promotion/list',
    method: 'get',
    params
  })
}

// 创建活动
export function createPromotion(data) {
  return request({
    url: '/marketing/promotion/create',
    method: 'post',
    data
  })
}

// 更新活动
export function updatePromotion(data) {
  return request({
    url: '/marketing/promotion/update',
    method: 'put',
    data
  })
}

// 删除活动
export function deletePromotion(id) {
  return request({
    url: `/marketing/promotion/delete/${id}`,
    method: 'delete'
  })
}

// 获取营销数据分析
export function getMarketingAnalysis(params) {
  return request({
    url: '/marketing/analysis',
    method: 'get',
    params
  })
} 
import request from '@/utils/request'


// 获取商品分类
export function getProductCategory(params) {
  return request({
    url: '/productsManager/getProductsType',
    method: 'get',
    params
  })
}

// 获取商品库列表
export function getWarehouseList(data) {
  return request({
    url: '/productsManager/getProductsList',
    method: 'post',
    data
  })
}

//保存商品到店铺商品
export function saveProductToStore(data) {
  return request({
    url: '/productsManager/saveProductToStore',
    method: 'post',
    data
  })
}

//批量保存商品到店铺商品
export function saveBatchProductsToStore(data) {
  return request({
    url: '/productsManager/saveBatchProductsToStore',
    method: 'post',
    data
  })
}

//获取店铺商品列表
export function getStoreProductList(data) {
  return request({
    url: '/productsManager/getStoreProductsList',
    method: 'post',
    data
  })
}

//修改店铺商品
export function updateStoreProduct(data) {
  return request({
    url: '/productsManager/updateStoreProduct',
    method: 'post',
    data
  })
}

//批量修改店铺商品
export function updateBatchStoreProduct(data) {
  return request({
    url: '/productsManager/updateBatchStoreProduct',
    method: 'post',
    data
  })
}

//批量上架或下架店铺商品
export function updateBatchStoreProductStatus(data) {
  return request({
    url: '/productsManager/updateBatchStoreProductStatus',
    method: 'post',
    data
  })
} 

//删除店铺商品
export function deleteStoreProduct(params) {
  return request({
    url: '/productsManager/delStoreProductById',
    method: 'get',
    params
  })
}

//批量删除店铺商品
export function deleteBatchStoreProduct(data) {
  return request({
    url: '/productsManager/delBatchStoreProduct',
    method: 'post',
    data
  })
}

// 退款列表
export function getRefundList(data) {
  return request({
    url: '/productsManager/getRefundOrder',
    method: 'post',
    data
  })
}

// 同意退款
export function approveRefund(data) {
  return request({
    url: '/productsManager/agreeRefund',
    method: 'post',
    data
  })
}

// 获取评论列表
export function getReviewsList(data) {
  return request({
    url: '/productsManager/getProductComment',
    method: 'post',
    data
  })
}


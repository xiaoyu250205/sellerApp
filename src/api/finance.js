import request from '@/utils/request'

// 获取财务报表
export function getFinanceReport(params) {
  return request({
    url: '/finance/report',
    method: 'get',
    params
  })
}

// 获取收入明细
export function getIncomeDetails(params) {
  return request({
    url: '/finance/income/details',
    method: 'get',
    params
  })
}

// 获取支出明细
export function getExpenseDetails(params) {
  return request({
    url: '/finance/expense/details',
    method: 'get',
    params
  })
}

// 获取利润分析
export function getProfitAnalysis(params) {
  return request({
    url: '/finance/profit/analysis',
    method: 'get',
    params
  })
}

// 导出财务报表
export function exportFinanceReport(params) {
  return request({
    url: '/finance/report/export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

/**
 * 获取财务数据
 * @param {Object} params - 查询参数
 * @param {string} params.startTime - 开始时间
 * @param {string} params.endTime - 结束时间
 * @param {number} params.pageIndex - 页码
 * @param {number} params.pageSize - 每页条数
 * @returns {Promise} 返回财务数据
 */
export function getFinanceData(params) {
  return request({
    url: '/finance/data',
    method: 'get',
    params
  })
} 
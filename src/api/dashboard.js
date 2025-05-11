import request from '@/utils/request'

// 获取首页数据
export function getDashboardData(params) {
    return request({
        url: '/dashboard/getDashboardData',
        method: 'get',
        params
    })
}

// 获取图表数据
export function getDashboardChartData(params) {
    return request({
        url: '/dashboard/getDashboardChartData',
        method: 'get',
        params
    })
}

// 获取热销商品
export function getHotSalesProducts(params) {
    return request({
        url: '/dashboard/getHotProducts',
        method: 'get',
        params
    })
}

// 获取浏览量TOP10
export function getTopViewedProducts(params) {
    return request({
        url: '/dashboard/getHotViews',
        method: 'get',
        params
    })
}

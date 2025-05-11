import request from '@/utils/request'

// 获取店铺设置
export function getSettings(data) {
    return request({
        url: '/systemSettings/getUserSettings',
        method: 'post',
        data
    })
}

// 更新店铺设置
export function updateSettings(data) {
    return request({
        url: '/systemSettings/updateUserSettings',
        method: 'post',
        data
    })
}

// 上传图片
export function uploadImage(data) {
    return request({
        url: '/systemSettings/uploadImage',
        method: 'post',
        data,
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}

// 删除图片
export function deleteImage(params) {
    return request({
        url: '/systemSettings/delImg',
        method: 'get',
        params
    })
}
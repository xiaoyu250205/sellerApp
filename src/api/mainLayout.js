import request from '@/utils/request'


//更新消息状态为已读
export function updateMessageStatus(data) {
    return request({
        url: '/sse/updateMsg',
        method: 'post',
        data
    })
}

//修改密码
export function updatePassword(data) {
    return request({
        url: '/sellAuth/updatePassword',
        method: 'post',
        data
    })
}
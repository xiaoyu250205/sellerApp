import axios from 'axios'
import { ElMessage } from 'element-plus'
import i18n from '@/i18n'

const { t } = i18n.global

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 从 sessionStorage 获取 token
    const token = sessionStorage.getItem('token')
    
    // 如果 token 存在，添加到请求头
    if (token) {
      config.headers['authToken'] = token
    }
    
    return config
  },
  error => {
    ElMessage.error(t('common.network.requestFailed'))
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    // 如果响应类型是 arraybuffer 或 blob，直接返回 response.data
    if (response.config.responseType === 'arraybuffer' || response.config.responseType === 'blob') {
      return response.data
    }

    const res = response.data

    // 处理 token 过期
    if (res.code === 401) {
      ElMessage.error(t('common.auth.unauthorized'))
      sessionStorage.clear()
      window.location.href = '/login'
      return Promise.reject(new Error(res.message))
    }else{
      return res
    }
  },
  error => {
    if (error.response) {
      switch (error.response.status) {
        case 401:
          sessionStorage.removeItem('token')
          ElMessage.error(t('common.auth.unauthorized'))
          window.location.href = '/login'
          break
        case 403:
          ElMessage.error(t('common.auth.forbidden'))
          break
        default:
          ElMessage.error(error.response.data.message || t('common.network.requestFailed'))
      }
    } else {
      ElMessage.error(t('common.network.networkError'))
    }
    return Promise.reject(error)
  }
)

export default request 
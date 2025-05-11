import { defineStore } from 'pinia'

// 用户 store
export const useUserStore = defineStore('user', {
  state: () => ({
    token: sessionStorage.getItem('token') || '',
    userId: sessionStorage.getItem('userId') || '',
    shopId: sessionStorage.getItem('shopId') || '',
    shopName: sessionStorage.getItem('shopName') || ''
  }),
  
  actions: {
    setUserInfo(data) {
      this.token = data.token
      this.userId = data.userId
      this.shopId = data.shopId
      this.shopName = data.shopName
      
      // 保存到 sessionStorage
      sessionStorage.setItem('token', data.token)
      sessionStorage.setItem('userId', data.userId)
      sessionStorage.setItem('shopId', data.shopId)
      sessionStorage.setItem('shopName', data.shopName)
    },
    
    clearUserInfo() {
      this.token = ''
      this.userId = ''
      this.shopId = ''
      this.shopName = ''
      
      // 清除 sessionStorage
      sessionStorage.clear()
    }
  }
}) 
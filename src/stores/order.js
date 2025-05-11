import { defineStore } from 'pinia'
import { getPendingOrderCount } from '@/api/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    pendingOrderCount: 0
  }),
  
  actions: {
    async updatePendingOrderCount() {
      const params = {
        shopId: sessionStorage.getItem('shopId')
      }
      const res = await getPendingOrderCount(params)
      this.pendingOrderCount = res.data
    }
  }
}) 
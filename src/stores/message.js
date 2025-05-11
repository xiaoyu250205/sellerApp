import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useMessageStore = defineStore('message', () => {
  // 消息列表
  const messages = ref([])
  
  // 未读消息数量
  const unreadCount = computed(() => {
    return messages.value.filter(msg => msg.unread).length
  })

  // 添加新消息
  const addMessage = (message) => {
    messages.value.unshift({
      id: message.id,
      title: message.title ,
      content: message.content,
      time: message.time,
    })
  }


  //移除消息
  const removeMessage = (id) => {
    messages.value = messages.value.filter(msg => msg.id !== id)
  }

  // 标记消息为已读
  const markAsRead = (id) => {
    const message = messages.value.find(msg => msg.id === id)
    if (message && message.unread) {
      message.unread = false
    }
  }

  // 清空所有消息
  const clearMessages = () => {
    messages.value = []
  }

  return {
    messages,
    unreadCount,
    addMessage,
    removeMessage,
    markAsRead,
    clearMessages
  }
}) 
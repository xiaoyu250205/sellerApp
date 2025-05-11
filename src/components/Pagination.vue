<template>
  <div class="pagination-container">
    <div class="pagination-info">{{ t('common.pagination.total', { total: total }) }}</div>
    <el-pagination
      v-model:current-page="currentPage"
      v-model:page-size="pageSize"
      :disabled="disabled"
      :total="total"
      layout="prev, pager, next"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = defineProps({
  total: {
    type: Number,
    required: true
  },
  pageIndex: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:pageIndex', 'update:pageSize', 'current-change'])

const currentPage = ref(props.pageIndex)
const pageSize = ref(props.pageSize)

watch(() => props.pageIndex, (newVal) => {
  currentPage.value = newVal
})

watch(() => props.pageSize, (newVal) => {
  pageSize.value = newVal
})

watch(currentPage, (newVal) => {
  emit('update:pageIndex', newVal)
})

watch(pageSize, (newVal) => {
  emit('update:pageSize', newVal)
})

const handleCurrentChange = (val) => {
  emit('current-change', val)
}
</script>

<style scoped>
.pagination-container {
  margin-top: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.pagination-info {
  margin-right: 0;
  color: #606266;
  line-height: 32px;
}

:deep(.el-pagination) {
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 32px;
}

:deep(.el-pagination .el-pagination__total) {
  margin-right: 15px;
}

:deep(.el-pagination .el-pagination__sizes) {
  margin-right: 15px;
}

:deep(.el-pagination .el-pagination__jump) {
  margin-left: 15px;
}

:deep(.el-pagination button) {
  line-height: 32px;
  height: 32px;
}

:deep(.el-pagination .el-pager li) {
  line-height: 32px;
  height: 32px;
}
</style> 
<template>
  <div class="reviews-container">
    <el-card>
      <div class="content">
        <!-- 查询表单 -->
        <div class="query-container">
          <el-form :model="queryForm" label-width="100px" :inline="true" class="query-form">
            <el-form-item :label="t('products.name')">
              <el-input v-model="queryForm.productName" :placeholder="t('products.pleaseInputProductName')" clearable />
            </el-form-item>
            <el-form-item :label="t('products.rating')">
              <el-select v-model="queryForm.rating" :placeholder="t('products.pleaseSelectRating')" clearable>
                <el-option :label="t('products.oneStar')" :value="1" />
                <el-option :label="t('products.twoStars')" :value="2" />
                <el-option :label="t('products.threeStars')" :value="3" />
                <el-option :label="t('products.fourStars')" :value="4" />
                <el-option :label="t('products.fiveStars')" :value="5" />
              </el-select>
            </el-form-item>
            <el-form-item class="query-buttons">
              <el-button type="primary" @click="handleQuery">{{ t('common.query') }}</el-button>
              <el-button @click="resetQuery">{{ t('common.reset') }}</el-button>
            </el-form-item>
          </el-form>
        </div>

        <!-- 评论表格 -->
        <el-table :data="reviews" style="width: 100%">
          <el-table-column prop="orderNo" :label="t('orders.orderId')" width="180" align="center"/>
          <el-table-column prop="productName" :label="t('products.name')" min-width="180" show-overflow-tooltip />
          <el-table-column prop="userName" :label="t('products.userNickname')" width="200" align="center"/>
          <el-table-column prop="rating" :label="t('products.rating')" width="200" align="center">
            <template #default="{ row }">
              <el-rate v-model="row.rating" disabled show-score text-color="#ff9900" />
            </template>
          </el-table-column>
          <el-table-column prop="comment" :label="t('products.reviewContent')" min-width="200" show-overflow-tooltip />
          <el-table-column prop="createdAt" :label="t('products.reviewTime')" width="180" align="center"/>
        </el-table>

        <!-- 分页组件 -->
        <div class="pagination-container">
          <div class="pagination-info">{{ t('common.pagination.total', { total: total }) }}</div>
          <el-pagination
            v-model:current-page="pageIndex"
            v-model:page-size="pageSize"
            :total="total"
            layout="prev, pager, next"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { getReviewsList } from '@/api/product'
const { t } = useI18n()

// 查询表单
const queryForm = ref({
  productName: '',
  rating: ''
})

// 分页相关
const pageIndex = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 评论列表数据
const reviews = ref([])

// 获取评论列表
const getReviews = () => {
  
  const data = {
    shopId: sessionStorage.getItem('shopId'),
    pageIndex: pageIndex.value,
    pageSize: pageSize.value,
    name: queryForm.value.productName,
    rating: queryForm.value.rating
  }
  getReviewsList(data).then(res => {
    if(res.code === 0) {
      reviews.value = res.data.records
      total.value = res.data.total
    }
  }).catch(err => {
    console.log(err)
  })
}

// 查询方法
const handleQuery = () => {
  pageIndex.value = 1
  getReviews()
}

// 重置查询
const resetQuery = () => {
  queryForm.value = {
    productName: '',
    rating: ''
  }
  handleQuery()
}

// 分页
const handleCurrentChange = (page) => {
  pageIndex.value = page
  getReviews()
}

onMounted(() => {
  getReviews()
})
</script>

<style scoped>
.reviews-container {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.content {
  min-height: 300px;
}

.query-container {
  margin-bottom: 20px;
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.query-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

:deep(.el-form--inline .el-form-item) {
  margin-right: 0;
  margin-bottom: 0;
}

:deep(.el-input),
:deep(.el-select) {
  width: 220px;
}

.query-buttons {
  margin-left: auto;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-button) {
  padding: 8px 20px;
}

:deep(.el-button--primary) {
  background-color: #409EFF;
  border-color: #409EFF;
}

:deep(.el-button--primary:hover) {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  padding: 12px 0;
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 20px;
}

.image-placeholder {
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  border-radius: 4px;
}
</style> 
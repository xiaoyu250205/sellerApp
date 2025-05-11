<template>
  <div class="warehouse-container">
    
    <!-- 查询条件区域 -->
    <div class="search-container">
      <el-form :model="searchForm" ref="searchFormRef" :inline="true" class="search-form">
        <el-form-item :label="t('products.name')" prop="name">
          <el-input
            v-model="searchForm.name"
            :placeholder="t('products.searchNamePlaceholder')"
            clearable
            class="search-input"
          />
        </el-form-item>
        <el-form-item :label="t('products.category')" prop="category">
          <el-cascader
            v-model="searchForm.category"
            :options="formatCategoryOptions()"
            :props="{
              emitPath:false,
              checkStrictly: false,
              value: 'id',
              label: 'name',
              children: 'children',
              leaf: 'isLeaf'
            }"
            :placeholder="t('products.selectCategoryPlaceholder')"
            clearable
            class="search-select"
            :show-all-levels="false"
          />
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleSearch">
            {{ t('common.query') }}
          </el-button>
          <el-button  @click="handleReset">
            {{ t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <!-- <span class="card-title">{{ t('menu.productWarehouse') }}</span> -->
          <el-button type="primary" @click="handleBatchAdd">
            {{ t('common.batchAdd') }}
          </el-button>
        </div>
      </template>
      
      <div class="table-container">
        <el-table
          ref="tableRef"
          v-loading="loading"
          :data="tableData"
          :height="'100%'"
          :border="false"
          stripe
          highlight-current-row
          @selection-change="handleSelectionChange"
          row-key="productId"
        >
          <!-- 选择列 -->
          <el-table-column 
            type="selection" 
            width="40" 
            fixed="left" 
            align="center"
            :selectable="row => true"
            :reserve-selection="true"
          />
          
          <!-- ID列 -->
          <!-- <el-table-column 
            prop="id" 
            label="ID" 
            width="160" 
            align="center" 
            fixed="left"
          >
            <template #default="{ row }">
              <span class="id-column">{{ row.productId }}</span>
            </template>
          </el-table-column> -->
          
          <!-- 商品封面列 -->
           
          <el-table-column 
            :label="t('products.cover')" 
            width="200" 
            align="center"
            fixed="left"
          >
            <template #default="{ row }">
              <el-tooltip
                :content="t('products.clickToViewImage')"
                placement="top"
                effect="light"
              >
              <el-image
                :src="getImageUrl(row.urlList)"
                :preview-src-list="getImageUrlList(row.urlList)"
                :initial-index="0"
                preview-teleported
                fit="cover"
                class="product-image"
                loading="lazy"
                @click="handleImageClick"
              >
                <template #error>
                  <div class="image-error">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </el-tooltip>
            </template>
          </el-table-column>
          
          <!-- 商品名称列 -->
          <el-table-column 
            prop="name" 
            :label="t('products.name')" 
            min-width="200"
            show-overflow-tooltip
            tooltip-effect="dark"
          >
            <template #default="{ row }">
              <span class="product-name">{{ row.productName }}</span>
            </template>
          </el-table-column>

          <!-- 商品描述列 -->
          <el-table-column 
            prop="description" 
            :label="t('products.description')" 
            min-width="200"
            show-overflow-tooltip
            tooltip-effect="dark"
          >
            <template #default="{ row }">
              <span class="product-name">{{ row.description }}</span>
            </template>
          </el-table-column>
          
          <!-- 商品分类列 -->
          <el-table-column 
            prop="categoryId" 
            :label="t('products.category')" 
            width="160" 
            show-overflow-tooltip
            tooltip-effect="dark"
            align="center"
          >
            <template #default="{ row }">
                {{ row.categoryIdStr }}
            </template>
          </el-table-column>
          
          <!-- 采购价格列 -->
          <el-table-column 
            prop="purchasePrice" 
            :label="t('products.purchasePrice')" 
            width="140" 
            align="right"
          >
            <template #default="{ row }">
              <span class="price">{{ formatMoney(row.price) }}</span>
            </template>
          </el-table-column>
          
          <!-- 操作列 -->
          <el-table-column 
            :label="t('common.actions')" 
            width="180" 
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button type="primary" link style="font-size: 16px;" @click="handleAdd(row)">
                {{ t('common.add') }}
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <Pagination
          v-model:page-index="currentPage"
          v-model:page-size="pageSize"
          :total="total"
          :disabled="loading"
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 添加对话框组件 -->
    <el-dialog
      v-model="dialogVisible"
      :title="currentRow.isBatch ? t('products.batchAddProducts') : t('products.addProduct')"
      width="550px"
      destroy-on-close
    >
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="left"
        label-width="120px"
      >
        <div class="selected-product" v-if="currentRow.productName">
          <div class="product-info">
            <span class="label">{{ t('products.selectedProduct') }}:</span>
            <span class="value">{{ currentRow.productName }}</span>
          </div>
        </div>
        
        <div class="selected-product" v-if="currentRow.isBatch">
          <div class="product-info">
            <span class="label">{{ t('products.selectedProducts') }}:</span>
            <span class="value">{{ currentRow.count }} {{ t('products.items') }}</span>
          </div>
        </div>
        
        <el-form-item :label="t('products.profitRatio')" prop="profitRatio" class="form-item">
          <el-input 
            v-model="formData.profitRatio" 
            :placeholder="t('products.enterProfitRatio')"
            style="width: 300px;"
          >
            <template #append>%</template>
          </el-input>
          <div class="form-tip">{{ t('products.profitRatioDesc') }}</div>
          <div class="form-tip highlight">{{ t('products.suggestedProfitRatio') }}</div>
        </el-form-item>
        
        <el-form-item :label="t('products.discountDate')" class="form-item">
          <el-date-picker
            v-model="formData.discountDate"
            type="daterange"
            :range-separator="t('common.to')"
            :start-placeholder="t('common.startDate')"
            :end-placeholder="t('common.endDate')"
            style="width: 300px;"
          />
        </el-form-item>
        
        <el-form-item 
          :label="t('products.discountRatio')" 
          class="form-item"
          :class="{ 'disabled-form-item': !formData.discountDate || formData.discountDate.length !== 2 }"
        >
          <el-input 
            v-model="formData.discountRatio" 
            :placeholder="t('products.enterDiscountRatio')"
            :disabled="!formData.discountDate || formData.discountDate.length !== 2"
            style="width: 300px;"
          >
            <template #append>%</template>
          </el-input>
          <div class="form-tip" v-if="formData.discountDate && formData.discountDate.length === 2">
            {{ t('products.discountRatioDesc') }}
          </div>
          <div class="form-tip" v-else>
            {{ t('products.selectDateFirst') }}
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitForm">{{ t('common.confirm') }}</el-button>
          <el-button @click="dialogVisible = false">{{ t('common.cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getProductCategory, getWarehouseList, saveProductToStore, saveBatchProductsToStore } from '@/api/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatMoney } from '@/utils/format'
import Pagination from '@/components/Pagination.vue'

const { t } = useI18n()

// 分页文本
const paginationTotal = computed(() => {
  return t('common.pagination.total', { total: total.value })
})

// 查询表单
const searchForm = ref({
  name: '',
  category: ''
})
const searchFormRef = ref(null)

// 分类选项
const categoryOptions = ref([])

// 表格数据
const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const total = ref()
const pageSize = ref(10)
const selectedRows = ref([])
const tableRef = ref(null)

// 添加以下状态变量
const dialogVisible = ref(false)
const currentRow = ref({})
const formData = ref({
  profitRatio: '',
  discountDate: null,
  discountRatio: ''
})
const formRules = {
  profitRatio: [
    { required: true, message: t('products.profitRatioRequired'), trigger: 'blur' },
    { pattern: /^(0|[1-9][0-9]?)(\.\d{1,2})?$/, message: t('products.validRatioFormat'), trigger: 'blur' }
  ]
}
const formRef = ref(null)

// 获取分类选项
const getCategoryOptions = async () => {
  const { data } = await getProductCategory()
  categoryOptions.value = data
}

// 获取商品数据
const fetchData = async () => {
  loading.value = true
  const params = {
    pageIndex: currentPage.value,
    pageSize: pageSize.value,
    name: searchForm.value.name,
    category: searchForm.value.category
  }
  const data = await getWarehouseList(params)
  tableData.value = data.data.records
  total.value = data.data.total
  loading.value = false
  
  // 清空选中状态
  if (tableRef.value) {
    tableRef.value.clearSelection()
  }
  selectedRows.value = []
}

// 查询
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields()
  currentPage.value = 1
  fetchData()
}

// 分页处理
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 多选处理
const handleSelectionChange = (rows) => {
  console.log('选中的行数:', rows.length)
  selectedRows.value = rows
}

// 添加处理添加按钮点击的方法
const handleAdd = (row) => {
  currentRow.value = row
  formData.value = {
    profitRatio: '',
    discountDate: null,
    discountRatio: ''
  }
  dialogVisible.value = true
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      if (currentRow.value.isBatch) {
        // 批量添加处理 - 一次性传递所有数据给后端
        const batchData = selectedRows.value.map(row => {
          return {
            productId: row.productId,
            productName: row.productName,
            purchasePrice: row.price,
            productDescription: row.description,
            productCategory: row.categoryId,
            productImageUrl: row.imageUrls,
            stockQuantity: row.stockQuantity,
            salePrice: row.price*(1+formData.value.profitRatio/100),
            merchantId: sessionStorage.getItem('userId'),
            shopName: sessionStorage.getItem('shopName'),
            shopId: sessionStorage.getItem('shopId'),
            isDiscount: formData.value.discountRatio && formData.value.discountRatio !== '' ? 1 : 0,
            discountRate: formData.value.discountRatio || null,
            profitRatio: formData.value.profitRatio,
            discountStartDate: formData.value.discountDate ? formData.value.discountDate[0] : null,
            discountEndDate: formData.value.discountDate ? formData.value.discountDate[1] : null,
          }
        })
        
        // 调用批量保存API
        saveBatchProductsToStore(batchData).then(res => {
          if (res.code === 0) {
            ElMessage.success(t('products.batchAddSuccess', { count: batchData.length }))
            dialogVisible.value = false
            fetchData()
          } else {
            ElMessage.error(res.message || t('products.batchAddFailed'))
          }
        }).catch(error => {
          console.error('批量保存失败:', error)
          ElMessage.error(t('products.batchAddFailed'))
        }).finally(() => {
          loading.value = false
        })
      } else {
        // 单个添加处理
        const submitData = {
          productId: currentRow.value.productId,
          productName: currentRow.value.productName,
          purchasePrice: currentRow.value.price,
          productDescription: currentRow.value.description,
          productCategory: currentRow.value.categoryId,
          productImageUrl: currentRow.value.imageUrls,
          stockQuantity: currentRow.value.stockQuantity,
          salePrice: currentRow.value.price*(1+formData.value.profitRatio/100),
          merchantId: sessionStorage.getItem('userId'),
          shopName: sessionStorage.getItem('shopName'),
          shopId: sessionStorage.getItem('shopId'),
          isDiscount: formData.value.discountRatio && formData.value.discountRatio !== '' ? 1 : 0,
          discountRate: formData.value.discountRatio || null,
          profitRatio: formData.value.profitRatio,
          discountStartDate: formData.value.discountDate ? formData.value.discountDate[0] : null,
          discountEndDate: formData.value.discountDate ? formData.value.discountDate[1] : null,
        }
        
        saveProductToStore(submitData).then(res => {
          if (res.code === 0) {
            ElMessage.success(t('common.addSuccess'))
            dialogVisible.value = false
            fetchData()
          } else {
            ElMessage.error(res.message || t('common.addFailed'))
          }
        }).catch(error => {
          console.error('保存失败:', error)
          ElMessage.error(t('common.addFailed'))
        }).finally(() => {
          loading.value = false
        })
      }
    }
  })
}

// 监听折扣日期变化，清空折扣比例
watch(() => formData.value.discountDate, (newVal) => {
  if (!newVal || newVal.length !== 2) {
    formData.value.discountRatio = ''
  }
})

// 获取图片URL
const getImageUrl = (urlList) => {
  if (!urlList || urlList.length === 0) return '';
  return Array.isArray(urlList) ? urlList[0] : urlList;
}

// 获取图片URL列表
const getImageUrlList = (urlList) => {
  if (!urlList) return [];
  if (Array.isArray(urlList) && urlList.length > 0) {
    return urlList;
  }
  return [urlList].filter(Boolean);
}

// 处理图片点击事件
const handleImageClick = (e) => {
  // 阻止事件冒泡，确保点击图片时不会触发行选中
  e.stopPropagation();
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  if (!categoryId) return '';
  
  // 检查是否为父类
  for (const group of categoryOptions.value) {
    if (group.id === categoryId) {
      return group.name;
    }
    
    // 检查子类
    for (const item of group.children) {
      if (item.id === categoryId) {
        return item.name;
      }
    }
  }
  return '';
}

// 获取所有子分类
const getAllChildCategories = () => {
  const result = [];
  for (const group of categoryOptions.value) {
    for (const item of group.children) {
      result.push(item);
    }
  }
  return result;
}

// 格式化分类选项为级联选择器需要的格式
const formatCategoryOptions = () => {
  return categoryOptions.value.map(group => ({
    id: group.id,
    name: group.name,
    isLeaf: false,
    children: group.children.map(child => ({
      ...child,
      isLeaf: true
    }))
  }));
}

// 批量添加商品
const handleBatchAdd = () => {
  // 检查是否有选中的行
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage({
      message: t('products.selectProductsFirst'),
      type: 'warning'
    })
    return
  }
  
  // 用户确认后，显示批量添加表单
  currentRow.value = { isBatch: true, count: selectedRows.value.length }
  formData.value = {
    profitRatio: '',
    discountDate: null,
    discountRatio: ''
  }
  dialogVisible.value = true
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchData()
}

// 在组件挂载时添加日志，帮助调试
onMounted(() => {
  fetchData()
  getCategoryOptions()
})

</script>

<style scoped>
.warehouse-container {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100vh - 140px);
}

.search-container {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.search-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 0;
}

.search-form :deep(.el-form-item__label) {
  font-weight: 500;
}

.search-input {
  width: 240px;
}

.search-select {
  width: 200px;
}

.search-buttons {
  margin-left: auto;
}

.search-buttons :deep(.el-form-item__content) {
  margin-left: 0 !important;
  gap: 12px;
}

.search-buttons :deep(.el-button) {
  min-width: 100px;
  padding: 12px 25px;
  font-size: 16px;
}

.table-card {
  margin-bottom: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.table-card :deep(.el-card__header) {
  padding: 0;
  border-bottom: 1px solid var(--el-border-color-light);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 56px;
  padding: 0 20px;
}

.card-header :deep(.el-button) {
  min-width: 100px;
  padding: 0 25px;
  font-size: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.table-card :deep(.el-table) {
  --el-table-header-bg-color: var(--el-fill-color-light);
  --el-table-border-color: var(--el-border-color-lighter);
  --el-table-header-text-color: var(--el-text-color-regular);
  --el-table-row-hover-bg-color: var(--el-fill-color-light);
  height: calc(100% - 52px);
}

.table-card :deep(.el-table__inner-wrapper) {
  height: 100%;
}

.table-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pagination-container {
  height: 52px;
  padding: 0 20px;
  background-color: #fff;
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0px;
}

.pagination-container :deep(.el-pagination) {
  margin: 0;
  padding: 0;
  height: auto;
  line-height: normal;
}

.total-text {
  color: var(--el-text-color-regular);
  font-size: 13px;
}

.product-image {
  width: 60px;
  height: 60px;
  border-radius: 4px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
  border: 1px solid var(--el-border-color-lighter);
  transition: transform 0.3s ease;
  background-color: #fff;
}

.product-image:hover {
  transform: scale(1.05);
}

.table-card :deep(.el-button--link) {
  height: 36px;
  padding: 0 16px;
  font-size: 20px;
  font-weight: 500;
}

.table-card :deep(.el-button--link.action-button) {
  font-size: 20px;
}

.table-card :deep(.el-table__cell) {
  padding: 8px 0;
  border-right: none !important;
}

.table-card :deep(.el-table__cell:last-child) {
  border-right: none !important;
}

.table-card :deep(.el-table .cell) {
  padding: 0 20px;
  white-space: nowrap;
}

.table-card :deep(.el-table__header th.el-table__cell) {
  background-color: var(--el-fill-color-light);
  font-weight: 500;
  height: 48px;
  border-bottom: 1px solid var(--el-border-color-lighter) !important;
  color: var(--el-text-color-regular);
}

.table-card :deep(.el-table__header .cell) {
  padding: 8px 20px;
  font-size: 13px;
}

.table-card :deep(.el-table__cell.is-center .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
}

.table-card :deep(.el-table__cell.el-table__cell--selection .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.table-card :deep(.el-table__header th.el-table__cell.el-table__cell--selection .cell) {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.table-card :deep(.el-checkbox) {
  margin: 0;
}

.table-card :deep(.el-table__row) {
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.price {
  font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  color: var(--el-color-danger);
}

.table-card :deep(.el-button-group) {
  display: inline-flex;
  gap: 8px;
}

.id-column {
  font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  color: var(--el-text-color-secondary);
}

.product-name {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 20px;
  background-color: var(--el-fill-color-lighter);
}

.table-card :deep(.el-tag--small) {
  height: 24px;
  padding: 0 8px;
  font-size: 12px;
}

.action-button {
  font-size: 18px !important;
}

.form-tip {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.form-tip.highlight {
  color: #409EFF;
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.form-item {
  margin-bottom: 20px;
}

.selected-product {
  background-color: #f5f7fa;
  padding: 12px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
}

.product-info {
  display: flex;
  align-items: center;
}

.product-info .label {
  font-weight: bold;
  margin-right: 10px;
}

.product-info .value {
  color: #409EFF;
}

.disabled-form-item .el-form-item__label {
  color: #C0C4CC;
}

/* 添加页面标识样式 */
.page-identifier {
  background-color: #ecf5ff;
  color: #409EFF;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  text-align: center;
}
button:focus {
          outline: none;
      }
</style> 
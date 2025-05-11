<template>
  <div class="product-list-container">
  
    
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
              checkStrictly: true,
              value: 'id',
              label: 'name',
              children: 'children',
            }"
            :placeholder="t('products.selectCategoryPlaceholder')"
            clearable
            class="search-select"
            :show-all-levels="false"
          />
        </el-form-item>
        <el-form-item :label="t('products.status')" prop="status">
          <el-select
            v-model="searchForm.status"
            :placeholder="t('products.selectStatusPlaceholder')"
            clearable
            class="search-select"
          >
            <el-option :label="t('products.isPublished')" :value="1" />
            <el-option :label="t('products.isNotPublished')" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item class="search-buttons">
          <el-button type="primary" @click="handleSearch">
            {{ t('common.query') }}
          </el-button>
          <el-button @click="handleReset">
            {{ t('common.reset') }}
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <template #header>
        <div class="card-header">
          <!-- <span class="card-title">{{ t('menu.shopProducts') }}</span> -->
          <el-button type="primary" @click="handleBatchOnSale">
            {{ t('products.batchOnSale') }}
          </el-button>
          <el-button type="primary" @click="handleBatchOffSale">
            {{ t('products.batchOffSale') }}
          </el-button>
          <el-button type="primary" @click="handleBatchEdit">
            {{ t('products.batchEdit') }}
          </el-button>
          <!-- <el-button type="danger" @click="handleBatchDelete">
            {{ t('products.batchDelete') }}
          </el-button>   -->
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
          row-key="id"
          @selection-change="handleSelectionChange"
          fit
        >

        <!-- 选择列 -->
          <el-table-column 
            type="selection" 
            width="50"
            align="center"
            :reserve-selection="true"
          />
          <!-- ID列 -->
          <!-- <el-table-column 
            prop="id" 
            label="ID" 
            width="140"
            align="center" 
          >
            <template #default="{ row }">
              <span class="id-column">{{ row.productId }}</span>
            </template>
          </el-table-column> -->
          
          <!-- 商品封面列 -->
          <el-table-column 
            :label="t('products.cover')" 
            width="140"
            align="center"
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
            prop="productName" 
            :label="t('products.name')" 
            min-width="160"
            show-overflow-tooltip
            tooltip-effect="dark"
          >
            <template #default="{ row }">
              <span class="product-name">{{ row.productName }}</span>
            </template>
          </el-table-column>

          <!-- 商品描述列 -->
          <!-- <el-table-column 
            prop="productDescription" 
            :label="t('products.description')" 
            min-width="180"
            show-overflow-tooltip
            tooltip-effect="dark"
          >
            <template #default="{ row }">
              <span class="product-description">{{ row.productDescription }}</span>
            </template>
          </el-table-column> -->
          
          <!-- 商品分类列 -->
          <el-table-column 
            prop="productCategory" 
            :label="t('products.category')" 
            width="160"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
                {{ row.productCategoryStr }}
            </template>
          </el-table-column>
          
          <!-- 采购价格列 -->
          <el-table-column 
            prop="purchasePrice" 
            :label="t('products.purchasePrice')" 
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span class="price">{{ formatMoney(row.purchasePrice) }}</span>
            </template>
          </el-table-column>
          
          <!-- 销售价格列 -->
          <el-table-column 
            prop="salePrice" 
            :label="t('products.salePrice')" 
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span class="price">{{ formatMoney(row.salePrice) }}</span>
            </template>
          </el-table-column>
          
          <!-- 折扣价列 -->
          <el-table-column 
            prop="discountPrice" 
            :label="t('products.discountPrice')" 
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span class="price" v-if="row.isDiscount == 1">{{ formatMoney(calculateDiscountPrice(row)) }}</span>
              <span class="price-na" v-else>-</span>
            </template>
          </el-table-column>
          
          <!-- 利润列 -->
          <el-table-column 
            prop="profit" 
            :label="t('products.profit')" 
            width="110"
            align="center"
          >
            <template #default="{ row }">
              <span class="price">${{ calculateProfit(row) }}</span>
            </template>
          </el-table-column>
          
          <!-- 累计销量列 -->
          <el-table-column 
            prop="totalSales" 
            :label="t('products.totalSales')" 
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span class="sales">{{ row.totalSales || 0 }}</span>
            </template>
          </el-table-column>
          
          <!-- 商品状态列 -->
          <el-table-column 
            :label="t('products.status')" 
            width="180"
            align="center"
          >
            <template #default="{ row }">
              <div class="status-switches">
                <div class="switch-item">
                  <span class="switch-label">{{ t('products.onSale') }}</span>
                  <el-switch
                    v-model="row.isPublished"
                    @change="(val) => handleStatusChange(row, 'isPublished', val)"
                    size="small"
                    inline-prompt
                    :active-text="t('common.yes')"
                    :inactive-text="t('common.no')"
                  />
                </div>
                <div class="switch-item">
                  <span class="switch-label">{{ t('products.isRecommended') }}</span>
                  <el-switch
                    v-model="row.isRecommended"
                    @change="(val) => handleStatusChange(row, 'isRecommended', val)"
                    size="small"
                    inline-prompt
                    :active-text="t('common.yes')"
                    :inactive-text="t('common.no')"
                  />
                </div>
                <div class="switch-item">
                  <span class="switch-label">{{ t('products.isNew') }}</span>
                  <el-switch
                    v-model="row.isNew"
                    @change="(val) => handleStatusChange(row, 'isNew', val)"
                    size="small"
                    inline-prompt
                    :active-text="t('common.yes')"
                    :inactive-text="t('common.no')"
                  />
                </div>
              </div>
            </template>
          </el-table-column>
          
          <!-- 操作列 -->
          <el-table-column 
            :label="t('common.actions')"   
            width="160"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button type="primary" link @click="handleEdit(row)">
                {{ t('common.edit') }}
              </el-button>
              <!-- <el-button type="danger" link @click="handleDelete(row)">
                {{ t('common.delete') }}
              </el-button> -->
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
      :title="currentRow.isBatch ? t('products.batchEditProducts') : t('products.editProduct')"
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
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Picture } from '@element-plus/icons-vue'
import { getProductCategory,getStoreProductList,updateStoreProduct,updateBatchStoreProduct,updateBatchStoreProductStatus,deleteStoreProduct,deleteBatchStoreProduct } from '@/api/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatMoney } from '@/utils/format'
import Pagination from '@/components/Pagination.vue'
import { el } from 'element-plus/es/locales.mjs'

const { t } = useI18n()

// 分页文本
const paginationTotal = computed(() => {
  return t('common.pagination.total', { total: total.value })
})

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

// 查询表单
const searchForm = ref({
  name: '',
  category: '',
  status: ''
})
const searchFormRef = ref(null)

// 分类选项
const categoryOptions = ref([])

// 表格数据
const loading = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const total = ref(0)
const pageSize = ref(10)
const tableRef = ref(null)
const selectedRows = ref([])

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
    category: searchForm.value.category,
    isPublished: searchForm.value.status,
    shopId: sessionStorage.getItem('shopId')
  }
  try {
    const { code, data } = await getStoreProductList(params)
    if(code === 1){
      ElMessage.error(t('common.network.requestFailed'))
      tableData.value = []
      total.value = 0
    } else {
      // 确保每个数据项都有必要的属性
      tableData.value = (data.records || []).map(item => ({
        ...item,
        productId: item.productId || item.id || `temp-${Date.now()}-${Math.random()}`,
        isPublished: item.isPublished === 1,
        isRecommended: item.isRecommended === 1,
        isNew: item.isNew === 1,
        isDiscount: item.isDiscount === 1,
        discountRate: item.discountRate || 0,
        purchasePrice: item.purchasePrice || 0,
        salePrice: item.salePrice || 0,
        totalSales: item.totalSales || 0
      }))
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error(t('common.network.requestFailed'))
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
  
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

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1
  fetchData()
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
            id: row.id,
            salePrice: row.purchasePrice*(1+formData.value.profitRatio/100).toFixed(2),
            isDiscount: formData.value.discountRatio && formData.value.discountRatio !== '' ? 1 : 0,
            discountRate: formData.value.discountRatio || null,
            profitRatio: formData.value.profitRatio,
            discountStartDate: formData.value.discountDate ? formData.value.discountDate[0] : null,
            discountEndDate: formData.value.discountDate ? formData.value.discountDate[1] : null,
          }
        })
        
        // 调用批量保存API
        updateBatchStoreProduct(batchData).then(res => {
          if (res.code === 0) {
            ElMessage.success(t('products.batchUpdateSuccess', { count: batchData.length }))
            dialogVisible.value = false
            fetchData()
          } else {
            ElMessage.error(res.message || t('products.batchUpdateFailed'))
          }
        }).catch(error => {
          ElMessage.error(t('products.batchUpdateFailed'))
        }).finally(() => {
          loading.value = false
        })
      } else {
        // 单个添加处理
        const submitData = {
          id: currentRow.value.id,
          salePrice: currentRow.value.purchasePrice*(1+formData.value.profitRatio/100).toFixed(2),
          isDiscount: formData.value.discountRatio && formData.value.discountRatio !== '' ? 1 : 0,
          discountRate: formData.value.discountRatio || null,
          profitRatio: formData.value.profitRatio,
          discountStartDate: formData.value.discountDate ? formData.value.discountDate[0] : null,
          discountEndDate: formData.value.discountDate ? formData.value.discountDate[1] : null,
        }
        updateStoreProduct(submitData).then(res => {
          if (res.code === 0) {
            ElMessage.success(t('common.updateSuccess'))
            dialogVisible.value = false
            fetchData()
          } else {
            ElMessage.error(res.message || t('common.updateFailed'))
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

// 编辑商品
const handleEdit = (row) => {
  currentRow.value = row
  formData.value = {
    profitRatio: '',
    discountDate: null,
    discountRatio: ''
  }
  dialogVisible.value = true 
}

// 删除商品
const handleDelete = (row) => {
  ElMessageBox.confirm(
    t('products.deleteConfirm', { name: row.productName }),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(async () => {
    try {
      const params = {  
        id: row.id
      }
      const res = await deleteStoreProduct(params)
      if(res.code === 0){
        ElMessage.success(t('common.deleteSuccess'))
        fetchData()
      } else {
        ElMessage.error(res.message || t('common.deleteFailed'))
      }
    } catch (error) {
      ElMessage.error(t('common.deleteFailed'))
    }
  }).catch(() => {
    // 用户取消删除操作
  })
}

// 处理状态变更
const handleStatusChange = async (row, field, value) => {
  const statusMap = {
    isPublished: 'isPublished',
    isRecommended: 'isRecommended',
    isNew: 'isNew'
  }
  
  const fieldName = statusMap[field]
  const updateData = {
    id: row.id,
    [fieldName]: value ? 1 : 0
  }
  
  try {
    const res = await updateStoreProduct(updateData)
    if(res.code === 0){
      ElMessage.success(t('common.updateSuccess'))
      fetchData()
    } else {
      if(res.code === 2){
        ElMessage.error(t('products.isPublishedError'))
        row[field] = !value
      } else if(res.code === 3){
        ElMessage.error(t('products.maxPublishedError'))
        row[field] = !value
      } else if(res.code === 4){
        ElMessage.error(t('products.maxNewError'))
        row[field] = !value
      } else if(res.code === 5){ 
        ElMessage.error(t('products.minPublishedError'))
        row[field] = !value
      }else{
        ElMessage.error(res.message || t('common.updateFailed'))
        row[field] = !value
      }
    }
  } catch (error) {
    // 恢复原状态
    row[field] = !value
    console.error('更新商品状态失败:', error)
    ElMessage.error(t('common.updateFailed'))
  }
}

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


// 格式化分类选项为级联选择器需要的格式
const formatCategoryOptions = () => {
  return categoryOptions.value.map(group => ({
    id: group.id,
    name: group.name,
    children: group.children
  }));
}

// 格式化价格
const formatPrice = (price) => {
  if (!price && price !== 0) return '-';
  return parseFloat(price).toFixed(2);
}

// 计算折扣价
const calculateDiscountPrice = (row) => {
  if (row.isDiscount != 1 || !row.discountRate) return '-';
  // 折扣率直接作为百分比，例如10表示打9折（即10%的折扣）
  const discountPrice = row.salePrice * (1 - row.discountRate / 100);
  return formatPrice(discountPrice);
}

// 计算利润
const calculateProfit = (row) => {
  if (!row.salePrice || !row.purchasePrice) return '-';
  const profit = row.isDiscount == 1 && row.discountRate 
    ? (row.salePrice * (1 - row.discountRate / 100)) - row.purchasePrice
    : row.salePrice - row.purchasePrice;
  return formatPrice(profit);
}

// 多选处理
const handleSelectionChange = (rows) => {
  selectedRows.value = rows
}

// 批量上架
const handleBatchOnSale = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning(t('products.selectProductsFirst'))
    return
  }
  
  ElMessageBox.confirm(
    t('products.batchOnSaleConfirm', { count: selectedRows.value.length }),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    const ids = selectedRows.value.map(row => {
        return row.id
    })
    const data = {
      ids: ids,
      isPublished: 1
    }
    updateBatchStoreProductStatus(data).then(res => {
      if (res.code === 0) {
        ElMessage.success(t('common.operationSuccess'))
        fetchData()
      } else {
        ElMessage.error(res.message || t('common.operationFailed'))
      }
    })
    // 实际操作代码
  }).catch(() => {})
}

// 批量下架
const handleBatchOffSale = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning(t('products.selectProductsFirst'))
    return
  }
  
  ElMessageBox.confirm(
    t('products.batchOffSaleConfirm', { count: selectedRows.value.length }),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    }
  ).then(() => {
    const ids = selectedRows.value.map(row => {
      return  row.id 
    })
    const data = {
      ids: ids,
      isPublished: 0
    }
    updateBatchStoreProductStatus(data).then(res => {
      if (res.code === 0) {
        ElMessage.success(t('common.operationSuccess'))
        fetchData()
      } else {
        ElMessage.error(res.message || t('common.operationFailed'))
      }
    })
    // 实际操作代码
  }).catch(() => {})
}

// 批量编辑
const handleBatchEdit = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning(t('products.selectProductsFirst'))
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

// 批量删除
const handleBatchDelete = () => {
  if (!selectedRows.value || selectedRows.value.length === 0) {
    ElMessage.warning(t('products.selectProductsFirst'))
    return
  }
  
  ElMessageBox.confirm(
    t('products.batchDeleteConfirm', { count: selectedRows.value.length }),
    t('common.warning'),
    {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'danger'
    }
  ).then(() => {
    const ids = selectedRows.value.map(row => {
      return row.id
    })
    deleteBatchStoreProduct(ids).then(res => {
      if (res.code === 0) {
        ElMessage.success(t('common.deleteSuccess'))
        fetchData()
      } else {
        ElMessage.error(res.message || t('common.deleteFailed'))
      }
    })
  }).catch(() => {})
}

// 在组件挂载时添加日志，帮助调试
onMounted(() => {
  getCategoryOptions()
  fetchData()
})

</script>

<style scoped>
.product-list-container {
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
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  overflow: hidden;
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
  justify-content: flex-start;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  gap: 12px;
}

.card-header :deep(.el-button) {
  min-width: 90px;
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  font-weight: 500;
}

.card-header :deep(.el-button--primary) {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.card-header :deep(.el-button--danger) {
  background-color: var(--el-color-danger);
  border-color: var(--el-color-danger);
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
  transition: all 0.3s ease;
  background-color: #fff;
  cursor: pointer;
}

.product-image:hover {
  transform: scale(1.08);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-5);
}

.table-card :deep(.el-button--link) {
  height: 28px;
  padding: 0 8px;
  font-size: 14px;
  font-weight: 500;
}

.table-card :deep(.el-table__cell) {
  padding: 6px 0;
  border-right: none !important;
}

.table-card :deep(.el-table__cell:last-child) {
  border-right: none !important;
}

.table-card :deep(.el-table .cell) {
  padding: 0 12px;
  white-space: nowrap;
}

.table-card :deep(.el-table__header th.el-table__cell) {
  background-color: var(--el-fill-color-light);
  font-weight: 500;
  height: 44px;
  border-bottom: 1px solid var(--el-border-color-lighter) !important;
  color: var(--el-text-color-regular);
}

.table-card :deep(.el-table__header .cell) {
  padding: 8px 12px;
  font-size: 13px;
}

.table-card :deep(.el-table__row) {
  height: 70px;
}

.price {
  font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  color: var(--el-color-danger);
  font-weight: 500;
}

.price-na {
  color: var(--el-text-color-secondary);
}

.sales {
  font-weight: 500;
  color: var(--el-color-primary);
}

.id-column {
  font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.product-name, .product-description {
  display: inline-block;
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
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

.status-switches {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0;
}

.status-switches :deep(.el-switch) {
  --el-switch-on-color: var(--el-color-primary);
  --el-switch-off-color: var(--el-color-info);
}

.status-switches :deep(.el-switch__core) {
  min-width: 50px;
}

.switch-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  margin-bottom: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.switch-item:hover {
  background-color: var(--el-fill-color-light);
}

.switch-label {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-right: 10px;
  min-width: 60px;
  text-align: right;
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

/* 添加页面标识样式 */
.page-identifier {
  background-color: #f0f9eb;
  color: #67c23a;
  padding: 10px;
  margin-bottom: 10px;
  border-radius: 4px;
  text-align: center;
}
button:focus {
          outline: none;
      }
</style> 
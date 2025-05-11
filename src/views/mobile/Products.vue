<template>
  <div class="mobile-products-container">
    <!-- 顶部标签导航 -->
    <div class="tabs-header">
      <div 
        v-for="(tab, index) in tabs" 
        :key="index" 
        class="tab-item" 
        :class="{ active: activeTab === tab.name }"
        @click="switchTab(tab.name)"
      >
        {{ t(tab.title) }}
      </div>
    </div>

    <!-- 内容区域 -->
    <div class="content-container" @scroll="handleScroll">
      <!-- 店铺商品 -->
      <div v-if="activeTab === 'store'" class="tab-content">
        <!-- 筛选条件 -->
        <div class="filter-area">
          <div class="filter-row">
            <div class="filter-item">
              <el-select
                v-model="searchForm.status"
                :placeholder="t('products.status')"
                clearable
                class="filter-select"
                size="small"
                @change="handleSearch"
              >
                <el-option :label="t('common.all')" :value="''" />
                <el-option :label="t('products.isPublished')" :value="1" />
                <el-option :label="t('products.isNotPublished')" :value="0" />
              </el-select>
            </div>
            
            <div class="filter-item">
              <el-select
                v-model="searchForm.category"
                :placeholder="t('products.category')"
                clearable
                class="filter-select"
                size="small"
                filterable
                @change="handleSearch"
              >
                <el-option :label="t('common.all')" :value="''" />
                <el-option-group 
                  v-for="group in categoryOptions" 
                  :key="group.id" 
                  :label="group.name"
                >
                  <el-option 
                    v-for="item in group.children" 
                    :key="item.id" 
                    :label="item.name" 
                    :value="item.id"
                  />
                </el-option-group>
              </el-select>
            </div>
          </div>
        </div>
        
        <!-- 商品列表 -->
        <div class="product-list" v-loading="loading">
          <div v-if="tableData.length === 0" class="empty-data">
            <el-empty :description="t('common.noData')" />
          </div>
          
          <div v-else>
            <div class="product-items">
              <div v-for="item in tableData" :key="item.id" class="product-item">
                <div class="product-thumb">
                  <el-image
                    :src="getImageUrl(item.urlList)"
                    :preview-src-list="getImageUrlList(item.urlList)"
                    :initial-index="0"
                    fit="cover"
                    loading="lazy"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="status-indicator" :class="{ 'status-on': item.isPublished, 'status-off': !item.isPublished }">
                    {{ item.isPublished ? t('products.onSale') : t('products.offSale') }}
                  </div>
                </div>
                
                <div class="product-info">
                  <div class="product-name-row">
                    <div class="product-name-wrapper">
                      <div class="product-name" :title="item.productName" @click="showFullText(item.productName, t('products.name'))">{{ item.productName }}</div>
                    </div>
                    <el-button type="primary" link class="edit-btn" @click="navigateToEdit(item)">
                      <el-icon><MoreFilled /></el-icon>
                    </el-button>
                  </div>
                  
                  <div class="product-detail">
                    <span class="product-category">{{ item.productCategoryStr }}</span>
                    <span class="sales-tag">{{ t('products.totalSales') }}: {{ item.totalSales || 0 }}</span>
                  </div>
                  
                  <div class="product-price-row">
                    <div class="price-container">
                      <span class="price-label">{{ t('products.salePrice') }}:</span>
                      <span class="price">{{ formatMoney(item.salePrice) }}</span>
                      
                      <span class="discount-container" v-if="item.isDiscount == 1">
                        <span class="price-label">{{ t('products.discountPrice') }}:</span>
                        <span class="discount-price">{{ formatMoney(calculateDiscountPrice(item)) }}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 加载更多 -->
            <div class="load-more" v-if="!loading && tableData.length < total">
              <el-button size="small" @click="loadMore" :loading="loadingMore">
                {{ t('common.loadMore') }}
              </el-button>
            </div>
            
            <!-- 没有更多数据 -->
            <div class="no-more" v-if="!loading && tableData.length > 0 && tableData.length >= total">
              {{ t('common.noMoreData') }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 商品库 -->
      <div v-if="activeTab === 'warehouse'" class="tab-content" data-tab="warehouse">
        <!-- 筛选条件 -->
        <div class="filter-row warehouse-filter-row">
          <div class="select-all-wrapper">
            <el-checkbox 
              v-model="allWarehouseSelected" 
              @change="handleSelectAllChange" 
              :indeterminate="isIndeterminate"
            >
              {{ t('common.selectAll') }}
            </el-checkbox>
          </div>
          
          <div class="filter-right">
            <div class="filter-item">
              <el-select
                v-model="warehouseSearchForm.category"
                :placeholder="t('products.category')"
                clearable
                class="filter-select"
                size="small"
                filterable
                @change="handleWarehouseSearch"
              >
                <el-option :label="t('common.all')" :value="''" />
                <el-option-group 
                  v-for="group in categoryOptions" 
                  :key="group.id" 
                  :label="group.name"
                >
                  <el-option 
                    v-for="item in group.children" 
                    :key="item.id" 
                    :label="item.name" 
                    :value="item.id"
                  />
                </el-option-group>
              </el-select>
            </div>
            
            <el-button 
              size="small" 
              type="primary" 
              @click="handleBatchAdd" 
              :disabled="selectedWareProducts.length === 0"
              class="batch-add-btn"
            >
              {{ t('common.batchAdd') }} ({{ selectedWareProducts.length }})
            </el-button>
          </div>
        </div>
        
        <!-- 商品列表 -->
        <div class="product-list" v-loading="warehouseLoading">
          <div v-if="warehouseData.length === 0" class="empty-data">
            <el-empty :description="t('common.noData')" />
          </div>
          
          <div v-else>
            <div class="product-items">
              <div v-for="item in warehouseData" :key="item.productId" class="product-item">
                <div class="product-checkbox">
                  <el-checkbox 
                    v-model="item.selected" 
                    @change="(val) => handleSelectionChange(val, item)"
                  />
                </div>
                <div class="product-thumb">
                  <el-image
                    :src="getImageUrl(item.urlList)"
                    :preview-src-list="getImageUrlList(item.urlList)"
                    :initial-index="0"
                    fit="cover"
                    loading="lazy"
                  >
                    <template #error>
                      <div class="image-error">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                </div>
                
                <div class="product-info">
                  <div class="product-name-row">
                    <div class="product-name-wrapper">
                      <div class="product-name" :title="item.productName" @click="showFullText(item.productName, t('products.name'))">
                        {{ item.productName }}
                      </div>
                    </div>
                    <el-button type="primary" link class="add-btn" @click="handleAddToStore(item)">
                      {{ t('common.add') }}
                    </el-button>
                  </div>
                  
                  <div class="product-detail">
                    <span class="product-category text-ellipsis">{{ item.categoryIdStr }}</span>
                  </div>
                  
                  <div class="product-price-row">
                    <div class="price-container">
                      <span class="price-label">{{ t('products.purchasePrice') }}:</span>
                      <span class="price">{{ formatMoney(item.price) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 加载更多 -->
            <div class="load-more" v-if="!warehouseLoading && warehouseData.length < warehouseTotal">
              <el-button size="small" @click="loadMoreWarehouse" :loading="warehouseLoadingMore">
                {{ t('common.loadMore') }}
              </el-button>
            </div>
            
            <!-- 没有更多数据 -->
            <div class="no-more" v-if="!warehouseLoading && warehouseData.length > 0 && warehouseData.length >= warehouseTotal">
              {{ t('common.noMoreData') }}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 商品评论 -->
      <div v-if="activeTab === 'reviews'" class="tab-content" data-tab="reviews">
        <!-- 筛选区域 -->
        <div class="filter-area reviews-filter">
          <div class="filter-row">
            <div class="filter-item">
              <el-input
                v-model="reviewsSearchForm.productName"
                :placeholder="t('products.pleaseInputProductName')"
                clearable
                class="filter-input"
                size="small"
                prefix-icon="Search"
              />
            </div>
            
            <div class="filter-item">
              <el-select
                v-model="reviewsSearchForm.rating"
                :placeholder="t('products.rating')"
                clearable
                class="filter-select"
                size="small"
              >
                <el-option :label="t('products.oneStar')" :value="1" />
                <el-option :label="t('products.twoStars')" :value="2" />
                <el-option :label="t('products.threeStars')" :value="3" />
                <el-option :label="t('products.fourStars')" :value="4" />
                <el-option :label="t('products.fiveStars')" :value="5" />
              </el-select>
            </div>
            
            <div class="search-btn-wrapper">
              <el-button type="primary" size="small" @click="handleReviewsSearch">
                {{ t('common.search') }}
              </el-button>
            </div>
          </div>
        </div>
        
        <!-- 评论列表 -->
        <div class="reviews-list" v-loading="reviewsLoading">
          <div v-if="reviewsData.length === 0" class="empty-data">
            <el-empty :description="t('common.noData')" />
          </div>
          
          <div v-else class="reviews-wrapper">
            <div v-for="(item, index) in reviewsData" :key="index" class="review-item">
              <div class="review-header">
                <div class="review-user">{{ item.userName }}</div>
                <div class="review-rating">
                  <el-rate v-model="item.rating" disabled show-score text-color="#ff9900" score-template="{value}" />
                </div>
              </div>
              
              <div class="review-content">{{ item.comment }}</div>
              
              <div class="review-footer">
                <div class="review-info-row">
                  <div class="review-product">
                    <span class="label">{{ t('products.name') }}:</span>
                    <span class="value" @click="showFullText(item.productName, t('products.name'))">{{ item.productName }}</span>
                  </div>
                </div>
                
                <div class="review-info-row">
                  <div class="review-order">
                    <span class="label">{{ t('orders.orderId') }}:</span>
                    <span class="value" @click="showFullText(item.orderNo, t('orders.orderId'))">{{ item.orderNo }}</span>
                    <span class="review-time">{{ item.createdAt }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 滚动加载指示器 -->
            <div class="reviews-scroll-observer" v-if="reviewsData.length < reviewsTotal">
              <div class="loading-indicator" v-if="reviewsLoadingMore">
                <el-icon class="is-loading"><Loading /></el-icon>
                <span>{{ t('common.loading') }}</span>
              </div>
            </div>
            
            <!-- 没有更多数据 -->
            <div class="no-more" v-if="!reviewsLoading && reviewsData.length > 0 && reviewsData.length >= reviewsTotal">
              {{ t('common.noMoreData') }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加对话框组件 -->
    <el-dialog
      v-model="productAddDialogVisible"
      :title="t('products.addProduct')"
      width="90%"
      top="15vh"
      :show-close="true"
      destroy-on-close
    >
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="top"
        class="product-form"
      >
        <div class="selected-product">
          <div class="product-info-wrapper">
            <span class="label">{{ t('products.selectedProduct') }}:</span>
            <span class="value" style="text-align: center; width: 100%;">{{ currentRow.productName }}</span>
          </div>
        </div>
        
        <el-form-item :label="t('products.profitRatio')" prop="profitRatio" class="form-item" align="left">
          <el-input 
            v-model="formData.profitRatio" 
            :placeholder="t('products.enterProfitRatio')"
            class="form-input"
          >
            <template #append>%</template>
          </el-input>
          <div class="form-tip">{{ t('products.profitRatioDesc') }}</div>
          <div class="form-tip highlight">{{ t('products.suggestedProfitRatio') }}</div>
        </el-form-item>


        <el-form-item :label="t('products.discountDate')" class="form-item">
          <el-row :gutter="10">
            <el-col :span="12">
              <el-date-picker
                v-model="formData.startDate"
                type="date"
                :placeholder="t('common.startDate')"
                style="width: 100%"
                :disabled-date="disabledDate"
                :teleported="false"
                :popper-options="{ placement: 'top' }"
                size="small"
              />
            </el-col>
            <el-col :span="12">
              <el-date-picker
                v-model="formData.endDate"
                type="date"
                :placeholder="t('common.endDate')"
                style="width: 100%"
                :disabled-date="(time) => disabledDate(time, formData.startDate)"
                :teleported="false"
                :popper-options="{ placement: 'top' }"
                size="small"
              />
            </el-col>
          </el-row>
        </el-form-item>
        
          <!-- <el-form-item :label="t('products.discountDate')" class="form-item" align="left">
          <el-date-picker
            v-model="formData.discountDate"
            type="daterange"
            :range-separator="t('common.to')"
            :start-placeholder="t('common.startDate')"
            :end-placeholder="t('common.endDate')"
            :disabled-date="disabledDate"
            class="form-input"
          />
        </el-form-item> -->
        
        <el-form-item 
          :label="t('products.discountRatio')" 
          class="form-item"
          :class="{ 'disabled-form-item': !formData.startDate || !formData.endDate }"
          align="left"
        >
          <el-input 
            v-model="formData.discountRatio" 
            :placeholder="t('products.enterDiscountRatio')"
            :disabled="!formData.startDate || !formData.endDate"
            class="form-input"
          >
            <template #append>%</template>
          </el-input>
          <div class="form-tip" v-if="formData.startDate && formData.endDate">
            {{ t('products.discountRatioDesc') }}
          </div>
          <div class="form-tip" v-else>
            {{ t('products.selectDateFirst') }}
          </div>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button type="primary" @click="submitForm" :loading="submitLoading">{{ t('common.confirm') }}</el-button>
          <el-button @click="productAddDialogVisible = false">{{ t('common.cancel') }}</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 全文显示对话框 -->
    <el-dialog
      v-model="fullTextDialogVisible"
      :title="fullTextTitle"
      width="80%"
      center
      align-center
    >
      <div class="full-text-content">
        {{ fullTextContent }}
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { 
  Search, 
  Filter, 
  Picture,
  MoreFilled,
  ArrowLeft,
  Calendar,
  Loading
} from '@element-plus/icons-vue'
import { 
  getProductCategory, 
  getStoreProductList, 
  updateStoreProduct, 
  deleteStoreProduct,
  getWarehouseList,
  saveProductToStore,
  saveBatchProductsToStore,
  getReviewsList
} from '@/api/product'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatMoney } from '@/utils/format'

const { t } = useI18n()
const router = useRouter()

// 标签配置
const tabs = [
  { name: 'store', title: 'menu.shopProducts' },
  { name: 'warehouse', title: 'menu.productWarehouse' },
  { name: 'reviews', title: 'products.reviews' }
]
const activeTab = ref('store')

// 切换标签
const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'store') {
    currentPage.value = 1
    tableData.value = []
    fetchData()
  } else if (tab === 'warehouse') {
    warehouseCurrentPage.value = 1
    warehouseData.value = []
    selectedWareProducts.value = []
    fetchWarehouseData()
  } else if (tab === 'reviews') {
    reviewsCurrentPage.value = 1
    reviewsData.value = []
    fetchReviewsData()
  }
}

// 筛选相关
const searchForm = ref({
  name: '',
  category: '',
  status: ''
})

// 分类选项
const categoryOptions = ref([])

// 表格数据
const loading = ref(false)
const loadingMore = ref(false)
const tableData = ref([])
const currentPage = ref(1)
const pageSize = ref(15)
const total = ref(0)

// 商品库相关
const warehouseSearchForm = ref({
  category: ''
})
const warehouseLoading = ref(false)
const warehouseLoadingMore = ref(false)
const warehouseData = ref([])
const warehouseCurrentPage = ref(1)
const warehousePageSize = ref(15)
const warehouseTotal = ref(0)
const selectedWareProducts = ref([])
const allWarehouseSelected = ref(false)
const isIndeterminate = ref(false)

// 禁用过去的日期
const disabledDate = (time) => {
  return time.getTime() < Date.now() - 86400000
}

// 导航到编辑页面
const navigateToEdit = (item) => {
  console.log('正在跳转到编辑页面:', item.id)
  router.push({
    name: 'MobileProductEdit',
    params: { id: item.id.toString() },
    query: { 
      data: encodeURIComponent(JSON.stringify(item))
    }
  })
}

// 获取分类选项
const getCategoryOptions = async () => {
  try {
    const { data } = await getProductCategory()
    categoryOptions.value = data
  } catch (error) {
    console.error('获取分类失败:', error)
  }
}

// 获取商品数据
const fetchData = async (isLoadMore = false) => {
  if (!isLoadMore) {
    loading.value = true
  } else {
    loadingMore.value = true
  }
  
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
    if (code === 1) {
      ElMessage.error(t('common.network.requestFailed'))
      if (!isLoadMore) {
        tableData.value = []
      }
      total.value = 0
    } else {
      // 处理数据
      const records = (data.records || []).map(item => ({
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
      
      if (isLoadMore) {
        tableData.value = [...tableData.value, ...records]
      } else {
        tableData.value = records
      }
      
      total.value = data.total || 0
    }
  } catch (error) {
    console.error('获取商品列表失败:', error)
    ElMessage.error(t('common.network.requestFailed'))
    if (!isLoadMore) {
      tableData.value = []
    }
  } finally {
    loading.value = false
    loadingMore.value = false
  }
}

// 加载更多数据
const loadMore = () => {
  if (tableData.value.length >= total.value) return
  currentPage.value += 1
  fetchData(true)
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  tableData.value = []
  fetchData()
}

// 获取图片URL
const getImageUrl = (urlList) => {
  if (!urlList || urlList.length === 0) return ''
  return Array.isArray(urlList) ? urlList[0] : urlList
}

// 获取图片URL列表
const getImageUrlList = (urlList) => {
  if (!urlList) return []
  if (Array.isArray(urlList) && urlList.length > 0) {
    return urlList
  }
  return [urlList].filter(Boolean)
}

// 计算折扣价
const calculateDiscountPrice = (row) => {
  if (row.isDiscount != 1 || !row.discountRate) return '-'
  // 折扣率直接作为百分比，例如10表示打9折（即10%的折扣）
  const discountPrice = row.salePrice * (1 - row.discountRate / 100)
  return parseFloat(discountPrice).toFixed(2)
}

// 计算利润
const calculateProfit = (row) => {
  if (!row.salePrice || !row.purchasePrice) return '-'
  const profit = row.isDiscount == 1 && row.discountRate 
    ? (row.salePrice * (1 - row.discountRate / 100)) - row.purchasePrice
    : row.salePrice - row.purchasePrice
  return parseFloat(profit).toFixed(2)
}

// 获取商品库数据
const fetchWarehouseData = async (isLoadMore = false) => {
  if (!isLoadMore) {
    warehouseLoading.value = true
  } else {
    warehouseLoadingMore.value = true
  }
  
  const params = {
    pageIndex: warehouseCurrentPage.value,
    pageSize: warehousePageSize.value,
    category: warehouseSearchForm.value.category
  }
  
  try {
    const { code, data } = await getWarehouseList(params)
    if (code === 1) {
      ElMessage.error(t('common.network.requestFailed'))
      if (!isLoadMore) {
        warehouseData.value = []
      }
      warehouseTotal.value = 0
    } else {
      // 处理数据
      const records = (data.records || []).map(item => ({
        ...item,
        selected: false
      }))
      
      if (isLoadMore) {
        warehouseData.value = [...warehouseData.value, ...records]
      } else {
        warehouseData.value = records
      }
      
      warehouseTotal.value = data.total || 0
    }
  } catch (error) {
    console.error('获取商品库列表失败:', error)
    ElMessage.error(t('common.network.requestFailed'))
    if (!isLoadMore) {
      warehouseData.value = []
    }
  } finally {
    warehouseLoading.value = false
    warehouseLoadingMore.value = false
  }
}

// 加载更多商品库数据
const loadMoreWarehouse = () => {
  if (warehouseData.value.length >= warehouseTotal.value) return
  warehouseCurrentPage.value += 1
  fetchWarehouseData(true)
}

// 商品库搜索
const handleWarehouseSearch = () => {
  warehouseCurrentPage.value = 1
  warehouseData.value = []
  fetchWarehouseData()
}

// 添加商品到店铺
const handleAddToStore = (row) => {
  productAddDialogVisible.value = true
  currentRow.value = row
  formData.value = {
    profitRatio: '',
    startDate: null,
    endDate: null,
    discountRatio: ''
  }
}

// 添加对话框相关
const productAddDialogVisible = ref(false)
const currentRow = ref({})
const formData = ref({
  profitRatio: '',
  startDate: null,
  endDate: null,
  discountRatio: ''
})
const formRules = {
  profitRatio: [
    { pattern: /^(0|[1-9][0-9]?)(\.\d{1,2})?$/, message: t('products.validRatioFormat'), trigger: 'blur' }
  ]
}
const formRef = ref(null)

// 提交表单
const submitLoading = ref(false)
const submitForm = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate((valid) => {
    if (valid) {
      submitLoading.value = true
      
      if (currentRow.value.isBatch) {
        // 批量添加处理
        const batchData = selectedWareProducts.value.map(row => {
          return {
            productId: row.productId,
            productName: row.productName,
            purchasePrice: row.price,
            productDescription: row.description,
            productCategory: row.categoryId,
            productImageUrl: row.imageUrls || row.urlList,
            stockQuantity: row.stockQuantity || 0,
            salePrice: row.price * (1 + (formData.value.profitRatio ? parseFloat(formData.value.profitRatio) : 0) / 100),
            merchantId: sessionStorage.getItem('userId'),
            shopName: sessionStorage.getItem('shopName'),
            shopId: sessionStorage.getItem('shopId'),
            isDiscount: formData.value.discountRatio && formData.value.discountRatio !== '' ? 1 : 0,
            discountRate: formData.value.discountRatio || null,
            profitRatio: formData.value.profitRatio || null,
            discountStartDate: formData.value.startDate ? formData.value.startDate : null,
            discountEndDate: formData.value.endDate ? formData.value.endDate : null,
          }
        })
        
        saveBatchProductsToStore(batchData).then(res => {
          if (res.code === 0) {
            ElMessage.success(t('products.batchAddSuccess', { count: batchData.length }))
            productAddDialogVisible.value = false
            // 清空选择
            selectedWareProducts.value = []
            warehouseData.value.forEach(item => item.selected = false)
            // 刷新数据
            if (activeTab.value === 'warehouse') {
              fetchWarehouseData()
            } else {
              fetchData()
            }
          } else {
            ElMessage.error(res.message || t('products.batchAddFailed'))
          }
        }).catch(error => {
          console.error('批量保存失败:', error)
          ElMessage.error(t('products.batchAddFailed'))
        }).finally(() => {
          submitLoading.value = false
        })
      } else {
        // 单个添加处理
        const submitData = {
          productId: currentRow.value.productId,
          productName: currentRow.value.productName,
          purchasePrice: currentRow.value.price,
          productDescription: currentRow.value.description,
          productCategory: currentRow.value.categoryId,
          productImageUrl: currentRow.value.imageUrls || currentRow.value.urlList,
          stockQuantity: currentRow.value.stockQuantity || 0,
          salePrice: currentRow.value.price * (1 + (formData.value.profitRatio ? parseFloat(formData.value.profitRatio) : 0) / 100),
          merchantId: sessionStorage.getItem('userId'),
          shopName: sessionStorage.getItem('shopName'),
          shopId: sessionStorage.getItem('shopId'),
          isDiscount: formData.value.discountRatio && formData.value.discountRatio !== '' ? 1 : 0,
          discountRate: formData.value.discountRatio || null,
          profitRatio: formData.value.profitRatio || null,
          discountStartDate: formData.value.startDate ? formData.value.startDate : null,
          discountEndDate: formData.value.endDate ? formData.value.endDate : null,
        }
        
        saveProductToStore(submitData).then(res => {
          if (res.code === 0) {
            ElMessage.success(t('common.addSuccess'))
            productAddDialogVisible.value = false
            // 如果当前页是商品库，则刷新商品库数据，否则刷新店铺商品数据
            if (activeTab.value === 'warehouse') {
              fetchWarehouseData()
            } else {
              fetchData()
            }
          } else {
            ElMessage.error(res.message || t('common.addFailed'))
          }
        }).catch(error => {
          console.error('保存失败:', error)
          ElMessage.error(t('common.addFailed'))
        }).finally(() => {
          submitLoading.value = false
        })
      }
    }
  })
}

// 监听折扣日期变化，清空折扣比例
watch(() => formData.value.startDate || formData.value.endDate, (newVal) => {
  if (!newVal || newVal.length !== 2) {
    formData.value.discountRatio = ''
  }
})

// 处理全选变更
const handleSelectAllChange = (val) => {
  warehouseData.value.forEach(item => {
    item.selected = val;
  });
  updateSelectedProducts();
}

// 处理单个选择变更
const handleSelectionChange = (val, item) => {
  updateSelectedProducts();
}

// 更新选中的商品
const updateSelectedProducts = () => {
  selectedWareProducts.value = warehouseData.value.filter(item => item.selected);
  
  // 更新全选状态和半选状态
  const checkedCount = selectedWareProducts.value.length;
  allWarehouseSelected.value = checkedCount === warehouseData.value.length && warehouseData.value.length > 0;
  isIndeterminate.value = checkedCount > 0 && checkedCount < warehouseData.value.length;
}

// 批量添加商品
const handleBatchAdd = () => {
  if (selectedWareProducts.value.length === 0) {
    ElMessage({
      message: t('products.selectProductsFirst'),
      type: 'warning'
    });
    return;
  }
  
  productAddDialogVisible.value = true;
  currentRow.value = { 
    isBatch: true, 
    count: selectedWareProducts.value.length,
    productName: `${selectedWareProducts.value.length} ${t('products.selectedProducts')}`
  };
  formData.value = {
    profitRatio: '',
    startDate: null,
    endDate: null,
    discountRatio: ''
  };
  
  // 监听对话框关闭，重置选择状态
  const resetSelection = () => {
    selectedWareProducts.value = [];
    warehouseData.value.forEach(item => {
      item.selected = false;
    });
    allWarehouseSelected.value = false;
    isIndeterminate.value = false;
    
    // 移除监听器，避免重复执行
    productAddDialogVisible.value = false;
    setTimeout(() => {
      productAddDialogVisible.value = true;
      setTimeout(() => {
        productAddDialogVisible.value = false;
      });
    });
  };
  
  // 添加监听器
  watch(productAddDialogVisible, (newVal) => {
    if (!newVal) {
      resetSelection();
    }
  }, { once: true });
}

// 商品评论相关
const reviewsSearchForm = ref({
  productName: '',
  rating: ''
})
const reviewsLoading = ref(false)
const reviewsLoadingMore = ref(false)
const reviewsData = ref([])
const reviewsCurrentPage = ref(1)
const reviewsPageSize = ref(10)
const reviewsTotal = ref(0)
const reviewsScrollObserver = ref(null)

// 获取商品评论数据
const fetchReviewsData = async (isLoadMore = false) => {
  if (!isLoadMore) {
    reviewsLoading.value = true
  } else {
    reviewsLoadingMore.value = true
  }
  
  const params = {
    shopId: sessionStorage.getItem('shopId'),
    pageIndex: reviewsCurrentPage.value,
    pageSize: reviewsPageSize.value,
    name: reviewsSearchForm.value.productName,
    rating: reviewsSearchForm.value.rating
  }
  
  try {
    const { code, data } = await getReviewsList(params)
    if (code !== 0) {
      ElMessage.error(t('common.network.requestFailed'))
      if (!isLoadMore) {
        reviewsData.value = []
      }
      reviewsTotal.value = 0
    } else {
      if (isLoadMore) {
        reviewsData.value = [...reviewsData.value, ...(data.records || [])]
      } else {
        reviewsData.value = data.records || []
      }
      
      reviewsTotal.value = data.total || 0
    }
  } catch (error) {
    console.error('获取商品评论列表失败:', error)
    ElMessage.error(t('common.network.requestFailed'))
    if (!isLoadMore) {
      reviewsData.value = []
    }
  } finally {
    reviewsLoading.value = false
    reviewsLoadingMore.value = false
    
    // 设置滚动观察器
    if (activeTab.value === 'reviews') {
      nextTick(() => {
        setupReviewsScrollObserver()
      })
    }
  }
}

// 设置滚动加载观察器
const setupReviewsScrollObserver = () => {
  // 如果已经加载完所有数据，不需要设置观察器
  if (reviewsData.value.length >= reviewsTotal.value) {
    return
  }
  
  // 移除之前的观察器
  if (reviewsScrollObserver.value) {
    reviewsScrollObserver.value.disconnect()
  }
  
  // 查找加载指示器元素
  const observerTarget = document.querySelector('.reviews-scroll-observer')
  if (!observerTarget) return
  
  // 创建新的观察器
  reviewsScrollObserver.value = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !reviewsLoadingMore.value && reviewsData.value.length < reviewsTotal.value) {
      reviewsCurrentPage.value += 1
      fetchReviewsData(true)
    }
  }, { threshold: 0.1 })
  
  // 开始观察
  reviewsScrollObserver.value.observe(observerTarget)
}

// 评论搜索
const handleReviewsSearch = () => {
  reviewsCurrentPage.value = 1
  reviewsData.value = []
  fetchReviewsData()
}

// 监听标签切换，重新设置滚动观察器
watch(activeTab, (newVal) => {
  if (newVal === 'reviews') {
    if (reviewsData.value.length === 0) {
      fetchReviewsData()
    } else {
      nextTick(() => {
        setupReviewsScrollObserver()
      })
    }
  } else if (reviewsScrollObserver.value) {
    reviewsScrollObserver.value.disconnect()
  }
})

// 滚动处理函数
const handleScroll = (e) => {
  const container = e.target
  
  // 计算距离底部的距离
  const distanceToBottom = container.scrollHeight - container.scrollTop - container.clientHeight
  
  // 当距离底部小于100px时加载更多数据
  if (distanceToBottom < 100) {
    // 根据当前活动的标签页加载相应的数据
    if (activeTab.value === 'store') {
      // 如果正在加载或没有更多数据，则直接返回
      if (loading.value || loadingMore.value || tableData.value.length >= total.value) return
      loadMore()
    } else if (activeTab.value === 'warehouse') {
      // 如果正在加载或没有更多数据，则直接返回
      if (warehouseLoading.value || warehouseLoadingMore.value || warehouseData.value.length >= warehouseTotal.value) return
      loadMoreWarehouse()
    }
    // 评论列表已使用IntersectionObserver实现滚动加载，不需要在这里处理
  }
}

// 在<script setup>部分中添加新的状态变量
const fullTextDialogVisible = ref(false);
const fullTextContent = ref('');
const fullTextTitle = ref('');

// 添加新的方法来显示全文对话框
const showFullText = (text, title) => {
  fullTextContent.value = text;
  fullTextTitle.value = title || '';
  fullTextDialogVisible.value = true;
};

onMounted(() => {
  getCategoryOptions()
  fetchData()
})
</script>

<style scoped>
.mobile-products-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  z-index: 90;
  background-color: #f5f7fa;
}

.tabs-header {
  display: flex;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 90;
  height: 45px;
  flex-shrink: 0;
}

.tabs-header::-webkit-scrollbar {
  display: none; /* Chrome, Safari, Edge */
}

.tab-item {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  font-size: 14px;
  color: #606266;
  position: relative;
  cursor: pointer;
}

.tab-item.active {
  color: #409EFF;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 20%;
  width: 60%;
  height: 3px;
  background-color: #409EFF;
  border-radius: 2px;
}

.content-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding-bottom: 60px;
  -webkit-overflow-scrolling: touch;
}

.tab-content {
  padding: 10px 12px;
}

/* 筛选区域样式 */
.filter-area {
  margin-bottom: 8px;
  padding: 8px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.filter-row {
  display: flex;
  gap: 8px;
}

.filter-item {
  flex: 1;
}

.filter-select {
  width: 100%;
}

.search-btn {
  min-width: 60px;
  height: 32px;
}

/* 商品列表样式 */
.product-list {
  min-height: 100px;
}

.product-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.product-item {
  display: flex;
  padding: 12px;
  border-bottom: 1px solid #f0f2f5;
  background-color: #fff;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.product-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
}

.product-thumb {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 12px;
  position: relative;
  flex-shrink: 0;
}

.product-thumb :deep(.el-image) {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.status-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 3px 0;
  font-size: 10px;
  text-align: center;
  color: white;
  line-height: 1;
  border-radius: 0 0 4px 4px;
}

.status-on {
  background-color: rgba(103, 194, 58, 0.8);
}

.status-off {
  background-color: rgba(144, 147, 153, 0.8);
}

.image-error {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 20px;
  border-radius: 4px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
  align-items: flex-start;
  text-align: center;
  position: relative;
  max-width: calc(100% - 92px); /* 80px图片宽度 + 12px右边距 */
}

.product-name-row {
  display: flex;
  position: relative;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 8px;
}

.product-name-wrapper {
  width: 85%;
  overflow: hidden;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  text-align: left;
  width: 100%;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-btn, .add-btn {
  position: absolute;
  right: 0;
  top: 0;
  padding: 0;
  width: 40px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-detail {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.product-category {
  font-size: 12px;
  color: #909399;
  max-width: 60%;
  display: inline-block;
  text-align: left;
}

.sales-tag {
  font-size: 12px;
  color: #606266;
  text-align: right;
}

.product-price-row {
  font-size: 12px;
  color: #606266;
  width: 100%;
  text-align: left;
}

.price-container {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.price-label {
  margin-right: 4px;
}

.price {
  color: #f56c6c;
  font-weight: 500;
  margin-right: 12px;
}

.discount-container {
  display: flex;
  align-items: center;
  margin-left: auto;
}

.discount-price {
  color: #f56c6c;
  font-weight: 500;
}

/* 加载更多按钮 */
.load-more {
  text-align: center;
  margin: 12px 0;
}

.no-more {
  text-align: center;
  color: #909399;
  font-size: 12px;
  padding: 12px 0;
}

/* 空数据状态 */
.empty-data {
  padding: 30px 0;
}

/* 占位符 */
.placeholder {
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f7fa;
  border-radius: 8px;
  color: #909399;
  font-size: 14px;
}

.selected-product {
  background-color: #f5f7fa;
  padding: 10px 12px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.product-info-wrapper {
  display: flex;
  flex-direction: column;
}

.product-info-wrapper .label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #606266;
  text-align: center;
}

.product-info-wrapper .value {
  color: #409EFF;
  font-size: 14px;
  word-break: break-all;
  text-align: center;
  width: 100%;
}

.form-item {
  margin-bottom: 15px;
}

.form-input {
  width: 100%;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-tip.highlight {
  color: #409EFF;
}

.disabled-form-item :deep(.el-form-item__label) {
  color: #C0C4CC;
}

.dialog-footer {
  display: flex;
  justify-content: center;
  gap: 15px;
  width: 100%;
}

.dialog-footer .el-button {
  min-width: 100px;
}

.batch-add-btn {
  margin-left: auto;
  flex-shrink: 0;
}

/* 商品库专用样式 */
.product-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
}

.select-all-wrapper {
  display: flex;
  align-items: center;
}

.select-all-wrapper :deep(.el-checkbox__label) {
  transform: translateY(1px);
}

/* 商品库标签页特有样式 */
.tab-content[data-tab="warehouse"] .filter-area {
  background-color: #f7f8fa;
  box-shadow: none;
  border-radius: 4px;
  margin-bottom: 8px;
}

.tab-content[data-tab="warehouse"] .filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  min-height: 32px;
}

.tab-content[data-tab="warehouse"] .select-all-wrapper {
  flex-shrink: 0;
  margin-right: 0;
  display: flex;
  align-items: center;
  height: 32px;
}

.tab-content[data-tab="warehouse"] .select-all-wrapper :deep(.el-checkbox) {
  display: flex;
  align-items: center;
  margin-right: 0;
  height: 100%;
}

.tab-content[data-tab="warehouse"] .filter-item {
  flex: 1;
  max-width: 40%;
  display: flex;
  align-items: center;
  height: 32px;
}

.tab-content[data-tab="warehouse"] .batch-add-btn {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  height: 32px;
}

.warehouse-filter-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background-color: #fff;
  border-radius: 4px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 评论样式 */
.reviews-filter {
  background-color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  margin-bottom: 8px;
  padding: 8px;
}

.reviews-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-item {
  background-color: #fff;
  border-radius: 6px;
  padding: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  align-items: center;
}

.review-user {
  font-weight: 500;
  color: #303133;
  font-size: 14px;
}

.review-time {
  color: #909399;
  font-size: 12px;
}

.review-rating {
  display: flex;
  align-items: center;
}

.review-rating :deep(.el-rate__text) {
  font-size: 12px;
  color: #ff9900;
  margin-left: 4px;
}

.review-rating :deep(.el-rate__icon) {
  font-size: 14px;
  margin-right: 2px;
}

.review-content {
  padding: 8px 0;
  color: #303133;
  line-height: 1.5;
  font-size: 14px;
  border-bottom: 1px solid #f0f2f5;
  margin-bottom: 8px;
}

.review-footer {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-info-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 5px;
  
  .review-product, .review-order {
    display: flex;
    align-items: center;
    margin-right: 15px;
    font-size: 11px;
    
    .label {
      color: #909399;
      margin-right: 5px;
      white-space: nowrap;
    }
    
    .value {
      color: #606266;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 220px;
    }
  }
  
  .review-order {
    display: flex;
    align-items: center;
    font-size: 11px;
    width: 100%;
    position: relative;
  }
  
  .review-time {
    color: #909399;
    font-size: 11px;
    position: absolute;
    right: 0;
  }
}

.reviews-list {
  min-height: 150px;
}

.reviews-scroll-observer {
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 5px 0;
}

.loading-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 5px;
  color: #909399;
  font-size: 12px;
}

.loading-indicator .el-icon {
  font-size: 14px;
  margin-right: 2px;
}

.no-more {
  text-align: center;
  padding: 8px 0;
  color: #909399;
  font-size: 12px;
}

.product-card {
  margin-bottom: 15px;
  border-radius: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.product-info {
  padding: 10px;
  overflow: hidden;
  width: 100%;
  box-sizing: border-box;
}

.product-name-row {
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
}

.product-name-wrapper {
  width: calc(100% - 50px);
  overflow: hidden;
}

.product-name {
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  text-align: left;
  width: 100%;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.edit-btn, .add-btn {
  position: absolute;
  right: 0;
  top: 0;
  padding: 4px 8px;
  width: auto;
  min-width: 40px;
  max-width: 60px;
  height: auto;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-info {
  padding: 10px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;
}

.product-item {
  display: flex;
  background-color: #fff;
  border-radius: 5px;
  margin-bottom: 15px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.search-btn-wrapper {
  flex-shrink: 0;
  margin-left: 8px;
}

.product-form {
  .el-form-item__label {
    padding-bottom: 8px;
    line-height: 1.2;
    white-space: normal;
    text-align: left;
    font-weight: 500;
  }
  
  .el-input, .el-select, .el-date-editor {
    width: 100%;
  }
  
  .form-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
    line-height: 1.3;
  }
  
  .highlight {
    color: #409EFF;
  }
}

.selected-product {
  background-color: #f5f7fa;
  padding: 10px 12px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.product-info {
  display: flex;
  flex-direction: column;
}

.product-info .label {
  font-weight: bold;
  margin-bottom: 5px;
  color: #606266;
}

.product-info .value {
  color: #409EFF;
  font-size: 14px;
  word-break: break-all;
  text-align: center;
  width: 100%;
}

.form-item {
  margin-bottom: 18px;
}

.form-input {
  width: 100%;
}

.disabled-form-item .el-form-item__label {
  color: #c0c4cc;
}

.select-product-count {
  margin-top: 10px;
  margin-bottom: 10px;
  text-align: left;
  font-size: 14px;
}

.product-name, .review-product .value, .review-order .value {
  cursor: pointer;
}

.full-text-content {
  word-break: break-word;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
  padding: 0 10px;
}
</style> 
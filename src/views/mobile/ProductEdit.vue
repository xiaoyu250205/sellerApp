<template>
  <div class="product-edit-page">
    <div class="edit-header">
      <div class="back-btn" @click="goBack">
        <el-icon><ArrowLeft /></el-icon>
      </div>
      <div class="edit-title">{{ t('products.editProduct') }}</div>
      <div class="header-spacer"></div>
    </div>
    
    <div class="edit-form-container">
      <div class="product-name-header" v-if="productData.productName">
        {{ productData.productName }}
      </div>
      
      <el-form 
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-position="left"
        label-width="120px"
      >
        <!-- 价格信息区域 -->
        <div class="price-info-section">
          <div class="price-info-item">
            <div class="price-label">{{ t('products.purchasePrice') }}</div>
            <div class="price-value">{{ formatMoney(productData.purchasePrice || 0) }}</div>
          </div>
          <div class="price-info-item">
            <div class="price-label">{{ t('products.salePrice') }}</div>
            <div class="price-value highlight">{{ formatMoney(calculatedSalePrice) }}</div>
          </div>
          <div class="price-info-item">
            <div class="price-label">{{ t('products.discountPrice') }}</div>
            <div class="price-value discount">{{ showDiscountPrice ? formatMoney(calculatedDiscountPrice) : '-' }}</div>
          </div>
          <div class="price-info-item">
            <div class="price-label">{{ t('products.profit') }}</div>
            <div class="price-value profit">{{ formatMoney(calculatedProfit) }}</div>
          </div>
        </div>
        
        <el-form-item :label="t('products.status')" prop="isPublished" class="form-item">
          <el-switch
            v-model="formData.isPublished"
            :active-text="t('products.onSale')"
            :inactive-text="t('products.offSale')"
          />
        </el-form-item>
        
        <el-form-item :label="t('products.isRecommended')" prop="isRecommended" class="form-item">
          <el-switch
            v-model="formData.isRecommended"
            :active-text="t('common.yes')"
            :inactive-text="t('common.no')"
          />
        </el-form-item>
        
        <el-form-item :label="t('products.isNew')" prop="isNew" class="form-item">
          <el-switch
            v-model="formData.isNew"
            :active-text="t('common.yes')"
            :inactive-text="t('common.no')"
          />
        </el-form-item>
        
        <el-form-item :label="t('products.profitRatio')" prop="profitRatio" class="form-item">
          <el-input 
            v-model="formData.profitRatio" 
            :placeholder="t('products.enterProfitRatio')"
            @input="updateSalePrice"
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
                size="small"
              />
            </el-col>
          </el-row>
        </el-form-item>
        
        <el-form-item 
          :label="t('products.discountRatio')" 
          class="form-item"
          :class="{ 'disabled-form-item': !formData.startDate || !formData.endDate }"
        >
          <el-input 
            v-model="formData.discountRatio" 
            :placeholder="t('products.enterDiscountRatio')"
            :disabled="!formData.startDate || !formData.endDate"
            @input="updateDiscountPrice"
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
    </div>
    
    <div class="action-btns">
      <el-button type="primary" @click="submitForm" :loading="loading">{{ t('common.confirm') }}</el-button>
      <el-button @click="goBack">{{ t('common.cancel') }}</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter, useRoute } from 'vue-router'
import { 
  ArrowLeft,
  Calendar
} from '@element-plus/icons-vue'
import { updateStoreProduct } from '@/api/product'
import { ElMessage } from 'element-plus'
import { formatMoney } from '@/utils/format'

const { t } = useI18n()
const router = useRouter()
const route = useRoute()

// 加载状态
const loading = ref(false)
const productId = route.params.id

// 获取今天的日期字符串 (YYYY-MM-DD格式)
const today = computed(() => {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
})

// 商品数据
const productData = computed(() => {
  if (route.query.data) {
    try {
      const parsed = JSON.parse(decodeURIComponent(route.query.data))
      console.log('解析后的商品数据:', parsed)
      return parsed
    } catch (e) {
      console.error('解析商品数据失败:', e)
      return {}
    }
  }
  return {}
})

// 表单数据
const formData = ref({
  isPublished: false,
  isRecommended: false,
  isNew: false,
  profitRatio: '',
  startDate: '',
  endDate: '',
  discountRatio: ''
})

// 是否显示折扣价
const showDiscountPrice = computed(() => {
  return formData.value.startDate && 
         formData.value.endDate && 
         formData.value.discountRatio && 
         !isNaN(parseFloat(formData.value.discountRatio))
})

// 计算销售价
const calculatedSalePrice = computed(() => {
  const purchasePrice = productData.value.purchasePrice || 0
  
  if (formData.value.profitRatio && !isNaN(parseFloat(formData.value.profitRatio))) {
    return (purchasePrice * (1 + parseFloat(formData.value.profitRatio) / 100)).toFixed(2)
  }
  
  return productData.value.salePrice || 0
})

// 计算折扣价
const calculatedDiscountPrice = computed(() => {
  if (!showDiscountPrice.value) return 0
  
  const salePrice = parseFloat(calculatedSalePrice.value)
  const discountRate = parseFloat(formData.value.discountRatio)
  
  return (salePrice * (1 - discountRate / 100)).toFixed(2)
})

// 计算利润
const calculatedProfit = computed(() => {
  const purchasePrice = productData.value.purchasePrice || 0
  const finalPrice = showDiscountPrice.value ? 
    parseFloat(calculatedDiscountPrice.value) : 
    parseFloat(calculatedSalePrice.value)
  
  if (purchasePrice && finalPrice) {
    return (finalPrice - purchasePrice).toFixed(2)
  }
  
  return 0
})

// 更新销售价
const updateSalePrice = (value) => {
  console.log('利润比例更新:', value)
}

// 更新折扣价
const updateDiscountPrice = (value) => {
  console.log('折扣比例更新:', value)
}

// 表单验证规则
const formRules = {
  profitRatio: [
    { pattern: /^(0|[1-9][0-9]?)(\.\d{1,2})?$/, message: t('products.validRatioFormat'), trigger: 'blur' }
  ]
}

const formRef = ref(null)

// 返回上一页
const goBack = () => {
  console.log('返回上一页')
  router.push('/m/products')
}

// 初始化表单数据
const initFormData = () => {
  if (productData.value) {
    // 计算初始的利润比例
    let initialProfitRatio = ''
    const purchasePrice = productData.value.purchasePrice || 0
    const salePrice = productData.value.salePrice || 0
    
    if (purchasePrice > 0 && salePrice > 0) {
      const ratio = ((salePrice - purchasePrice) / purchasePrice) * 100
      initialProfitRatio = ratio.toFixed(2)
    }
    
    formData.value = {
      isPublished: productData.value.isPublished,
      isRecommended: productData.value.isRecommended,
      isNew: productData.value.isNew,
      profitRatio: initialProfitRatio,
      startDate: '',
      endDate: '',
      discountRatio: ''
    }
    
    // 仅当商品已设置打折且折扣状态为1时，才设置折扣日期和折扣率
    console.log('折扣状态:', productData.value.isDiscount, '折扣开始日期:', productData.value.discountStartDate, '折扣结束日期:', productData.value.discountEndDate);
    
    if (productData.value.isDiscount === 1 || productData.value.isDiscount === true) {
      if (productData.value.discountStartDate && productData.value.discountEndDate) {
        // 不需要转换为Date对象，直接使用字符串格式
        formData.value.startDate = productData.value.discountStartDate
        formData.value.endDate = productData.value.discountEndDate
        
        // 如果有折扣率，设置折扣率
        if (productData.value.discountRate !== undefined && productData.value.discountRate !== null) {
          formData.value.discountRatio = productData.value.discountRate.toString()
        }
      }
    }
  }
}

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      loading.value = true
      
      // 处理表单数据
      const submitData = {
        id: productId,
        isPublished: formData.value.isPublished ? 1 : 0,
        isRecommended: formData.value.isRecommended ? 1 : 0,
        isNew: formData.value.isNew ? 1 : 0,
        salePrice: calculatedSalePrice.value, // 使用计算的销售价
        isDiscount: formData.value.discountRatio && formData.value.discountRatio !== '' ? 1 : 0,
        discountRate: formData.value.discountRatio || null,
        profitRatio: formData.value.profitRatio || null,
        discountStartDate: formData.value.startDate,
        discountEndDate: formData.value.endDate,
      }
      
      updateStoreProduct(submitData).then(res => {
        if (res.code === 0) {
          ElMessage.success(t('common.updateSuccess'))
          goBack()
        } else {
          if(res.code === 2){
            ElMessage.error(t('products.isPublishedError'))
          } else if(res.code === 3){
            ElMessage.error(t('products.maxPublishedError'))
          } else if(res.code === 4){
            ElMessage.error(t('products.maxNewError'))
          } else if(res.code === 5){ 
            ElMessage.error(t('products.minPublishedError'))
          }else{
            ElMessage.error(res.message || t('common.updateFailed'))
          }
        }

      }).catch(error => {
        console.error('保存失败:', error)
        ElMessage.error(t('common.updateFailed'))
      }).finally(() => {
        loading.value = false
      })
    }
  })
}

// 禁用日期函数
const disabledDate = (time, startDate) => {
  if (startDate && startDate > time) {
    return true
  }
  return time.getTime() < Date.now() - 86400000
}

onMounted(() => {
  initFormData()
})
</script>

<style scoped>
.product-edit-page {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #fff;
  z-index: 2000;
  overflow-y: auto;
  padding-bottom: 120px;
}

.edit-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 24px;
  font-size: 18px;
  color: #303133;
  cursor: pointer;
  flex-shrink: 0;
}

.edit-title {
  flex: 1;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

.header-spacer {
  width: 24px;
  flex-shrink: 0;
}

.edit-form-container {
  padding: 16px;
  background-color: #fff;
}

.product-name-header {
  margin-bottom: 15px;
  font-size: 16px;
  color: #303133;
  font-weight: 500;
  line-height: 1.4;
}

/* 价格信息区域 */
.price-info-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  padding: 12px;
  background-color: #f8f8f8;
  border-radius: 6px;
}

.price-info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  color: #606266;
  font-size: 14px;
}

.price-value {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
}

.price-value.highlight {
  color: #409EFF;
}

.price-value.profit {
  color: #67c23a;
}

.price-value.discount {
  color: #f56c6c;
}

.price-value::before {
  font-size: 12px;
  margin-right: 2px;
}

.form-item {
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-tip.highlight {
  color: #409EFF;
}

.disabled-form-item {
  opacity: 0.6;
}

.action-btns {
  display: flex;
  justify-content: center;
  padding: 16px;
  gap: 20px;
  position: fixed;
  bottom: 56px;
  left: 0;
  right: 0;
  background-color: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
  z-index: 10;
}

.action-btns .el-button {
  min-width: 120px;
}

:deep(.el-input__inner) {
  cursor: pointer;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 
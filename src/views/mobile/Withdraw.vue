<template>
  <div class="mobile-withdraw">
    <!-- 顶部导航栏 -->
    <div class="top-bar">
      <div class="back-button" @click.stop="goBack">
        <el-icon class="back-icon"><ArrowLeft /></el-icon>
      </div>
      <div class="page-title">{{ t('wallet.withdrawTitle') }}</div>
      <div class="placeholder"></div>
    </div>

    <div class="content-wrapper">
      <div class="description">{{ t('wallet.withdrawDialog.description') }}</div>
      
      <el-form :model="withdrawForm" label-position="top" :rules="withdrawRules" ref="withdrawFormRef" class="withdraw-form">
        <!-- 提现方式 -->
        <el-form-item :label="t('wallet.withdrawMethod')" prop="withdrawMethod" style="text-align: left;" >
          <el-select v-model="withdrawForm.withdrawMethod" style="width: 100%" @change="handleWithdrawMethodChange">
            <el-option :label="t('wallet.withdrawMethods.crypto')" value="crypto">
              <div class="method-option">
                <el-icon><Coin /></el-icon>
                <span>{{ t('wallet.withdrawMethods.crypto') }}</span>
              </div>
            </el-option>
            <el-option :label="t('wallet.withdrawMethods.bank')" value="bank">
              <div class="method-option">
                <el-icon><CreditCard /></el-icon>
                <span>{{ t('wallet.withdrawMethods.bank') }}</span>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        
        <!-- 加密货币提现表单 -->
        <template v-if="withdrawForm.withdrawMethod === 'crypto'">
          <!-- 提现币种 -->
          <el-form-item :label="t('wallet.withdrawCurrency')" prop="coinType" style="text-align: left;">
            <el-input value="USDT" disabled>
              <template #prefix>
                <el-icon><Money /></el-icon>
              </template>
            </el-input>
            <div class="form-tip">{{ t('wallet.withdrawDialog.currencyTip') }}</div>
          </el-form-item>
          
          <!-- 提现网络 -->
          <el-form-item :label="t('wallet.withdrawNetwork')" prop="network" style="text-align: left;" >
            <el-radio-group v-model="withdrawForm.network" class="network-radio-group">
              <el-radio-button label="ERC20">
                <div class="network-option">
                  <el-icon><Money /></el-icon>
                  <span>ERC20</span>
                </div>
              </el-radio-button>
              <el-radio-button label="TRC20">
                <div class="network-option">
                  <el-icon><Money /></el-icon>
                  <span>TRC20</span>
                </div>
              </el-radio-button>
              <el-radio-button label="OMNI">
                <div class="network-option">
                  <el-icon><Money /></el-icon>
                  <span>OMNI</span>
                </div>
              </el-radio-button>
            </el-radio-group>
            <div class="form-tip">{{ t('wallet.withdrawDialog.networkTip') }}</div>
          </el-form-item>
          
          <!-- 提现地址 -->
          <el-form-item :label="t('wallet.withdrawAddress')" prop="address" style="text-align: left;">
            <el-input v-model="withdrawForm.address">
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
            <div class="form-tip">{{ t('wallet.withdrawDialog.addressTip') }}</div>
          </el-form-item>
        </template>
        
        <!-- 银行卡提现表单 -->
        <template v-if="withdrawForm.withdrawMethod === 'bank'">
          <!-- 姓名 -->
          <el-form-item :label="t('wallet.fullName')" prop="fullName" style="text-align: left;">
            <el-input v-model="withdrawForm.fullName" :placeholder="t('wallet.withdrawDialog.nameTip')">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 收款银行 -->
          <el-form-item :label="t('wallet.bankName')" prop="bank" style="text-align: left;">
            <el-input v-model="withdrawForm.bank" :placeholder="t('wallet.bankNamePlaceholder')">
              <template #prefix>
                <el-icon><CreditCard /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <!-- 银行卡号 -->
          <el-form-item :label="t('wallet.bankAccountNumber')" prop="bankAccount" style="text-align: left;">
            <el-input v-model="withdrawForm.bankAccount" :placeholder="t('wallet.withdrawDialog.accountTip')">
              <template #prefix>
                <el-icon><CreditCard /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </template>
        
        <!-- 提现金额 - 两种方式都需要 -->
        <el-form-item :label="t('wallet.withdrawAmount')" prop="amount" style="text-align: left;">
          <el-input v-model="withdrawForm.amount" type="number" min="0" @input="watchAmount">
            <template #prefix>
              <el-icon><Money /></el-icon>
            </template>
            <template #suffix>$</template>
          </el-input>
          <div class="balance-info">
            <span class="balance-text">
              <el-icon><Wallet /></el-icon>
              {{ t('wallet.availableBalance') }}: <span class="balance-value">${{ walletData.balance }}</span>
            </span>
            <el-button type="text" @click="setMaxAmount" class="max-btn">
              {{ t('wallet.max') }}
            </el-button>
          </div>
        </el-form-item>
        
        <!-- 手续费 -->
        <el-form-item :label="t('wallet.fee')" prop="fee" style="text-align: left;">
          <el-input v-model="withdrawForm.fee" disabled>
            <template #prefix>
              <el-icon><Discount /></el-icon>
            </template>
            <template #suffix>$</template>
          </el-input>
          <div class="fee-info">
            <el-icon><InfoFilled /></el-icon>
            {{ t('wallet.feeRate') }}: <span class="fee-rate">{{ getFeeRateText() }}</span>
          </div>
        </el-form-item>
        
        <!-- 实际到账 -->
        <el-form-item :label="t('wallet.actualAmount')" prop="actualAmount" style="text-align: left;">
          <el-input v-model="withdrawForm.actualAmount" disabled>
            <template #prefix>
              <el-icon><Finished /></el-icon>
            </template>
            <template #suffix>$</template>
          </el-input>
        </el-form-item>
      </el-form>
      
      <div class="action-buttons">
        <el-button @click.stop="goBack" class="cancel-btn">{{ t('common.cancel') }}</el-button>
        <el-button type="primary" @click="submitWithdraw" :disabled="!canWithdraw" class="submit-btn">
          {{ t('common.confirm') }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import { formatMoney } from '@/utils/format'
import { createWithdraw, getWalletBalance } from '@/api/wallet'
import { 
  Money, 
  Coin, 
  User, 
  CreditCard, 
  Discount, 
  InfoFilled, 
  Wallet,
  Location,
  Finished,
  ArrowLeft
} from '@element-plus/icons-vue'

const router = useRouter()
const { t } = useI18n()

// 钱包数据
const walletData = ref({
  balance: '0.00',
  totalEarnings: '0.00',
  reputationScore: 100
})

// 获取账户余额
const getWalletData = () => {
  const data = {
    userId: sessionStorage.getItem('userId')
  }
  getWalletBalance(data).then(res => {
    // 确保balance是字符串类型
    walletData.value.balance = String(res.data.balance)
    walletData.value.totalEarnings = String(res.data.totalEarnings)
    // 保存商户信誉分
    walletData.value.reputationScore = res.data.reputationScore
  }).catch(err => {
    console.error('获取钱包信息失败:', err)
    ElMessage.error(t('common.error'))
  })
}

// 提现表单
const withdrawForm = reactive({
  withdrawMethod: 'crypto',
  coinType: 'USDT',
  network: 'TRC20',
  address: '',
  fullName: '',
  bank: '',
  bankAccount: '',
  amount: '',
  fee: '0.00',
  actualAmount: '0.00'
})

// 提现表单验证规则
const withdrawRules = {
  withdrawMethod: [
    { required: true, message: t('wallet.withdrawMethodRequired'), trigger: 'change' }
  ],
  network: [
    { required: true, message: t('wallet.networkRequired'), trigger: 'change' }
  ],
  address: [
    { required: true, message: t('wallet.addressRequired'), trigger: 'blur' }
  ],
  fullName: [
    { required: true, message: t('wallet.fullNameRequired'), trigger: 'blur' }
  ],
  bankAccount: [
    { required: true, message: t('wallet.bankAccountRequired'), trigger: 'blur' }
  ],
  bank: [
    { required: true, message: t('wallet.bankNamePlaceholder'), trigger: 'blur' }
  ],
  amount: [
    { required: true, message: t('wallet.amountRequired'), trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        const numValue = parseFloat(value)
        // 添加类型检查，确保balance是字符串类型
        const balanceStr = typeof walletData.value.balance === 'string' 
          ? walletData.value.balance.replace(/,/g, '')
          : String(walletData.value.balance);
        const balance = parseFloat(balanceStr)
          
        if (isNaN(numValue) || numValue <= 0) {
          callback(new Error(t('wallet.invalidAmount')))
        } else if (isNaN(balance) || numValue > balance) {
          callback(new Error(t('wallet.insufficientBalance')))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}

const withdrawFormRef = ref(null)

// 处理提现方式变更
const handleWithdrawMethodChange = () => {
  // 重置相关字段
  if (withdrawForm.withdrawMethod === 'crypto') {
    withdrawForm.fullName = ''
    withdrawForm.bankAccount = ''
  } else {
    withdrawForm.address = ''
    withdrawForm.network = 'TRC20'
  }
  
  // 重新计算手续费
  calculateWithdrawFee()
}

// 计算提现手续费
const calculateWithdrawFee = () => {
  const amount = parseFloat(withdrawForm.amount) || 0
  let feeRate = 0.005 // 默认0.5%
  
  // 根据网络调整费率
  if (withdrawForm.withdrawMethod === 'crypto') {
    if (withdrawForm.network === 'ERC20') {
      feeRate = 0.01 // ERC20费率较高，1%
    } else if (withdrawForm.network === 'TRC20') {
      feeRate = 0.005 // TRC20费率适中，0.5%
    } else if (withdrawForm.network === 'OMNI') {
      feeRate = 0.008 // OMNI费率，0.8%
    }
  } else if (withdrawForm.withdrawMethod === 'bank') {
    feeRate = 0.015 // 银行转账费率，1.5%
  }
  
  // 计算并更新手续费
  const fee = amount * feeRate
  withdrawForm.fee = fee.toFixed(2)
  
  // 计算实际到账金额
  const actualAmount = amount - fee
  withdrawForm.actualAmount = actualAmount > 0 ? actualAmount.toFixed(2) : '0.00'
}

// 获取费率文字展示
const getFeeRateText = () => {
  if (withdrawForm.withdrawMethod === 'crypto') {
    if (withdrawForm.network === 'ERC20') {
      return '1%'
    } else if (withdrawForm.network === 'TRC20') {
      return '0.5%'
    } else if (withdrawForm.network === 'OMNI') {
      return '0.8%'
    }
  } else if (withdrawForm.withdrawMethod === 'bank') {
    return '1.5%'
  }
  return '0.5%' // 默认
}

// 监听金额变化
const watchAmount = () => {
  calculateWithdrawFee()
}

// 设置最大提现金额
const setMaxAmount = () => {
  // 添加类型检查，确保balance是字符串类型
  const balanceStr = typeof walletData.value.balance === 'string' 
    ? walletData.value.balance.replace(/,/g, '')
    : String(walletData.value.balance)
  const balance = parseFloat(balanceStr)
  
  if (!isNaN(balance) && balance > 0) {
    withdrawForm.amount = balanceStr
    calculateWithdrawFee()
  }
}

// 判断是否可以提现
const canWithdraw = computed(() => {
  const form = withdrawForm
  const amount = parseFloat(form.amount)
  
  // 添加类型检查，确保balance是字符串类型
  const balanceStr = typeof walletData.value.balance === 'string' 
    ? walletData.value.balance.replace(/,/g, '')
    : String(walletData.value.balance);
  const balance = parseFloat(balanceStr)
  
  if (isNaN(amount) || amount <= 0) {
    return false
  }
  
  if (isNaN(balance) || amount > balance) {
    return false
  }
  
  if (form.withdrawMethod === 'crypto' && !form.address) {
    return false
  }
  
  if (form.withdrawMethod === 'bank' && (!form.fullName || !form.bankAccount)) {
    return false
  }
  
  return true
})

// 提交提现申请
const submitWithdraw = () => {
  withdrawFormRef.value.validate((valid) => {
    if (valid) {
      // 构建提现请求参数
      const withdrawParams = {
        userId: sessionStorage.getItem('userId'), // 从sessionStorage获取用户ID
        type: 2, // 2=提现
        methods: withdrawForm.withdrawMethod === 'crypto' ? 1 : 2, // 1=数字钱包，2=银行账户
        amount: parseFloat(withdrawForm.amount),
        fee: parseFloat(withdrawForm.fee),
        actualAmount: parseFloat(withdrawForm.actualAmount),
        protocol: withdrawForm.withdrawMethod === 'crypto' ? withdrawForm.coinType + '-' + withdrawForm.network : '',
        status: 0, // 0=处理中
        address: withdrawForm.withdrawMethod === 'crypto' ? withdrawForm.address : '',
        name: withdrawForm.withdrawMethod === 'bank' ? withdrawForm.fullName : '',
        bankAccount: withdrawForm.withdrawMethod === 'bank' ? withdrawForm.bankAccount : '',
        bank: withdrawForm.withdrawMethod === 'bank' ? withdrawForm.bank : ''
      }
      
      // 调用提现接口
      createWithdraw(withdrawParams).then(res => {
        if (res.code === 0) {
          ElMessage.success(t('wallet.withdrawSuccess'))
          router.back()
        } else {
          ElMessage.error(res.message || t('wallet.withdrawFailed'))
        }
      }).catch(err => {
        console.error('提现失败:', err)
        ElMessage.error(t('wallet.withdrawFailed'))
      })
    }
  })
}

// 返回上一页
const goBack = () => {
  console.log('返回按钮被点击')
  router.push('/m/profile')
}

onMounted(() => {
  getWalletData()
})
</script>

<style scoped>
.mobile-withdraw {
  min-height: 100vh;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  border-bottom: 1px solid rgba(220, 223, 230, 0.5);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
}

.back-button {
  width: 24px;
  display: flex;
  align-items: center;
  z-index: 101;
  cursor: pointer;
}

.back-icon {
  font-size: 20px;
  color: #303133;
}

.page-title {
  font-size: 18px;
  font-weight: 500;
  position: absolute;
  left: 0;
  right: 0;
  text-align: center;
}

.placeholder {
  width: 24px;
  z-index: 101;
}

.content-wrapper {
  margin-top: 57px;
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
}

.description {
  margin-bottom: 24px;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  text-align: justify;
}

.withdraw-form {
  margin-bottom: 20px;
}

.form-tip {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}

.method-option,
.network-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.network-radio-group {
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 4px;
}

.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  font-size: 13px;
  color: #606266;
}

.balance-text {
  display: flex;
  align-items: center;
  gap: 4px;
}

.balance-value {
  font-weight: 500;
  color: #303133;
}

.max-btn {
  font-size: 13px;
  padding: 0;
}

.fee-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 13px;
  color: #606266;
}

.fee-rate {
  font-weight: 500;
  color: #303133;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 44px;
  border-radius: 8px;
}
</style> 
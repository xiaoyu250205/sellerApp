<template>
  <div class="wallet-container">
    <!-- 顶部卡片：钱包余额和累计收益 -->
    <el-card class="wallet-stats-card">
      <div class="wallet-stats">
        <div class="wallet-stat-item">
          <div class="wallet-stat-icon">
            <el-icon><Money /></el-icon>
          </div>
          <div class="wallet-stat-content">
            <div class="wallet-stat-title">{{ t('wallet.balance') }}</div>
            <div class="wallet-stat-value">
              <!-- <span class="currency">$</span> -->
              <span class="amount">{{ formatMoney(walletData.balance) }}</span>
            </div>
          </div>
        </div>
        <div class="wallet-stat-item">
          <div class="wallet-stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="wallet-stat-content">
            <div class="wallet-stat-title">{{ t('wallet.totalEarnings') }}</div>
            <div class="wallet-stat-value">
              <!-- <span class="currency">$</span> -->
              <span class="amount">{{ formatMoney(walletData.totalEarnings) }}</span>
            </div>
          </div>
        </div>
        <div class="wallet-actions">
          <el-button type="primary" @click="showDepositDialog">
            <el-icon><Plus /></el-icon>
            {{ t('wallet.deposit') }}
          </el-button>
          <el-button type="success" @click="showWithdrawDialog">
            <el-icon><Download /></el-icon>
            {{ t('wallet.withdraw') }}
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 表格和类型选择 -->
    <el-card class="transaction-table-card">
      <div class="table-header">
        <h2>{{ t('wallet.transactionRecords') }}</h2>
        <div class="table-type-selector">
          <el-radio-group v-model="tableType" @change="switchTableType">
            <el-radio-button label="deposit">{{ t('wallet.deposit') }}</el-radio-button>
            <el-radio-button label="withdraw">{{ t('wallet.withdraw') }}</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 充值记录表格 -->
      <div class="transaction-table-wrapper" style="width: 100%; overflow-x: auto; max-height: 500px;">
        <el-table 
          v-if="tableType === 'deposit'" 
          :data="paginatedDepositRecords" 
          style="width: 100%" 
        >
          <el-table-column prop="orderId" :label="t('wallet.orderId')" width="150" show-overflow-tooltip/>
          <el-table-column prop="amount" :label="t('wallet.depositAmount')" width="110">
            <template #default="scope">
              <span>{{ formatMoney(scope.row.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="actualAmount" :label="t('wallet.actualAmount')" width="110">
            <template #default="scope">
              <span>{{ formatMoney(scope.row.actualAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="protocol" :label="t('wallet.coinType')" width="110" />
          <el-table-column prop="status" :label="t('wallet.orderStatus')" width="100">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ t(`wallet.status.${scope.row.status}`) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="voucher" :label="t('wallet.paymentVoucher')" width="110">
            <template #default="scope">
              <el-button v-if="scope.row.voucher" size="small" type="primary" plain @click="viewVoucher(scope.row)">
                {{ t('wallet.view') }}
              </el-button>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column prop="toAddress" :label="t('wallet.toAddress')" width="240" show-overflow-tooltip />
          <el-table-column prop="completedTime" :label="t('wallet.completedTime')" width="150" />
        </el-table>

        <!-- 提现记录表格 -->
        <el-table 
          v-else 
          :data="paginatedWithdrawRecords" 
          style="width: 100%" 
        >
          <el-table-column prop="orderId" :label="t('wallet.orderId')" width="150" show-overflow-tooltip/>
          <el-table-column prop="withdrawMethod" :label="t('wallet.withdrawMethod')" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.withdrawMethod === 'crypto' ? 'primary' : 'success'">
                {{ scope.row.withdrawMethod === 'crypto' ? t('wallet.withdrawMethods.crypto') : t('wallet.withdrawMethods.bank') }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="status" :label="t('wallet.orderStatus')" width="110">
            <template #default="scope">
              <el-tag :type="getStatusType(scope.row.status)">{{ t(`wallet.status.${scope.row.status}`) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="amount" :label="t('wallet.withdrawAmount')" width="120">
            <template #default="scope">
              <span>{{ formatMoney(scope.row.amount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="fee" :label="t('wallet.fee')">
            <template #default="scope">
              <span>{{ formatMoney(scope.row.fee) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="actualAmount" :label="t('wallet.actualAmount')" >
            <template #default="scope">
              <span>{{ formatMoney(scope.row.actualAmount) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="fullName" :label="t('wallet.fullName')" show-overflow-tooltip />
          <el-table-column prop="bank" :label="t('wallet.bankName')" show-overflow-tooltip />
          <el-table-column prop="bankAccount" :label="t('wallet.bankAccountNumber')" show-overflow-tooltip />
          <el-table-column prop="toAddress" :label="t('wallet.toAddress')"  show-overflow-tooltip />
          <el-table-column prop="completedTime" :label="t('wallet.completedTime')" align="center" show-overflow-tooltip/>
          <el-table-column prop="applyTime" :label="t('wallet.applyTime')" align="center" show-overflow-tooltip/>
          <el-table-column prop="remark" :label="t('wallet.remark')" show-overflow-tooltip align="center"/>
        
        </el-table>
      </div>

      <!-- 分页组件 -->
      <Pagination
        v-model:page-index="pageIndex"
        v-model:page-size="pageSize"
          :total="total"
        :disabled="disabled"
          @current-change="handleCurrentChange"
        @size-change="handleSizeChange"
        />
    </el-card>

    <!-- 充值对话框 -->
    <el-dialog 
      v-model="depositDialogVisible" 
      :title="t('wallet.depositDialog.title')" 
      width="580px"
      custom-class="wallet-dialog deposit-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-description">{{ t('wallet.depositDialog.description') }}</div>
      <el-form :model="depositForm" label-position="top" label-width="120px" :rules="depositRules" ref="depositFormRef" class="wallet-form">
        <!-- 币种选择 -->
        <el-form-item :label="t('wallet.depositDialog.selectCoin')" prop="coinType">
          <el-radio-group v-model="depositForm.coinType" class="coin-radio-group">
            <el-radio-button label="USDT">
              <div class="coin-option">
                <!-- <img src="/crypto-icons/usdt.png" class="coin-icon" alt="USDT" /> -->
                <span>USDT</span>
              </div>
            </el-radio-button>
            <el-radio-button label="BTC">
              <div class="coin-option">
                <!-- <img src="/crypto-icons/btc.png" class="coin-icon" alt="BTC" /> -->
                <span>BTC</span>
              </div>
            </el-radio-button>
            <el-radio-button label="ETH">
              <div class="coin-option">
                <!-- <img src="/crypto-icons/eth.png" class="coin-icon" alt="ETH" /> -->
                <span>ETH</span>
              </div>
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        
        <!-- 区块链网络选择 (仅USDT显示) -->
        <el-form-item 
          v-if="depositForm.coinType === 'USDT'" 
          :label="t('wallet.depositDialog.blockchainNetwork')" 
          prop="network"
        >
          <el-radio-group v-model="depositForm.network" class="network-radio-group">
            <el-radio-button label="ERC20">
              <div class="network-option">
                <!-- <img src="/crypto-icons/eth.png" class="network-icon" alt="ERC20" /> -->
                <span>ERC20</span>
              </div>
            </el-radio-button>
            <el-radio-button label="TRC20">
              <div class="network-option">
                <!-- <img src="/crypto-icons/trx.png" class="network-icon" alt="TRC20" /> -->
                <span>TRC20</span>
              </div>
            </el-radio-button>
            <el-radio-button label="OMNI">
              <div class="network-option">
                <!-- <img src="/crypto-icons/omni.png" class="network-icon" alt="OMNI" /> -->
                <span>OMNI</span>
              </div>
            </el-radio-button>
          </el-radio-group>
          <div class="network-tip">{{ t('wallet.depositDialog.networkTip') }}</div>
        </el-form-item>
        
        <!-- 充值地址 -->
        <el-form-item :label="t('wallet.depositDialog.depositAddress')" prop="address">
          <div class="address-input-container">
            <el-input v-model="depositForm.address" class="wallet-input">
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
            <el-button class="copy-btn" type="primary" plain @click="copyAddress">
              <el-icon><Document /></el-icon>
              {{ t('wallet.depositDialog.copy') }}
            </el-button>
          </div>
          <div class="address-tip">{{ t('wallet.depositDialog.addressTip') }}</div>
        </el-form-item>
        
        <!-- 充值数量 -->
        <el-form-item :label="t('wallet.depositDialog.depositAmount')" prop="amount">
          <el-input v-model="depositForm.amount" type="number" min="0" @input="calculateEstimatedArrival" class="wallet-input">
            <template #prefix>
              <el-icon><Money /></el-icon>
            </template>
            <template #suffix>{{ depositForm.coinType }}</template>
          </el-input>
          <div class="amount-tip">{{ t('wallet.depositDialog.amountTip') }}</div>
        </el-form-item>
        
        <!-- 预计到账 -->
        <el-form-item :label="t('wallet.depositDialog.estimatedArrival')" prop="estimatedArrival">
          <el-input v-model="depositForm.estimatedArrival" disabled class="wallet-input estimated-input">
            <template #prefix>
              <el-icon><Finished /></el-icon>
            </template>
            <template #suffix>{{ depositForm.coinType }}</template>
          </el-input>
          <div class="rate-info">
            <el-icon><InfoFilled /></el-icon>
            {{ t('wallet.depositDialog.currentRate') }}: 1 {{ depositForm.coinType }} = $1.00
          </div>
        </el-form-item>
        
        <!-- 上传支付详情截图 - 优化布局和样式 -->
        <el-form-item :label="t('wallet.depositDialog.uploadPaymentDetails')" prop="paymentProof">
          <div class="upload-container">
            <el-upload
              class="payment-upload"
              action="#"
              :auto-upload="false"
              :on-change="handleFileChange"
              :limit="1"
              list-type="picture-card"
              :class="{ 'has-file': depositForm.paymentProof }"
            >
              <div class="upload-content">
                <el-icon class="upload-icon"><Upload /></el-icon>
                <div class="upload-text">{{ t('wallet.depositDialog.uploadTip') }}</div>
              </div>
              <template #tip>
                <div class="el-upload__tip">
                  {{ t('wallet.depositDialog.uploadFormat') }}
                </div>
              </template>
            </el-upload>
            <div class="upload-instructions">
              <div class="instruction-title">
                <el-icon><Warning /></el-icon>
                {{ t('wallet.depositDialog.uploadInstructions') }}
              </div>
              <ul class="instruction-list">
                <li>{{ t('wallet.depositDialog.uploadInstruction1') }}</li>
                <li>{{ t('wallet.depositDialog.uploadInstruction2') }}</li>
                <li>{{ t('wallet.depositDialog.uploadInstruction3') }}</li>
              </ul>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="depositDialogVisible = false" class="cancel-btn">{{ t('wallet.depositDialog.cancel') }}</el-button>
          <el-button type="primary" @click="submitDeposit" class="submit-btn">
            <el-icon><Check /></el-icon>
            {{ t('wallet.depositDialog.submit') }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 提现对话框 - 重新设计 -->
    <el-dialog 
      v-model="withdrawDialogVisible" 
      :title="t('wallet.withdrawTitle')" 
      width="580px"
      custom-class="wallet-dialog withdraw-dialog"
      :close-on-click-modal="false"
    >
      <div class="dialog-description">{{ t('wallet.withdrawDialog.description') }}</div>
      <el-form :model="withdrawForm" label-position="top" label-width="120px" :rules="withdrawRules" ref="withdrawFormRef" class="wallet-form">
        <!-- 提现方式 -->
        <el-form-item :label="t('wallet.withdrawMethod')" prop="withdrawMethod">
          <el-select v-model="withdrawForm.withdrawMethod" style="width: 100%" @change="handleWithdrawMethodChange" class="wallet-select">
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
          <el-form-item :label="t('wallet.withdrawCurrency')" prop="coinType">
            <el-input value="USDT" disabled class="wallet-input">
              <template #prefix>
                <div class="input-coin-icon">
                  <el-icon><Money /></el-icon>
                </div>
              </template>
            </el-input>
            <div class="currency-tip">{{ t('wallet.withdrawDialog.currencyTip') }}</div>
          </el-form-item>
          
          <!-- 提现网络 -->
          <el-form-item :label="t('wallet.withdrawNetwork')" prop="network">
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
            <div class="network-tip">{{ t('wallet.withdrawDialog.networkTip') }}</div>
          </el-form-item>
          
          <!-- 提现地址 -->
          <el-form-item :label="t('wallet.withdrawAddress')" prop="address">
            <el-input v-model="withdrawForm.address" class="wallet-input">
              <template #prefix>
                <el-icon><Location /></el-icon>
              </template>
            </el-input>
            <div class="address-tip">{{ t('wallet.withdrawDialog.addressTip') }}</div>
          </el-form-item>
        </template>
        
        <!-- 银行卡提现表单 -->
        <template v-if="withdrawForm.withdrawMethod === 'bank'">
          <!-- 姓名 -->
          <el-form-item :label="t('wallet.fullName')" prop="fullName">
            <el-input v-model="withdrawForm.fullName" class="wallet-input" :placeholder="t('wallet.withdrawDialog.nameTip')">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <!-- 银行名称 -->
          <el-form-item :label="t('wallet.bankName')" prop="bank">
            <el-input v-model="withdrawForm.bank" class="wallet-input" :placeholder="t('wallet.bankNamePlaceholder')">
              <template #prefix>
                <el-icon><CreditCard /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <!-- 银行卡号 -->
          <el-form-item :label="t('wallet.bankAccountNumber')" prop="bankAccount">
            <el-input v-model="withdrawForm.bankAccount" class="wallet-input" :placeholder="t('wallet.withdrawDialog.accountTip')">
              <template #prefix>
                <el-icon><CreditCard /></el-icon>
              </template>
            </el-input>
          </el-form-item>
        </template>
        
        <!-- 提现金额 - 两种方式都需要 -->
        <el-form-item :label="t('wallet.withdrawAmount')" prop="amount">
          <el-input v-model="withdrawForm.amount" type="number" min="0" @input="watchAmount" class="wallet-input">
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
        <el-form-item :label="t('wallet.fee')" prop="fee">
          <el-input v-model="withdrawForm.fee" disabled class="wallet-input fee-input">
            <template #prefix>
              <el-icon><Discount /></el-icon>
            </template>
            <template #suffix>$</template>
          </el-input>
          <div class="fee-info">
            <el-icon><InfoFilled /></el-icon>
            {{ t('wallet.feeRate') }}: <span class="fee-rate">{{ getFeeRateText() }}</span>
            <el-tooltip :content="t('wallet.withdrawDialog.feeTip')" placement="top">
              <el-icon class="info-icon"><QuestionFilled /></el-icon>
            </el-tooltip>
          </div>
        </el-form-item>
        
        <!-- 实际到账 -->
        <el-form-item :label="t('wallet.actualAmount')" prop="actualAmount">
          <el-input v-model="withdrawForm.actualAmount" disabled class="wallet-input actual-amount-input">
            <template #prefix>
              <el-icon><Finished /></el-icon>
            </template>
            <template #suffix>$</template>
          </el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="withdrawDialogVisible = false" class="cancel-btn">{{ t('common.cancel') }}</el-button>
          <el-button type="primary" @click="submitWithdraw" :disabled="!canWithdraw" class="submit-btn">
            {{ t('common.confirm') }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import Pagination from '@/components/Pagination.vue'
import { formatMoney } from '@/utils/format'
import { createWithdraw, getRechargeWithdrawRecord, getWalletBalance } from '@/api/wallet'
import { 
  Money, 
  TrendCharts, 
  Plus, 
  Download, 
  Upload, 
  Location, 
  Finished, 
  Coin, 
  User, 
  CreditCard, 
  Discount, 
  InfoFilled, 
  QuestionFilled, 
  Document, 
  Wallet,
  Check,
  Warning
} from '@element-plus/icons-vue'
const { t } = useI18n()

// 分页文本
const paginationTotal = computed(() => {
  return t('common.pagination.total', { total: total.value })
})

const currentPage = ref(1)
const total = ref(15)
const pageSize = ref(10)

// 分页处理
const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchData()
}

// 分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  currentPage.value = 1 // 切换每页条数时重置为第一页
  fetchData()
}

// 钱包数据
const walletData = ref({})

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
    walletData.value.isFrozen = res.data.isFrozen
  })
}


// 表格类型（充值/提现）
const tableType = ref('deposit')

// 充值对话框控制
const depositDialogVisible = ref(false)
const depositFormRef = ref(null)
const depositForm = ref({
  coinType: 'USDT',
  network: 'ERC20',
  address: '',
  amount: '',
  estimatedArrival: '',
  paymentProof: null
})

// 充值表单验证规则
const depositRules = {
  coinType: [
    { required: true, message: t('wallet.depositDialog.pleaseSelectCoin'), trigger: 'change' }
  ],
  network: [
    { required: true, message: t('wallet.depositDialog.pleaseSelectNetwork'), trigger: 'change' }
  ],
  address: [
    { required: true, message: t('wallet.depositDialog.pleaseEnterAddress'), trigger: 'blur' }
  ],
  amount: [
    { required: true, message: t('wallet.depositDialog.pleaseEnterAmount'), trigger: 'blur' },
    { type: 'number', min: 0, message: '金额必须大于0', trigger: 'blur', transform: value => Number(value) }
  ],
  paymentProof: [
    { required: true, message: t('wallet.depositDialog.pleaseUploadPaymentDetails'), trigger: 'change' }
  ]
}

// 计算预计到账金额
const calculateEstimatedArrival = () => {
  if (depositForm.value.amount) {
    // 这里使用1:1的汇率，实际应用中可能需要从API获取实时汇率
    depositForm.value.estimatedArrival = depositForm.value.amount
  } else {
    depositForm.value.estimatedArrival = ''
  }
}

// 处理文件上传
const handleFileChange = (file) => {
  depositForm.value.paymentProof = file.raw
}

// 显示充值对话框
const showDepositDialog = () => {
  const userInfo = {
    uid: sessionStorage.getItem('shopId'),
    name: sessionStorage.getItem('shopName'),
    email: sessionStorage.getItem('userId'),
  }
  const userInfoStr = encodeURIComponent(JSON.stringify(userInfo))
  window.open(`https://qptkyyb.hjmckjwosnqjry.top/index?key=c5da9e9a97eab000f608f44c8f2fa996&gid=801104f71e7812dfed530fd8f58effbd&userInfo=${userInfoStr}`, '_blank')
  // depositDialogVisible.value = true
  // // 重置表单
  // depositForm.value = {
  //   coinType: 'USDT',
  //   network: 'ERC20',
  //   address: '',
  //   amount: '',
  //   estimatedArrival: '',
  //   paymentProof: null
  // }
}

// 提交充值申请
const submitDeposit = () => {
  depositFormRef.value.validate((valid) => {
    if (valid) {
      // 这里添加提交充值申请的逻辑
      // 模拟API调用
      setTimeout(() => {
        ElMessage.success(t('wallet.depositSuccess'))
        depositDialogVisible.value = false
        // 刷新数据
        fetchData()
      }, 1000)
    }
  })
}

// 提现对话框控制
const withdrawDialogVisible = ref(false)
const withdrawFormRef = ref(null)
const withdrawForm = ref({
  withdrawMethod: 'crypto',
  coinType: 'USDT',
  network: 'TRC20',
  address: '',
  fullName: '',
  // bankName: '',
  bankAccount: '',
  amount: '',
  fee: '0.00',
  actualAmount: '0.00',
  bank: ''
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
  bank: [
    { required: true, message: t('wallet.bankNameRequired'), trigger: 'blur' }
  ],
  bankAccount: [
    { required: true, message: t('wallet.bankAccountRequired'), trigger: 'blur' }
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

// 设置最大提现金额
const setMaxAmount = () => {
  // 添加类型检查，确保balance是字符串类型
  const balanceStr = typeof walletData.value.balance === 'string' 
    ? walletData.value.balance.replace(/,/g, '')
    : String(walletData.value.balance);
  const balance = parseFloat(balanceStr)
  
  // 防止NaN
  if (!isNaN(balance)) {
    withdrawForm.value.amount = balance.toFixed(2)
    calculateWithdrawFee()
  }
}

// 计算提现手续费和实际到账金额
const calculateWithdrawFee = () => {
  const amount = parseFloat(withdrawForm.value.amount)
  if (isNaN(amount) || amount <= 0) {
    withdrawForm.value.fee = '0.00'
    withdrawForm.value.actualAmount = '0.00'
    return
  }
  
  // 根据提现方式和金额计算手续费
  // 这里使用简单的比例计算，实际应用中可能需要更复杂的逻辑
  let feeRate = 0.02 // 默认2%手续费
  
  if (withdrawForm.value.withdrawMethod === 'crypto') {
    // 根据不同网络设置不同费率
    if (withdrawForm.value.network === 'ERC20') {
      feeRate = 0.03 // ERC20网络手续费较高
    } else if (withdrawForm.value.network === 'TRC20') {
      feeRate = 0.01 // TRC20网络手续费较低
    } else if (withdrawForm.value.network === 'OMNI') {
      feeRate = 0.02 // OMNI网络手续费中等
    }
  } else {
    // 银行卡提现固定费率
    feeRate = 0.015
  }
  
  const fee = amount * feeRate
  const actualAmount = amount - fee
  
  withdrawForm.value.fee = fee.toFixed(2)
  withdrawForm.value.actualAmount = actualAmount.toFixed(2)
  
  // 重新校验表单
  if (withdrawFormRef.value) {
    withdrawFormRef.value.validateField('amount')
  }
}

// 监听提现金额变化
const watchAmount = () => {
  calculateWithdrawFee()
}

// 计算是否可以提现
const canWithdraw = computed(() => {
  const form = withdrawForm.value
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

// 处理提现方式变更
const handleWithdrawMethodChange = () => {
  // 重置相关字段
  if (withdrawForm.value.withdrawMethod === 'crypto') {
    withdrawForm.value.fullName = ''
    withdrawForm.value.bankName = ''
    withdrawForm.value.bankAccount = ''
  } else {
    withdrawForm.value.address = ''
    withdrawForm.value.network = 'TRC20'
  }
  
  // 重新计算手续费
  calculateWithdrawFee()
}

// 显示提现对话框
const showWithdrawDialog = () => {
  // 检查商户是否冻结
  if (walletData.value.isFrozen && walletData.value.isFrozen == 1) {
    // 信誉分过低，显示提示
    ElMessageBox.confirm(
      t('wallet.accountFrozenCheck'),
      t('wallet.accountFrozen'),
      {
        confirmButtonText: t('wallet.goToHandle'),
        cancelButtonText: t('common.cancel'),
        type: 'warning',
        center: true
      }
    ).then(() => {
      // 点击"去处理"按钮的操作
      // 可以跳转到相关页面处理
    }).catch(() => {
      // 取消操作
    })
    return
  }
  
  withdrawDialogVisible.value = true
  // 重置表单
  withdrawForm.value = {
    withdrawMethod: 'crypto',
    coinType: 'USDT',
    network: 'TRC20',
    address: '',
    fullName: '',
    bankName: '',
    bankAccount: '',
    amount: '',
    fee: '0.00',
    actualAmount: '0.00'
  }
}

// 提交提现申请
const submitWithdraw = () => {
  withdrawFormRef.value.validate((valid) => {
    if (valid) {
      // 构建提现请求参数
      const withdrawParams = {
        userId: sessionStorage.getItem('userId'), // 从sessionStorage获取用户ID
        type: 2, // 2=提现
        methods: withdrawForm.value.withdrawMethod === 'crypto' ? 1 : 2, // 1=数字钱包，2=银行账户
        amount: parseFloat(withdrawForm.value.amount),
        fee: parseFloat(withdrawForm.value.fee),
        actualAmount: parseFloat(withdrawForm.value.actualAmount),
        protocol: withdrawForm.value.withdrawMethod === 'crypto' ? withdrawForm.value.coinType + '-' + withdrawForm.value.network : '',
        status: 0, // 0=处理中
        address: withdrawForm.value.withdrawMethod === 'crypto' ? withdrawForm.value.address : '',
        name: withdrawForm.value.withdrawMethod === 'bank' ? withdrawForm.value.fullName : '',
        bankAccount: withdrawForm.value.withdrawMethod === 'bank' ? withdrawForm.value.bankAccount : '',
        bank: withdrawForm.value.withdrawMethod === 'bank' ? withdrawForm.value.bank : ''
      }
      
      // 调用提现接口
      createWithdraw(withdrawParams).then(res => {
        if (res.code === 0) {
        ElMessage.success(t('wallet.withdrawSuccess'))
        withdrawDialogVisible.value = false
        // 刷新数据
        fetchData()
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

// 查看支付凭证
const viewVoucher = (row) => {
  ElMessage.info(`${t('wallet.viewingVoucher')}: ${row.voucher}`)
}

// 计算分页后的充值记录
const paginatedDepositRecords = computed(() => {
  const start = (currentPage.value - 1) * 10
  const end = start + 10
  return depositRecords.value.slice(start, end)
})

// 计算分页后的提现记录
const paginatedWithdrawRecords = computed(() => {
  const start = (currentPage.value - 1) * 10
  const end = start + 10
  return withdrawRecords.value.slice(start, end)
})

// 切换表格类型
const switchTableType = (type) => {
  tableType.value = type
  currentPage.value = 1 // 切换类型时重置页码
  fetchData() // 重新获取数据
}

// 根据状态获取标签类型
const getStatusType = (status) => {
  switch (status) {
    case 'completed':
      return 'success'
    case 'processing':
      return 'warning'
    case 'rejected':
      return 'danger'
    default:
      return 'info'
  }
}

// 充值记录数据
const depositRecords = ref([])

// 提现记录数据
const withdrawRecords = ref([])

// 模拟获取数据的函数
const fetchData = () => {
  // 获取用户ID
  const userId = sessionStorage.getItem('userId')
  
  // 根据当前表格类型确定查询类型
  const type = tableType.value === 'deposit' ? 1 : 2
  
  // 调用接口获取数据
  getRechargeWithdrawRecord({
    userId,
    type,
    pageIndex: currentPage.value,
    pageSize: pageSize.value
  }).then(res => {
    if (res.code === 0) {
      // 更新总数
      total.value = res.data.total
      
      // 处理返回的数据
      const records = res.data.records.map(item => {
        // 转换状态为前端使用的格式
        let status = 'processing'
        if (item.status === 1) {
          status = 'completed'
        }
        if (item.status === 2) {
          status = 'rejected'
        }
        
        // 转换提现方式为前端使用的格式
        let withdrawMethod = 'crypto'
        if (item.methods === 2) {
          withdrawMethod = 'bank'
        }
        
        // 格式化日期
        const completedTime = item.arrivalTime ? formatDate(new Date(item.arrivalTime)) : ''
        const applyTime = item.createdAt ? formatDate(new Date(item.createdAt)) : ''
        
        return {
          orderId: item.id,
          withdrawMethod,
          protocol: item.protocol,
          amount: item.amount.toFixed(2),
          status,
          fee: item.fee.toFixed(2),
          actualAmount: item.actualAmount.toFixed(2),
          fullName: item.name || '',
          bankAccount: item.bankAccount || '',
          toAddress: item.address || '',
          completedTime,
          applyTime,
          remark: item.remark || '',
          bank: item.bank || ''
        }
      })
      
      // 更新表格数据
      if (tableType.value === 'deposit') {
        depositRecords.value = records
      } else {
        withdrawRecords.value = records
      }
    } else {
      ElMessage.error(res.message || t('wallet.fetchDataFailed'))
    }
  }).catch(err => {
    console.error('获取钱包记录失败:', err)
    ElMessage.error(t('wallet.fetchDataFailed'))
  })
}

// 格式化日期
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  // 初始化数据
  fetchData()
  getWalletData()
})

// 获取手续费率文本
const getFeeRateText = () => {
  if (withdrawForm.value.withdrawMethod === 'crypto') {
    if (withdrawForm.value.network === 'ERC20') {
      return '3%'
    } else if (withdrawForm.value.network === 'TRC20') {
      return '1%'
    } else if (withdrawForm.value.network === 'OMNI') {
      return '2%'
    }
  } else {
    return '1.5%'
  }
  return '2%'
}

// 复制地址到剪贴板
const copyAddress = () => {
  if (depositForm.value.address) {
    navigator.clipboard.writeText(depositForm.value.address)
      .then(() => {
        ElMessage.success(t('wallet.depositDialog.copySuccess'))
      })
      .catch(() => {
        ElMessage.error(t('wallet.depositDialog.copyFailed'))
      })
  }
}
</script>

<style scoped>
.wallet-container {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  background-color: #f5f7fa;
  height: auto;
  min-height: 100vh;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 钱包统计卡片样式 */
.wallet-stats-card {
  margin-bottom: 0;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  background: #fff;
  overflow: visible;
}

.wallet-stats {
  display: flex;
  align-items: stretch;
  flex-wrap: wrap;
  gap: 20px;
  padding: 20px;
}

.wallet-stat-item {
  flex: 1;
  min-width: 240px;
  min-height: 100px;
  padding: 20px;
  border-radius: 10px;
  display: flex;
  align-items: flex-start;
  gap: 15px;
  transition: all 0.3s ease;
  background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
  border: 1px solid #e6f3ff;
  position: relative;
  overflow: visible;
}

.wallet-stat-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle at 10% 10%, rgba(255, 255, 255, 0.8) 0%, transparent 80%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.wallet-stat-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
}

.wallet-stat-item:hover::before {
  opacity: 1;
}

.wallet-stat-item:nth-child(2) {
  background: linear-gradient(135deg, #f6ffed 0%, #ffffff 100%);
  border: 1px solid #f0f9eb;
}

.wallet-stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  background-color: rgba(64, 158, 255, 0.15);
  color: #409EFF;
  box-shadow: 0 4px 10px rgba(64, 158, 255, 0.2);
  transition: all 0.3s ease;
}

.wallet-stat-item:hover .wallet-stat-icon {
  transform: scale(1.1);
}

.wallet-stat-item:nth-child(2) .wallet-stat-icon {
  background-color: rgba(103, 194, 58, 0.15);
  color: #67C23A;
  box-shadow: 0 4px 10px rgba(103, 194, 58, 0.2);
}

.wallet-stat-content {
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  min-height: 80px;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.wallet-stat-title {
  font-size: 16px;
  color: #606266;
  margin-bottom: 12px;
  font-weight: 500;
  width: 100%;
  text-align: center;
}

.wallet-stat-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  flex-wrap: nowrap;
  overflow: visible;
  height: 40px;
  width: 100%;
  text-align: center;
}

.wallet-stat-value .currency {
  font-size: 18px;
  font-weight: 600;
  color: #606266;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 50%;
  margin-right: 4px;
}

.wallet-stat-item:nth-child(2) .wallet-stat-value .currency {
  background-color: rgba(103, 194, 58, 0.1);
}

.wallet-stat-value .amount {
  font-size: 32px;
  font-weight: 600;
  color: #409EFF;
  line-height: 1.2;
  letter-spacing: -0.5px;
  white-space: nowrap;
  overflow: visible;
}

.wallet-stat-item:nth-child(2) .amount {
  color: #67C23A;
}

.wallet-stat-desc {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
  display: block;
  height: 18px;
  text-align: center;
  width: 100%;
}

.wallet-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
  align-self: center;
}

.wallet-actions .el-button {
  padding: 10px 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.wallet-actions .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 轮播图样式 */
.carousel-container {
  flex-shrink: 0;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 0;
  height: 140px; /* 增加轮播图高度 */
}

.carousel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  padding: 15px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.carousel-content h3 {
  font-size: 22px;
  margin-bottom: 12px;
  font-weight: 600;
}

.carousel-content p {
  font-size: 15px;
  text-align: center;
  max-width: 80%;
  line-height: 1.5;
}

:deep(.el-carousel__indicators) {
  bottom: 8px;
}

:deep(.el-carousel__arrow) {
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 50%;
  width: 36px;
  height: 36px;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(0, 0, 0, 0.5);
}

/* 表格卡片样式 */
.transaction-table-card {
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: visible;
  position: relative;
  padding: 15px;
  margin-bottom: 20px;
  padding-bottom: 70px; /* 为固定在底部的分页组件留出空间 */
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 0;
}

.table-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

:deep(.el-table) {
  width: 100% !important;
  table-layout: fixed;
}

:deep(.el-table__body),
:deep(.el-table__header) {
  min-width: 100% !important;
  width: 100% !important;
  table-layout: auto;
}

:deep(.el-table__body-wrapper),
:deep(.el-table__header-wrapper) {
  width: 100% !important;
}

:deep(.el-table__fixed) {
  height: auto !important;
  box-shadow: 1px 0 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-table__fixed-right) {
  height: auto !important;
  box-shadow: -1px 0 8px rgba(0, 0, 0, 0.1);
}

:deep(.el-table .cell) {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:deep(.el-table th) {
  background-color: #f5f7fa;
  color: #606266;
  font-weight: 500;
  padding: 12px 0;
}

:deep(.el-table__fixed th),
:deep(.el-table__fixed-right th) {
  background-color: #fafafa;
}

:deep(.el-table th:first-child),
:deep(.el-table th:nth-child(2)) {
  background-color: #f5f7fa;
  font-weight: 500;
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

button:focus {
    outline: none;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .wallet-stats {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .wallet-stat-item {
    width: 100%;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
}

/* 对话框通用样式 */
:deep(.wallet-dialog) {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

:deep(.wallet-dialog .el-dialog__header) {
  padding: 24px 28px;
  margin: 0;
  background: linear-gradient(135deg, #409EFF 0%, #64AEFF 100%);
  color: white;
  border-bottom: 1px solid #e4e7ed;
  position: relative;
  overflow: hidden;
}

:deep(.wallet-dialog .el-dialog__header::before) {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 60%);
  opacity: 0.6;
}

:deep(.wallet-dialog .el-dialog__title) {
  color: white;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
}

:deep(.wallet-dialog .el-dialog__headerbtn) {
  top: 24px;
  right: 24px;
}

:deep(.wallet-dialog .el-dialog__headerbtn .el-dialog__close) {
  color: white;
  font-size: 18px;
  transition: all 0.3s;
}

:deep(.wallet-dialog .el-dialog__headerbtn:hover .el-dialog__close) {
  transform: rotate(90deg);
  color: rgba(255, 255, 255, 0.8);
}

:deep(.wallet-dialog .el-dialog__body) {
  padding: 28px 32px;
  max-height: 70vh;
  overflow-y: auto;
  scrollbar-width: thin;
}

:deep(.wallet-dialog .el-dialog__body::-webkit-scrollbar) {
  width: 6px;
}

:deep(.wallet-dialog .el-dialog__body::-webkit-scrollbar-thumb) {
  background-color: #dcdfe6;
  border-radius: 3px;
}

:deep(.wallet-dialog .el-dialog__body::-webkit-scrollbar-track) {
  background-color: #f5f7fa;
}

:deep(.wallet-dialog .el-dialog__footer) {
  padding: 20px 28px;
  border-top: 1px solid #ebeef5;
  background-color: #f9fafc;
  position: relative;
}

/* 对话框描述文本 */
.dialog-description {
  margin-bottom: 24px;
  padding: 16px 20px;
  background-color: #f0f9ff;
  border-left: 4px solid #409EFF;
  border-radius: 8px;
  color: #606266;
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.dialog-description::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.5) 0%, transparent 100%);
  pointer-events: none;
}

:deep(.deposit-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #409EFF 0%, #64AEFF 100%);
}

:deep(.withdraw-dialog .el-dialog__header) {
  background: linear-gradient(135deg, #67C23A 0%, #85D25E 100%);
}

.wallet-form :deep(.el-form-item__label) {
  font-weight: 500;
  color: #303133;
  font-size: 15px;
  text-align: left !important;
  justify-content: flex-start !important;
  padding-bottom: 10px !important;
}

.wallet-form :deep(.el-form-item) {
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
}

.wallet-form :deep(.el-form-item:last-child) {
  margin-bottom: 10px;
}

.wallet-form :deep(.el-form-item__label) {
  text-align: left !important;
  padding: 0 0 10px 0;
  line-height: 1.5;
  float: none;
  display: block;
  width: 100%;
  justify-content: flex-start !important;
}

.wallet-form :deep(.el-form-item__content) {
  margin-left: 0 !important;
  width: 100%;
}

.wallet-form :deep(.el-form-item.is-error .el-input__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset !important;
}

.wallet-form :deep(.el-form-item__error) {
  padding-top: 4px;
  font-size: 12px;
}

.wallet-input {
  border-radius: 10px;
  width: 100%;
}

.wallet-input :deep(.el-input__wrapper) {
  padding: 0 16px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  transition: all 0.3s;
  height: 44px;
  border-radius: 10px;
}

.wallet-input :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409EFF inset;
}

.wallet-input :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409EFF inset, 0 0 10px rgba(64, 158, 255, 0.2);
}

.wallet-input :deep(.el-input__prefix) {
  color: #909399;
  margin-right: 10px;
}

.wallet-input :deep(.el-input__prefix .el-icon) {
  font-size: 18px;
  transition: all 0.3s;
}

.wallet-input:hover :deep(.el-input__prefix .el-icon),
.wallet-input :deep(.el-input__wrapper.is-focus .el-input__prefix .el-icon) {
  color: #409EFF;
}

.wallet-input :deep(.el-input__suffix) {
  color: #909399;
  margin-left: 10px;
  font-weight: 500;
}

.wallet-select :deep(.el-input__wrapper) {
  border-radius: 10px;
  padding: 0 16px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  height: 44px;
}

.wallet-select :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #409EFF inset;
}

.wallet-select :deep(.el-select-dropdown__item) {
  padding: 12px 20px;
  height: auto;
}

.estimated-input :deep(.el-input__wrapper),
.fee-input :deep(.el-input__wrapper),
.actual-amount-input :deep(.el-input__wrapper) {
  background-color: #f5f7fa;
  box-shadow: 0 0 0 1px #e4e7ed inset;
}

.coin-radio-group,
.network-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  width: 100%;
}

.coin-radio-group :deep(.el-radio-button__inner),
.network-radio-group :deep(.el-radio-button__inner) {
  border-radius: 10px;
  padding: 12px 24px;
  border: 1px solid #dcdfe6;
  transition: all 0.3s;
  height: auto;
  line-height: 1.5;
}

.coin-radio-group :deep(.el-radio-button:first-child .el-radio-button__inner),
.network-radio-group :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-left: 1px solid #dcdfe6;
  border-radius: 10px;
}

.coin-radio-group :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner),
.network-radio-group :deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: #409EFF;
  border-color: #409EFF;
  box-shadow: none;
  transform: translateY(-2px);
}

.coin-radio-group :deep(.el-radio-button__inner:hover),
.network-radio-group :deep(.el-radio-button__inner:hover) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  z-index: 1;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

.cancel-btn,
.submit-btn {
  padding: 12px 28px;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}

.submit-btn {
  background: linear-gradient(135deg, #409EFF 0%, #64AEFF 100%);
  border: none;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #3a8fe0 0%, #5a9de0 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(64, 158, 255, 0.3);
}

.cancel-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

/* 充值对话框样式 */
.rate-info,
.fee-info {
  font-size: 13px;
  color: #606266;
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background-color: #f5f7fa;
  border-radius: 6px;
  transition: all 0.3s;
  text-align: left;
}

.rate-info:hover,
.fee-info:hover {
  background-color: #eef5fe;
}

.fee-rate {
  color: #409EFF;
  font-weight: 600;
}

.info-icon {
  cursor: pointer;
  color: #909399;
  font-size: 16px;
  margin-left: 4px;
  transition: all 0.3s;
}

.info-icon:hover {
  color: #409EFF;
  transform: scale(1.1);
}

.upload-container {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.payment-upload {
  width: 200px;
  flex-shrink: 0;
}

.payment-upload.has-file :deep(.el-upload--picture-card) {
  display: none;
}

.payment-upload :deep(.el-upload--picture-card) {
  width: 200px;
  height: 200px;
  border-radius: 12px;
  border: 2px dashed #d9d9d9;
  background-color: #fafafa;
  transition: all 0.3s;
  overflow: hidden;
}

.payment-upload :deep(.el-upload--picture-card:hover) {
  border-color: #409EFF;
  background-color: #f5f7fa;
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.upload-content {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.upload-icon {
  font-size: 40px;
  color: #8c939d;
  margin-bottom: 16px;
  transition: all 0.3s;
}

.payment-upload :deep(.el-upload--picture-card:hover) .upload-icon {
  color: #409EFF;
  transform: scale(1.1);
}

.upload-text {
  font-size: 15px;
  color: #606266;
  text-align: center;
  line-height: 1.5;
}

.upload-instructions {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 12px;
  border: 1px solid #e6e6e6;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.upload-instructions:hover {
  background-color: #f0f2f5;
  border-color: #d9d9d9;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.instruction-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.instruction-title .el-icon {
  color: #E6A23C;
  font-size: 18px;
}

.instruction-list {
  padding-left: 20px;
  margin: 0;
}

.instruction-list li {
  font-size: 14px;
  color: #606266;
  margin-bottom: 12px;
  line-height: 1.6;
  position: relative;
  padding-left: 5px;
}

.instruction-list li:last-child {
  margin-bottom: 0;
}

.el-upload__tip {
  font-size: 13px;
  color: #909399;
  margin-top: 10px;
  text-align: left;
  padding: 6px;
  background-color: #f5f7fa;
  border-radius: 6px;
}

/* 提现对话框样式 */
.balance-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #606266;
  margin-top: 8px;
  padding: 8px 12px;
  background-color: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;
  text-align: left;
}

.balance-info:hover {
  background-color: #eef5fe;
}

.balance-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.balance-value {
  color: #67C23A;
  font-weight: 600;
}

.max-btn {
  padding: 4px 10px;
  font-size: 13px;
  height: auto;
  line-height: 1.5;
  color: #409EFF;
  font-weight: 500;
  background-color: rgba(64, 158, 255, 0.1);
  border-radius: 4px;
  transition: all 0.3s;
}

.max-btn:hover {
  color: white;
  background-color: #409EFF;
  text-decoration: none;
}

/* 币种和网络选择样式 */
.coin-option,
.network-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.method-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 0;
}

.method-option .el-icon {
  font-size: 18px;
}

/* 地址输入容器 */
.address-input-container {
  display: flex;
  gap: 12px;
  width: 100%;
}

.copy-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border-radius: 10px;
  transition: all 0.3s;
}

.copy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

/* 提示文本样式 */
.address-tip,
.amount-tip,
.currency-tip,
.network-tip,
.name-tip,
.account-tip {
  font-size: 13px;
  color: #909399;
  margin-top: 8px;
  padding: 6px 10px;
  background-color: #f5f7fa;
  border-radius: 6px;
  line-height: 1.5;
  transition: all 0.3s;
  text-align: left;
}

.address-tip:hover,
.amount-tip:hover,
.currency-tip:hover,
.network-tip:hover,
.name-tip:hover,
.account-tip:hover {
  background-color: #eef5fe;
  color: #606266;
}
</style> 
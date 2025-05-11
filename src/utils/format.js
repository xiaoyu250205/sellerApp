/**
 * 格式化金额，添加千分位并保留2位小数
 * @param {number|string} value - 需要格式化的金额
 * @param {string} [currency='$'] - 货币符号，默认为$
 * @returns {string} 格式化后的金额字符串
 * @example
 * formatMoney(1234.5678) // 返回 "1,234.57"
 * formatMoney(1000000) // 返回 "1,000,000.00"
 * formatMoney(0) // 返回 "0.00"
 * formatMoney(null) // 返回 "0.00"
 * formatMoney(1234.5678, '¥') // 返回 "¥1,234.57"
 */
export const formatMoney = (value, currency = '$') => {
  if (value === null || value === undefined) return `${currency}0.00`
  
  // 将输入转换为数字
  const num = Number(value)
  if (isNaN(num)) return `${currency}0.00`
  
  // 使用toLocaleString添加千分位，toFixed保留2位小数
  const formatted = num.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
  
  return `${currency}${formatted}`
}

/**
 * 反格式化金额，将格式化的金额字符串转换为数字
 * @param {string} value - 需要反格式化的金额字符串，如 "¥1,234.57" 或 "$1,234.57"
 * @returns {number} 转换后的数字，如果转换失败则返回0
 * @example
 * unformatMoney("¥1,234.57") // 返回 1234.57
 * unformatMoney("$1,000,000.00") // 返回 1000000
 * unformatMoney("¥0.00") // 返回 0
 * unformatMoney("invalid") // 返回 0
 */
export const unformatMoney = (value) => {
  if (!value) return 0
  
  // 移除货币符号和千分位分隔符
  const cleanValue = value.replace(/[¥$,]/g, '')
  
  // 将字符串转换为数字
  const num = parseFloat(cleanValue)
  
  // 如果转换失败返回0
  return isNaN(num) ? 0 : num
}

/**
 * 格式化日期时间
 * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} - 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-'
  
  // 将输入转换为Date对象
  const dateObj = date instanceof Date ? date : new Date(date)
  
  // 检查日期是否有效
  if (isNaN(dateObj.getTime())) return '-'
  
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  const seconds = String(dateObj.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
} 
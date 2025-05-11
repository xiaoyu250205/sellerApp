import { createI18n } from 'vue-i18n'
// 导入语言文件
import zhCN from './lang/zh-CN.json'
import enUS from './lang/en-US.json'
import viVN from './lang/vi-VN.json'
import thTH from './lang/th-TH.json'
import tlPH from './lang/tl-PH.json'
import msMY from './lang/ms-MY.json'
import ruRU from './lang/ru-RU.json'
import idID from './lang/id-ID.json'
import jaJP from './lang/ja-JP.json'
import koKR from './lang/ko-KR.json'
import frFR from './lang/fr-FR.json'
import deDE from './lang/de-DE.json'

// Element Plus 语言包
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import enUs from 'element-plus/dist/locale/en.mjs'
import viVn from 'element-plus/dist/locale/vi.mjs'
import thTh from 'element-plus/dist/locale/th.mjs'
import idId from 'element-plus/dist/locale/id.mjs'
import jaJp from 'element-plus/dist/locale/ja.mjs'
import koKr from 'element-plus/dist/locale/ko.mjs'
import frFr from 'element-plus/dist/locale/fr.mjs'
import deDe from 'element-plus/dist/locale/de.mjs'
import ruRu from 'element-plus/dist/locale/ru.mjs'
// 注意：Element Plus 可能没有提供所有语言版本，对于缺少的语言，使用英语作为备选

// 支持的语言列表
const supportedLanguages = [
  'zh-CN', 'en-US', 'vi-VN', 'th-TH', 'tl-PH', 
  'ms-MY', 'ru-RU', 'id-ID', 'ja-JP', 'ko-KR', 
  'fr-FR', 'de-DE'
]

// 获取浏览器语言
const getBrowserLanguage = () => {
  const browserLang = navigator.language || navigator.userLanguage

  // console.log('browserLang', browserLang)
  
  // 将浏览器语言转换为我们支持的语言格式
  let lang = browserLang.toLowerCase()
  
  // 检查完整匹配
  for (const supportedLang of supportedLanguages) {
    if (lang === supportedLang.toLowerCase()) {
      return supportedLang
    }
  }
  
  // 检查语言前缀匹配
  if (lang.startsWith('zh')) return 'zh-CN'
  if (lang.startsWith('en')) return 'en-US'
  if (lang.startsWith('vi')) return 'vi-VN'
  if (lang.startsWith('th')) return 'th-TH'
  if (lang.startsWith('tl')) return 'tl-PH'
  if (lang.startsWith('ms')) return 'ms-MY'
  if (lang.startsWith('ru')) return 'ru-RU'
  if (lang.startsWith('id')) return 'id-ID'
  if (lang.startsWith('ja')) return 'ja-JP'
  if (lang.startsWith('ko')) return 'ko-KR'
  if (lang.startsWith('fr')) return 'fr-FR'
  if (lang.startsWith('de')) return 'de-DE'
  
  // 如果不是支持的语言，返回英语
  return 'en-US'
}

// 优先使用本地存储的语言设置，其次是浏览器语言，最后默认英语
const getDefaultLocale = () => {
  // 首先检查本地存储
  const savedLocale = localStorage.getItem('language')
  if (savedLocale && supportedLanguages.includes(savedLocale)) {
    return savedLocale
  }
  
  // 其次检查浏览器语言
  return getBrowserLanguage()
}

const defaultLocale = getDefaultLocale()

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale, // 默认语言
  fallbackLocale: 'en-US', // 备用语言
  messages: {
    'zh-CN': zhCN,
    'en-US': enUS,
    'vi-VN': viVN,
    'th-TH': thTH,
    'tl-PH': tlPH,
    'ms-MY': msMY,
    'ru-RU': ruRU,
    'id-ID': idID,
    'ja-JP': jaJP,
    'ko-KR': koKR,
    'fr-FR': frFR,
    'de-DE': deDE
  }
})

// 导出 Element Plus 的语言包
export const elementLocale = {
  'zh-CN': zhCn,
  'en-US': enUs,
  'vi-VN': viVn,
  'th-TH': thTh || enUs, // 如果不存在则使用英语
  'tl-PH': enUs, // 菲律宾语可能不存在，使用英语
  'ms-MY': enUs, // 马来语可能不存在，使用英语 
  'ru-RU': ruRu || enUs,
  'id-ID': idId || enUs,
  'ja-JP': jaJp || enUs,
  'ko-KR': koKr || enUs,
  'fr-FR': frFr || enUs,
  'de-DE': deDe || enUs
}

export default i18n 
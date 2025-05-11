import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import i18n from './i18n'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
// 导入Vant核心组件和样式
import { 
  Popup as VanPopup, 
  DatePicker as VanDatePicker 
} from 'vant'
import 'vant/lib/index.css'
import 'flag-icons/css/flag-icons.min.css'

const app = createApp(App)
const pinia = createPinia()

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册Vant组件
app.component('van-popup', VanPopup)
app.component('van-date-picker', VanDatePicker)

app.use(ElementPlus)
app.use(i18n)
app.use(router)
app.use(pinia)
app.mount('#app')

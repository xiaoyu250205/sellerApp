import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layout/MainLayout.vue'
import MobileLayout from '../layout/MobileLayout.vue'

// 检测是否为移动设备
const isMobile = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768
}

// 预先检测设备类型，避免重复调用
const IS_MOBILE = isMobile()

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/login/index.vue')
  },
  {
    path: '/m/login',
    name: 'MobileLogin',
    component: () => import('../views/mobile/Login.vue')
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/dashboard/index.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/users/index.vue')
      },
      {
        path: 'products',
        name: 'Products',
        redirect: '/products/list',
        children: [
          {
            path: 'list',
            name: 'ProductList',
            component: () => import('../views/products/List.vue'),
            meta: {
              title: 'menu.shopProducts'
            }
          },
          {
            path: 'warehouse',
            name: 'ProductWarehouse',
            component: () => import('../views/products/Warehouse.vue'),
            meta: {
              title: 'menu.productWarehouse'
            }
          },
          {
            path: 'refunds',
            name: 'RefundRequests',
            component: () => import('../views/products/Refunds.vue'),
            meta: {
              title: 'menu.refundRequests'
            }
          },
          {
            path: 'reviews',
            name: 'ProductReviews',
            component: () => import('../views/products/Reviews.vue'),
            meta: {
              title: 'menu.productReviews'
            }
          }
        ]
      },
      {
        path: 'orders',
        name: 'Orders',
        component: () => import('../views/orders/index.vue')
      },
      {
        path: 'transactions',
        name: 'Transactions',
        component: () => import('../views/transactions/Transactions.vue')
      },
      {
        path: 'settings',
        name: 'Settings',
        redirect: '/settings/shop',
        children: [
          {
            path: 'shop',
            name: 'ShopSettings',
            component: () => import('../views/settings/shop.vue'),
            meta: {
              title: 'menu.shopSettings'
            }
          },
          {
            path: 'index',
            name: 'GeneralSettings',
            component: () => import('../views/settings/index.vue'),
            meta: {
              title: 'menu.settings'
            }
          }
        ]
      },
      {
        path: 'finance',
        name: 'Finance',
        component: () => import('../views/finance/index.vue')
      },
      {
        path: 'wallet',
        name: 'Wallet',
        component: () => import('../views/wallet/index.vue')
      },
      {
        path: 'marketing',
        name: 'Marketing',
        redirect: '/marketing/shop-express',
        children: [
          {
            path: 'shop-express',
            name: 'ShopExpress',
            component: () => import('../views/marketing/ShopExpress.vue'),
            meta: {
              title: 'menu.shopExpress'
            }
          },
          {
            path: 'purchase-history',
            name: 'PurchaseHistory',
            component: () => import('../views/marketing/PurchaseHistory.vue'),
            meta: {
              title: 'menu.purchaseHistory'
            }
          },
          {
            path: 'seller-level',
            name: 'SellerLevel',
            component: () => import('../views/marketing/SellerLevel.vue'),
            meta: {
              title: 'menu.sellerLevel'
            }
          }
        ]
      }
    ]
  },
  // 移动端路由
  {
    path: '/m',
    component: MobileLayout,
    redirect: '/m/shop',
    children: [
      {
        path: 'shop',
        name: 'MobileShop',
        component: () => import('../views/mobile/Shop.vue')
      },
      {
        path: 'products',
        name: 'MobileProducts',
        component: () => import('../views/mobile/Products.vue')
      },
      {
        path: 'products/edit/:id',
        name: 'MobileProductEdit',
        component: () => import('../views/mobile/ProductEdit.vue'),
        props: true
      },
      {
        path: 'orders',
        name: 'MobileOrders',
        component: () => import('../views/mobile/Orders.vue')
      },
      {
        path: 'order-detail',
        name: 'MobileOrderDetail',
        component: () => import('../views/mobile/OrderDetail.vue')
      },
      {
        path: 'profile',
        name: 'MobileProfile',
        component: () => import('../views/mobile/Profile.vue')
      },
      {
        path: 'user-info',
        name: 'MobileUserInfo',
        component: () => import('../views/mobile/UserInfo.vue')
      },
      {
        path: 'finance',
        name: 'MobileFinance',
        component: () => import('../views/mobile/Finance.vue')
      },
      {
        path: 'transactions',
        name: 'MobileTransactions',
        component: () => import('../views/mobile/Transactions.vue')
      },
      {
        path: 'payment-history',
        name: 'MobilePaymentHistory',
        component: () => import('../views/mobile/PaymentHistory.vue')
      },
      {
        path: 'shop-express',
        name: 'MobileShopExpress',
        component: () => import('../views/mobile/ShopExpress.vue')
      },
      {
        path: 'withdraw',
        name: 'MobileWithdraw',
        component: () => import('../views/mobile/Withdraw.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  // 添加滚动行为控制
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 优化路由守卫
router.beforeEach((to, from, next) => {
  const token = sessionStorage.getItem('token')
  // const token = true
  const loginPaths = ['/login', '/m/login']
  
  // 检查是否访问登录页
  const isLoginPage = loginPaths.includes(to.path)
  
  // 实时检测当前设备类型
  const currentIsMobile = isMobile()
  
  // 未登录且不是登录页，重定向到对应设备的登录页
  if (!token && !isLoginPage) {
    return next(currentIsMobile ? '/m/login' : '/login')
  }
  
  // 已登录访问登录页，重定向到首页
  if (token && isLoginPage) {
    return next(currentIsMobile ? '/m/shop' : '/')
  }
  
  // 当访问根登录页但需要根据设备类型跳转到对应的登录页
  if (!token && to.path === '/login' && currentIsMobile) {
    return next('/m/login')
  }
  
  if (!token && to.path === '/m/login' && !currentIsMobile) {
    return next('/login')
  }
  // console.log(currentIsMobile)
  
  // 移动设备重定向逻辑 - 在设备类型为移动且路径不是移动路径时处理
  if (token && currentIsMobile && !to.path.startsWith('/m') && !isLoginPage) {
    const mobileRedirectMap = {
      '/': '/m/shop',
      '/dashboard': '/m/shop',
      'products': '/m/products',
      'orders': '/m/orders',
      'settings': '/m/profile',
      'finance': '/m/finance'
    }
    
    // 查找匹配的重定向路径
    const redirectPath = Object.keys(mobileRedirectMap).find(key => 
      to.path === key || to.path.includes(key)
    )
    
    if (redirectPath) {
      return next(mobileRedirectMap[redirectPath])
    }
  }
  
  // PC设备重定向逻辑 - 在设备类型为PC且路径是移动路径时处理
  if (token && !currentIsMobile && to.path.startsWith('/m') && !isLoginPage) {
    const pcRedirectMap = {
      '/m/shop': '/',
      '/m/products': '/products/list',
      '/m/orders': '/orders',
      '/m/profile': '/settings/shop',
      '/m/finance': '/finance'
    }
    
    // 查找匹配的重定向路径
    const redirectPath = Object.keys(pcRedirectMap).find(key => 
      to.path === key || to.path.startsWith(key)
    )
    
    if (redirectPath) {
      return next(pcRedirectMap[redirectPath])
    }
  }
  
  next()
})

export default router

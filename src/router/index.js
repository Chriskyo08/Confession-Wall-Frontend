import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CommunityView from '../views/CommunityView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import BanList from '../views/BanList.vue'
const router=createRouter({
  history:createWebHistory(),
  routes:[
    {
      path: '/Home',
      name: 'Home',
      component: HomeView
    },
    {
      path: '/Community',
      name: 'Community',
      component: CommunityView
    },
    {
      path: '/Login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/Register',
      name: 'Register',
      component: RegisterView
    },
    {
      path: '/BanList',
      name: 'BanList',
      component: BanList
    },
  ],
});
// 路由守卫
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth) {
    // 检查是否登录（通过本地存储的token判断）
    const token = localStorage.getItem('token');
    if (token) {
      next();
    } else {
      next('/login');
    }
  } else {
    next();
  }
});
export default router

import { createRouter, createWebHistory } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

import Homepage from '@/views/Homepage.vue';
import Register from '@/views/Register.vue';
import Login from '@/views/Login.vue';
import Profile from '@/views/Profile.vue';
import Setting from '@/views/Setting.vue';
import Confession from '@/views/Confession.vue';
import EditConfession from '@/views/EditConfession.vue';
import PostConfession from '@/views/PostConfession.vue';
import Square from '@/views/Square.vue';
import HotList from '@/views/HotList.vue';

const routes = [
  {
    path: '/',
    name: 'Homepage',
    component: Homepage,
    meta: {
      title: '首页',
      requiresAuth: false
    }
  },
  {
    path: '/auth/register',
    name: 'Register',
    component: Register,
    meta: {
      title: '用户注册',
      requiresAuth: false
    }
  },
  {
    path: '/auth/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '用户登录',
      requiresAuth: false
    }
  },
  {
    path: '/user/setting',
    name: 'Setting',
    component: Setting,
    meta: {
      title: '用户设置',
      requiresAuth: true
    }
  },
  {
    path: '/user/:userId',
    name: 'Profile',
    component: Profile,
    meta: {
      dynamicTitle: true,
      requiresAuth: true
    }
  },
  {
    path: '/confession/new',
    name: 'PostConfession',
    component: PostConfession,
    meta: {
      title: '新建表白',
      requiresAuth: true
    }
  },
  {
    path: '/confession/:confessionId',
    name: 'Confession',
    component: Confession,
    meta: {
      dynamicTitle: true,
      requiresAuth: true
    }
  }, {
    path: '/confession/:confessionId/edit',
    name: 'EditConfession',
    component: EditConfession,
    meta: {
      title: '编辑表白',
      requiresAuth: true
    }
  }, {
    path: '/square',
    name: 'Square',
    component: Square,
    meta: {
      title: '表白广场',
      requiresAuth: false
    }
  }, {
    path: '/hotlist',
    name: 'HotList',
    component: HotList,
    meta: {
      title: '表白热度榜',
      requiresAuth: false
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title + '- 表白墙';
  } else {
    document.title = '默认标题';
  }

  // 使用 Pinia store 检查登录状态
  const userStore = useUserStore();
  
  if (to.meta.requiresAuth) { // 需要认证的路由
    if (!userStore.isLoggedIn) { // 未登录，重定向到登录页     
      next({
        name: 'Login',
        query: { redirect: to.fullPath } // 保存原始目标路由，登录后可跳转回去
      });
    } else {
      next();
    }
  } else {
    if ((to.name === 'Login' || to.name === 'Register')&& userStore.isLoggedIn) {
      next({ name: 'Homepage' }); // 如果已登录用户访问登录页或首页，重定向到首页
    } else {
      next();
    }
  }
});

export default router;
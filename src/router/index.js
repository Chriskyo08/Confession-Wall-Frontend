import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import CommunityView from '../views/CommunityView.vue'
import RegisterView from '../views/RegisterView.vue'
import LoginView from '../views/LoginView.vue'
import BanList from '../views/BanList.vue'
const routes = [
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
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

<template>
  <nav class="navbar">
    <div class="navbar-container">
      <div class="navbar-left">
        <router-link to="/" class="navbar-brand">
          <img src="/sparkling-heart.png" alt="Sparkling Heart" class="navbar-logo" />
          <span class="navbar-title">表白墙</span>
        </router-link>
        <ul class="navbar-links">
          <li><router-link to="/square"><img src="@/assets/icons/heart-24.svg" alt="表白广场" height="20">表白广场</router-link></li>
          <li><router-link to="/hotlist"><img src="@/assets/icons/flame-24.svg" alt="表白热度榜" height="20">表白热度榜</router-link></li>
          <li><router-link to="/confession/new"><img src="@/assets/icons/paper-airplane-24.svg" alt="新建表白" height="20">新建表白</router-link></li>
          <li><router-link :to="'/user/' + userStore.userInfo?.user_id"><img src="@/assets/icons/person-24.svg" alt="个人主页" height="20">我的表白</router-link></li>
        </ul>
      </div>

      <div class="navbar-right">
        <ul class="navbar-links">
          <!-- 未登录状态 -->
          <template v-if="!userStore.isLoggedIn">
            <li><router-link to="/auth/register">注册</router-link></li>
            <li><router-link to="/auth/login">登录</router-link></li>
            <li><div class="avatar-wrapper"><img src="/default-avatar.jpg" class="avatar" alt="默认头像" /></div></li>
          </template>
          <!-- 登录状态 -->
          <template v-else>
            <li class="user-avatar-container" @mouseleave="startHideTimeout">
              <router-link :to="'/user/' + userStore.userInfo?.user_id" class="avatar-link">
                <div class="avatar-wrapper" @mouseenter="showDropdown = true">
                  <img 
                    :src="userStore.userInfo?.avatar || '/default-avatar.jpg'" 
                    :alt="userStore.userInfo?.nickname || '用户头像'" 
                    class="avatar"
                    :class="{ 'avatar-expanded': showDropdown }"
                  />
                </div>
              </router-link>
              
              <!-- 下拉菜单 -->
              <div v-show="showDropdown" 
                   class="dropdown-menu"
                   @mouseenter="clearHideTimeout"
                   @mouseleave="startHideTimeout">
                <div class="user-info">
                  <router-link :to="'/user/' + userStore.userInfo?.user_id" class="username">
                    {{ userStore.userInfo?.username }}
                  </router-link>
                  <div class="nickname">{{ userStore.userInfo?.nickname }}</div>
                </div>
                
                <div class="menu-buttons">
                  <div class="menu-buttons-container">
                    <router-link :to="'/user/' + userStore.userInfo?.user_id" class="menu-button">
                      <img src="@/assets/icons/person-24.svg" alt="个人主页">
                      <span>个人主页</span>
                    </router-link>
                    <router-link to="/user/setting" class="menu-button">
                      <img src="@/assets/icons/gear-24.svg" alt="设置">
                      <span>个人设置</span>
                    </router-link>
                    <a href="#" @click.prevent="handleLogout" class="menu-button">
                      <img src="@/assets/icons/sign-out-24.svg" alt="退出">
                      <span>退出登录</span>
                    </a>
                  </div>
                </div>
              </div>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const router = useRouter();
const showDropdown = ref(false);
let hideTimeout = null;

const startHideTimeout = () => {
  hideTimeout = setTimeout(() => {
    showDropdown.value = false;
  }, 300);
};

const clearHideTimeout = () => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

const handleLogout = () => {
  userStore.logout(router);
  showDropdown.value = false;
};</script>

<style scoped>
.navbar {
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0.8rem 2rem;
  position: fixed;
  top: 0;
  left: 0;
  box-sizing: border-box;
  z-index: 1000;
}

.navbar-container {
  max-width: 1200px;
  margin: 0 5%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 48px;
}

.navbar-left, .navbar-right {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.navbar-brand {
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.navbar-brand :deep(svg) {
  width: 24px;
  height: 24px;
  fill: currentColor;
}

.navbar-logo {
  width: 30px;
  height: 30px;
}

.navbar-title {
  font-size: 1.6rem;
  font-weight: bold;
  margin-right: 1rem;
}

.navbar-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  gap: 2rem;
  align-items: center;
  font-size: large;
}

.navbar-links a {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  transition: color 0.3s ease, border-color 0.3s ease;
  padding-bottom: 5px;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.navbar-links a img {
  transition: filter 0.3s ease;
}

.navbar-links a:hover {
  color: #3498db;
  border-color: #3498db;
}

.navbar-links a:hover img {
  filter: brightness(0) saturate(100%) invert(57%) sepia(93%) saturate(1352%) hue-rotate(169deg) brightness(101%) contrast(101%);
}

.user-avatar-container {
  position: relative;
}

.avatar-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  height: 40px;
}

.avatar-link {
  text-decoration: none;
  border-bottom: none !important;
  padding-bottom: 0 !important;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #ddd;
  transition: all 0.3s ease;
}

.avatar:hover {
  border-color: #3498db;
}

.avatar-expanded {
  transform: scale(1.2);
  border-color: #3498db;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: -10px;
  width: 220px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15);
  padding: 1rem;
  z-index: 1001;
  transform-origin: top center;
  animation: dropdownFadeIn 0.2s ease;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-info {
  padding-bottom: 0.8rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 0.8rem;
}

.username {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  text-decoration: none;
  margin-bottom: 0.3rem;
}

.username:hover {
  color: #3498db;
  border-bottom: none;
}

.nickname {
  font-size: 0.9rem;
  color: #666;
}

.menu-buttons {
  display: flex;
  justify-content: center;
  padding: 0.5rem 0;
}

.menu-buttons-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.menu-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  width: 90%;
  color: #555;
  text-decoration: none;
  border-radius: 4px;
  transition: all 0.2s ease;
  border: none !important;
}

.menu-button:hover {
  background-color: #f5f5f5;
  color: #3498db;
  border-bottom: none !important;
}

.menu-button img {
  width: 20px;
  height: 20px;
}
</style>

<template>
  <div class="box-container">
    <div class="box">
      <img src="/sparkling-heart.png" alt="Sparkling Heart" class="logo" />
      <h3>登录账号</h3>

      <div class="form">
        <p>用户名</p>
        <input v-model="loginForm.username" type="text" required />
        <p>密码</p>
        <input v-model="loginForm.password" type="password" required />
        <button type="submit" @click="handleLogin" :disabled="loading">{{ loading ? '登录中...' : '登录' }}</button>
        <router-link :to="{ name: 'Register' }">没有账号？立即注册</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

// 登录表单数据
const loginForm = reactive({
  username: '',
  password: ''
});

const loading = ref(false);

// 登录处理
const handleLogin = async () => {
  loading.value = true;

  try {
    const response = await userStore.login(loginForm);
    
    if (response.success) {
      // 登录成功，跳转到重定向地址或首页
      const redirect = route.query.redirect as string || { name: 'Homepage' };
      router.push(redirect);
      return response;
    } else {
      alert(`登录失败: ${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('登录请求失败:', error);
    alert('登录请求失败，请稍后重试。');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.box-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}

.box {
  background-color: #fff;
  padding: 2rem;
  border-radius: 6px;
  box-shadow: 0 1px 3px #1a1a1a1a;
  width: 30%;
  max-width: 400px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}

.logo {
  width: 56px;
  height: 56px;
}

.form {
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

input {
  width: 100%;
  padding: 0.8rem;
  margin-bottom: .3rem;
  border: 1px solid #ddd;
  border-radius: 3px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input::placeholder {
  font-size: .75rem;
}

input:focus {
  border-color: #6ca5e3;
}

button {
  width: 100%;
  margin-top: .6rem;
  padding: .8rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 3px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #6099d5;
}

p {
  margin: 0.3rem 0;
  color: #666;
}

a {
  margin-top: 1.2rem;
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  text-align: center;
  display: inline-block;
  align-self: center;
}

a:hover {
  color: #6099d5;
}
</style>
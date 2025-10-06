<template>
  <div class="box-container">
    <div class="box">
      <img src="/sparkling-heart.png" alt="Sparkling Heart" class="logo" />
      <h3>注册账号</h3>

      <div class="form">
        <p>用户名</p>
        <input v-model="registerForm.username" type="text" placeholder="2~16 个字符，仅允许包含数字、大小写英文字母" required />
        <p>昵称</p>
        <input v-model="registerForm.nickname" type="text" placeholder="2~16 个字符" required /> 
        <p>密码</p>
        <input v-model="registerForm.password" type="password" placeholder="6~20 位，包含大写字母、小写字母、数字与符号中至少三种" required />
        <input v-model="confirmPassword" type="password" placeholder="确认密码" required />
        <button @click="handleRegister">注册</button>
        <router-link :to="{ name: 'Login' }">已有账号？直接登录</router-link>
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

// 注册表单数据
const registerForm = reactive({
  username: '',
  password: '',
  nickname: ''
});

const confirmPassword = ref('');

// 注册信息校验
function validateInput(username, nickname, password, confirmPassword) {
  const usernamePattern = /^[a-zA-Z0-9]{2,16}$/;
  const nicknamePattern = /^.{2,16}$/;
  function validatePassword(password: string): boolean {
    // 检查长度
    if (password.length < 6 || password.length > 20) {
      return false;
    }

    // 检查各种字符类型
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[\W_]/.test(password);

    // 计算满足的条件数
    const conditionsMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSymbols]
      .filter(condition => condition).length;

    // 返回是否至少满足三个条件
    return conditionsMet >= 3;
  }

  if (!usernamePattern.test(username)) {
    alert('用户名格式不正确');
    return false;
  }

  if (!nicknamePattern.test(nickname)) {
    alert('昵称格式不正确');
    return false;
  }

  if (!validatePassword(password)) {
    alert('密码必须为6~20位，且至少包含大写字母、小写字母、数字、符号中的三种');
    return false;
  }

  if (password !== confirmPassword) {
    alert('两次输入的密码不一致');
    return false;
  }

  return true;
}

// 注册处理
const handleRegister = async () => {
  if (!validateInput(registerForm.username, registerForm.nickname, registerForm.password, confirmPassword.value))
    return;

  try {
    const response = await userStore.register(registerForm);
    
    if (response.success) {
      alert('注册成功！请前往登录页面登录');
      router.push({ name: 'Login' });
    } else {
      alert(`注册失败: ${response.message || '未知错误'}`);
    }
  } catch (error) {
    console.error('注册请求失败:', error);
    alert('注册请求失败，请稍后重试。');
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
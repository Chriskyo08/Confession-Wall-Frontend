<template>
  <div class="setting-container">
    <div class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-item', { active: currentTab === tab.id }]"
        @click="currentTab = tab.id"
      >
        {{ tab.name }}
      </div>
    </div>

    <!-- 用户信息标签页 -->
    <div v-if="currentTab === 'profile'" class="tab-content">
      <div class="form-group">
        <label>头像</label>
        <div class="avatar-section">
          <img :src="normalizeImageUrl(userStore.userInfo?.avatar) || '/default-avatar.jpg'" :alt="userStore.userInfo?.username" class="current-avatar">
          <input
            type="file"
            ref="avatarInput"
            accept="image/*"
            class="hidden"
            @change="handleAvatarChange"
          >
          <button class="btn btn-primary" @click="triggerAvatarUpload">上传头像</button>
        </div>
      </div>

      <div class="form-group">
        <label>用户 ID</label>
        <input type="text" :value="userStore.userInfo?.user_id" disabled>
      </div>

      <div class="form-group">
        <label>用户名</label>
        <input type="text" :value="userStore.userInfo?.username" disabled>
      </div>

      <div class="form-group">
        <label>昵称</label>
        <div class="input-with-button">
          <input
            type="text"
            v-model="nickname"
            placeholder="2-16 个字符"
            :minlength="2"
            :maxlength="16"
          >
          <button class="btn btn-primary" @click="updateNickname" :disabled="!isNicknameValid">
            修改
          </button>
        </div>
      </div>
    </div>

    <!-- 安全设置标签页 -->
    <div v-if="currentTab === 'security'" class="tab-content">
      <div class="form-group">
        <label>原密码</label>
        <input
          type="password"
          v-model="passwordForm.oldPassword"
          placeholder="请输入原密码"
        >
      </div>

      <div class="form-group">
        <label>新密码</label>
        <input
          type="password"
          v-model="passwordForm.newPassword"
          placeholder="8~20 位字符，必须包含字母和数字"
        >
      </div>

      <div class="form-group">
        <label>确认密码</label>
        <input
          type="password"
          v-model="passwordForm.confirmPassword"
          placeholder="请再次输入新密码"
        >
      </div>

      <button
        class="btn btn-danger full-width"
        @click="updatePassword"
        :disabled="!isPasswordFormValid"
      >
        修改密码
      </button>
    </div>

    <!-- 黑名单标签页 -->
    <div v-if="currentTab === 'blacklist'" class="tab-content">
      <div class="blacklist-form">
        <input
          type="number"
          v-model="blockUserId"
          placeholder="输入要拉黑用户的 UID"
          class="block-user-input"
        >
        <button class="btn btn-danger" @click="blockUser" :disabled="!blockUserId">
          拉黑
        </button>
      </div>

      <div class="blacklist-grid">
        <div v-for="user in blacklist" :key="user.user_id" class="blacklist-item">
          <router-link :to="`/profile/${user.user_id}`" class="avatar-link">
            <img :src="normalizeImageUrl(user.avatar) || '/default-avatar.jpg'" :alt="user.username" class="user-avatar">
          </router-link>
          <div class="user-info">
            <div class="username">{{ user.username }}</div>
            <div class="nickname">{{ user.nickname }}</div>
            <div class="user-id">UID: {{ user.user_id }}</div>
          </div>
          <button class="btn btn-danger" @click="unblockUser(user.user_id)">
            取消拉黑
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';

import { ElMessage } from 'element-plus';
import { normalizeImageUrl } from '@/utils/normalizeImageUrl';

const userStore = useUserStore();

// 标签页配置
const tabs = [
  { id: 'profile', name: '用户信息' },
  { id: 'security', name: '安全设置' },
  { id: 'blacklist', name: '黑名单' }
];
const currentTab = ref('profile');

// 用户信息相关
const nickname = ref(userStore.userInfo?.nickname || '');
const avatarInput = ref<HTMLInputElement | null>(null);

// 密码表单
const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

// 黑名单相关
const blockUserId = ref('');
const blacklist = ref([]);

// 昵称验证
const isNicknameValid = computed(() => {
  const nicknamePattern = /^[\u4e00-\u9fa5a-zA-Z0-9_]{2,12}$/;
  return nicknamePattern.test(nickname.value);
});

// 密码验证
const isPasswordValid = (password: string) => {
  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/;
  return passwordPattern.test(password);
};

const isPasswordFormValid = computed(() => {
  return (
    passwordForm.value.oldPassword &&
    isPasswordValid(passwordForm.value.newPassword) &&
    passwordForm.value.newPassword === passwordForm.value.confirmPassword
  );
});

// 头像上传相关方法
const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const handleAvatarChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files[0]) {
    const file = input.files[0];
    
    // 检查文件大小（限制为 5MB）
    if (file.size > 5 * 1024 * 1024) {
      ElMessage.error('文件大小不能超过 5MB');
      return;
    }

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      ElMessage.error('只能上传图片文件');
      return;
    }

    const result = await userStore.uploadAvatar(file);
    if (result.success) {
      ElMessage.success('头像上传成功');
    } else {
      ElMessage.error(result.message);
    }
  }
};

// 修改昵称
const updateNickname = async () => {
  if (!isNicknameValid.value) {
    ElMessage.error('昵称格式不正确');
    return;
  }

  const result = await userStore.updateNickname(nickname.value);
  if (result.success) {
    ElMessage.success('昵称修改成功');
  } else {
    ElMessage.error(result.message);
  }
};

// 修改密码
const updatePassword = async () => {
  if (!isPasswordFormValid.value) {
    ElMessage.error('请检查密码格式是否正确');
    return;
  }

  const result = await userStore.updatePassword({
    old_password: passwordForm.value.oldPassword,
    new_password: passwordForm.value.newPassword
  });

  if (result.success) {
    ElMessage.success('密码修改成功');
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } else {
    ElMessage.error(result.message);
  }
};

// 拉黑用户
const blockUser = async () => {
  if (!blockUserId.value) return;

  const result = await userStore.blockUser(Number(blockUserId.value));
  if (result.success) {
    ElMessage.success('已拉黑该用户');
    blockUserId.value = '';
    await fetchBlacklist();
  } else {
    ElMessage.error(result.message);
  }
};

// 取消拉黑
const unblockUser = async (userId: number) => {
  const result = await userStore.unblockUser(userId);
  if (result.success) {
    ElMessage.success('已取消拉黑');
    await fetchBlacklist();
  } else {
    ElMessage.error(result.message);
  }
};

// 获取黑名单
const fetchBlacklist = async () => {
  const result = await userStore.fetchBlacklist();
  if (result.success && result.data) {
    blacklist.value = result.data;
  }
};

// 页面加载时获取黑名单
onMounted(() => {
  fetchBlacklist();
});
</script>

<style scoped>
.setting-container {
  max-width: 600px;
  margin: 3rem auto 4rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  position: relative;
  min-height: auto;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
  margin-bottom: 2rem;
}

.tab-item {
  padding: 1rem 2rem;
  cursor: pointer;
  position: relative;
  color: #666;
}

.tab-item::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: transparent;
  transition: all 0.3s ease;
}

.tab-item:hover::after {
  background: #ddd;
}

.tab-item.active {
  color: #3498db;
}

.tab-item.active::after {
  background: #3498db;
}

.tab-content {
  padding: 1rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
}

.form-group label {
  width: 100px;
  color: #666;
}

.form-group input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.input-with-button {
  flex: 1;
  display: flex;
  gap: 1rem;
}

.input-with-button input {
  flex: 1;
}

.avatar-section {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.current-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.hidden {
  display: none;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #c0392b;
}

.full-width {
  width: 100%;
  margin-top: 1rem;
}

.blacklist-form {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.block-user-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.blacklist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

input,
textarea {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s ease;
  outline: none;
  height: 38px;
  box-sizing: border-box;
}

input:focus,
textarea:focus {
  border-color: #3498db;
  box-shadow: 0 0 0 1px rgba(52, 152, 219, 0.1);
}

.input-with-button {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.input-with-button input {
  flex: 1;
}

.input-with-button .btn,
.blacklist-form .btn {
  height: 38px;
  padding: 0 1rem;
  margin-top: 0.5rem;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.blacklist-form {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
  margin-bottom: 1.5rem;
}

.blacklist-form input {
  flex: 1;
}

.block-user-input {
  margin-right: 0;
}

.blacklist-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  gap: 1rem;
}

.avatar-link {
  display: block;
  position: relative;
}

.avatar-link::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.avatar-link:hover::after {
  border-color: #3498db;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.avatar-link:hover .user-avatar {
  transform: scale(1.05);
}

.user-info {
  flex: 1;
  overflow: hidden;
}

.username {
  font-weight: bold;
  color: #333;
}

.nickname {
  color: #666;
  margin-top: 0.2rem;
}

.user-id {
  color: #999;
  font-size: 0.9rem;
  margin-top: 0.2rem;
}
</style>
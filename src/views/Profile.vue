<template>
  <div class="profile-container">
    <div class="profile-header" :style="{ backgroundImage: 'url(/default-background.jpg)' }">
      <div class="profile-info">
        <div class="avatar-container">
          <img :src="normalizeImageUrl(userProfile?.avatar) || '/default-avatar.jpg'" :alt="userProfile?.nickname" class="avatar">
        </div>
        <div class="user-info">
          <h1 class="username">{{ userProfile?.nickname || '加载中...' }}</h1>
        </div>
      </div>
      <router-link v-if="isCurrentUserProfile" to="/user/setting" class="settings-link">
        <img src="@/assets/icons/gear-24.svg" alt="用户设置" class="settings-icon">
        <span>用户设置</span>
      </router-link>
    </div>

    <div class="confessions-container">
      <div class="confessions-header">
        <h2>表白列表</h2>
        <div class="page-size-selector">
          每页显示：
          <select v-model="pageLimit">
            <option value="10">10条</option>
            <option value="20">20条</option>
            <option value="30">30条</option>
            <option value="50">50条</option>
            <option value="100">100条</option>
          </select>
        </div>
      </div>

      <div class="confessions-list" v-if="confessions.length > 0">
        <div v-for="confession in confessions" :key="confession.ID" class="confession-item">
          <div class="confession-main">
            <router-link :to="`/user/${confession.userId}`" class="avatar-link">
              <img :src="normalizeImageUrl(userProfile?.avatar) || '/default-avatar.jpg'" :alt="confession.authorName" class="author-avatar">
            </router-link>
            <div class="confession-content">
              <div class="content-main">
                <div class="content-left">
                  <div class="id-section">
                    <router-link :to="`/confession/${confession.ID}`" class="confession-id-link">表白 #{{ confession.ID }}</router-link>
                    <div class="stats">
                      <span class="stat-item">
                        <img src="@/assets/icons/eye-24.svg" alt="views" class="stat-icon">
                        {{ confession.viewCount}}
                      </span>
                      <span class="stat-item">
                        <img src="@/assets/icons/thumbsup-24.svg" alt="likes" class="stat-icon">
                        {{ confession.likeCount }}
                      </span>
                    </div>
                    <div>
                      <router-link :to="`/user/${confession.userId}`" class="author-link">
                        <span class="author-name">{{ userProfile.nickname }}</span>
                      </router-link>
                    </div>
                  </div>
                </div>
                <div class="content-right">
                  <!-- 编辑和删除按钮 (仅当前用户可见) -->
                  <div v-if="isCurrentUserProfile" class="action-buttons">
                    <button 
                      @click="editConfession(confession.ID)" 
                      class="action-btn edit-btn"
                      title="编辑表白"
                    >
                      编辑
                    </button>
                    <button 
                      @click="deleteConfessionHandler(confession.ID)" 
                      class="action-btn delete-btn"
                      title="删除表白"
                    >
                      删除
                    </button>
                  </div>
                  
                  <div class="time-info">
                    <div>发布于 {{ formatDate(confession.publishedAt) }}</div>
                    <div v-if="confession.changedAt !== confession.publishedAt">
                      修改于 {{ formatDate(confession.changedAt) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        暂无表白内容
      </div>

      <div class="pagination" v-if="totalPages > 1">
        <button 
          :disabled="currentPage === 1" 
          @click="changePage(currentPage - 1)"
        >上一页</button>
        <span>{{ currentPage }} / {{ totalPages }}</span>
        <button 
          :disabled="currentPage === totalPages" 
          @click="changePage(currentPage + 1)"
        >下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useConfessionStore } from '@/stores/confessionStore';
import request from '@/utils/request';
import { normalizeImageUrl } from '@/utils/normalizeImageUrl';

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const confessionStore = useConfessionStore();
// 优先用路由参数，没有则用当前登录用户
const userId = ref(route.params.userId || userStore.userInfo?.user_id || '');
const userProfile = ref(null);
const confessions = ref([]);
const currentPage = ref(1);
const pageLimit = ref(10);
const totalPages = ref(0);

const isCurrentUserProfile = computed(() => {
  return userStore.userInfo && userStore.userInfo.user_id?.toString() === userId.value;
});

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

// 获取用户信息
const fetchUserProfile = async () => {
  try {
    const loginUserId = userStore.userInfo?.user_id?.toString();
    const currentId = userId.value?.toString();
    if (loginUserId && currentId && loginUserId === currentId) {
      // 访问自己主页，直接用 userStore.userInfo 或 /api/user/profile
      if (userStore.userInfo) {
        userProfile.value = userStore.userInfo;
      } else {
        const response = await request.get('/api/user/profile');
        userProfile.value = response.data.data;
      }
    } else {
      // 访问他人主页，调用 /api/user/detail?user_id=xxx
      const response = await request.get('/api/user/detail', {
        params: { user_id: currentId }
      });
      userProfile.value = response.data.data;
    }
    document.title = `${userProfile.value.nickname} 的个人主页 - 表白墙`;
  } catch (error) {
    console.error('获取用户信息失败:', error);
  }
};

// 获取表白列表
// 获取作者昵称
const fetchAuthorInfo = async (userId) => {
  try {
    const result = await userStore.fetchUserById(userId);
    if (result.success) {
      return result.data.nickname;
    }
    return '未知用户 #' + userId;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return '未知用户 #' + userId;
  }
};

const fetchConfessions = async () => {
  // user_id 判空，避免 undefined 请求
  const uid = userId.value || userStore.userInfo?.user_id;
  if (!uid) {
    console.warn('用户ID未获取到，无法加载表白列表');
    return;
  }
  try {
    const response = await request.get('/api/confession/user', {
      params: {
  user_id: uid,
        page: currentPage.value,
        pageLimit: pageLimit.value
      }
    });

    // 按 ID 降序排列表白
    const sortedConfessions = response.data.data.sort((a, b) => b.ID - a.ID);

    // 为每个表白获取作者昵称
    const confessionsWithAuthorInfo = await Promise.all(
      sortedConfessions.map(async (confession) => {
        return {
          ...confession
        };
      })
    );

    confessions.value = confessionsWithAuthorInfo;

    // 如果后端返回了总数，使用后端返回的总数计算总页数
    totalPages.value = response.data.total 
      ? Math.ceil(response.data.total / pageLimit.value)
      : Math.ceil(confessions.value.length / pageLimit.value);
  } catch (error) {
    console.error('获取表白列表失败:', error);
  }
};

// 切换页码
const changePage = (page) => {
  currentPage.value = page;
};

// 编辑表白
const editConfession = (confessionId) => {
  router.push(`/confession/${confessionId}/edit`);
};

// 删除表白
const deleteConfessionHandler = async (confessionId) => {
  const confirmed = confirm(`您确定要删除表白 #${confessionId} 吗？`);
  
  if (confirmed) {
    try {
      const result = await confessionStore.deleteConfession(confessionId);
      
      if (result.success) {
        alert('表白删除成功！');
        // 跳转到个人主页
  router.push(`/user/${userStore.userInfo.user_id}`);
      } else {
        alert(result.message || '删除失败，请重试');
      }
    } catch (error) {
      console.error('删除表白失败:', error);
      alert('删除失败，请重试');
    }
  }
};

// 监听路由参数变化
watch(() => route.params.userId, (newId) => {
  userId.value = newId || userStore.userInfo?.user_id || '';
  currentPage.value = 1;
  fetchUserProfile();
  fetchConfessions();
});

// 监听分页参数变化
watch([currentPage, pageLimit], () => {
  fetchConfessions();
});

// 初始化
onMounted(async () => {
  // 如果 userStore.userInfo 未初始化，先拉取一次
  if (!userStore.userInfo || !userStore.userInfo.data?.user_id) {
    await userStore.fetchUserInfo();
  }
  userId.value = route.params.userId || userStore.userInfo?.user_id || '';
  fetchUserProfile();
  fetchConfessions();
});
</script>

<style scoped>
.profile-container {
  min-height: calc(100vh - 120px);
}

.profile-header {
  height: 180px;
  background-size: cover;
  background-position: center;
  position: relative;
  padding: 2rem;
  color: white;
  display: flex;
  align-items: flex-end;
  background-color: rgba(0, 0, 0, 0.5);
  background-blend-mode: multiply;
  border-radius: 0 0 16px 16px;
  margin: 0 2rem;
  overflow: hidden;
}

.settings-link {
  position: absolute;
  bottom: 1.5rem;
  right: 2rem;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  text-decoration: none;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
}

.settings-link:hover {
  border-color: #3498db;
  background-color: rgba(255, 255, 255, 0.2);
}

.settings-icon {
  width: 20px;
  height: 20px;
  filter: invert(1);
}

.profile-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom,
    rgba(0, 0, 0, 0.7) 0%,
    rgba(0, 0, 0, 0.5) 50%,
    rgba(0, 0, 0, 0.6) 100%
  );
  z-index: 1;
  pointer-events: none;
}

.profile-info {
  display: flex;
  align-items: flex-end;
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  z-index: 2;
}

.avatar-container {
  margin-bottom: -1rem;
  position: relative;
  z-index: 2;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  border: 4px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  object-fit: cover;
}

.user-info {
  padding-bottom: 0;
}

.nickname {
  font-size: 2rem;
  margin: 0;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.confessions-container {
  max-width: 1200px;
  margin: 3rem auto;
  padding: 0 2rem;
}

.confessions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-selector select {
  padding: 0.3rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.confession-item {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: transform 0.2s ease;
}

.confession-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.confession-main {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.avatar-link {
  display: block;
  text-decoration: none;
  position: relative;
  width: 76px;
  height: 76px;
}

.avatar-link::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  width: calc(100% + 4px);
  height: calc(100% + 4px);
  border-radius: 50%;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.avatar-link:hover::after {
  border-color: #3498db;
}

.author-avatar {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.avatar-link:hover .author-avatar {
  transform: scale(1.05);
}

.confession-content {
  flex: 1;
  padding-left: 1rem;
}

.content-main {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.content-left {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.id-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.confession-id-link {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  text-decoration: none;
  transition: color 0.2s ease;
}

.confession-id-link:hover {
  color: #3498db;
}

.stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  color: #666;
  font-size: 0.9rem;
}

.stat-icon {
  width: 16px;
  height: 16px;
  opacity: 0.7;
}

.author-link {
  text-decoration: none;
  display: flex;
  gap: 0.8rem;
  align-items: center;
  color: #666;
  transition: color 0.2s ease;
}

.author-link:hover {
  color: #3498db;
}

.author-id {
  font-size: 0.9rem;
}

.author-name {
  font-size: 0.9rem;
  color: inherit;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.pagination button {
  padding: 0.5rem 1rem;
  border: none;
  background: #3498db;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.pagination button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.pagination button:hover:not(:disabled) {
  background: #2980b9;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  justify-content: flex-end;
  flex-shrink: 0;
}

.action-btn {
  padding: 0.3rem 0.8rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 50px;
}

.edit-btn {
  background-color: #3498db;
  color: white;
}

.edit-btn:hover {
  background-color: #2980b9;
  transform: translateY(-1px);
}

.delete-btn {
  background-color: #e74c3c;
  color: white;
}

.delete-btn:hover {
  background-color: #c0392b;
  transform: translateY(-1px);
}

.content-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-height: 60px;
  justify-content: space-between;
}

.time-info {
  font-size: 0.9rem;
  color: #999;
  text-align: right;
  margin-top: auto;
  align-self: flex-end;
}

.time-info div {
  line-height: 1.6;
  margin-bottom: 0.3rem;
}

.time-info div:last-child {
  margin-bottom: 0;
}
</style>
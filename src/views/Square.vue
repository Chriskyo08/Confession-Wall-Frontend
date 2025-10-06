<template>
  <div class="square-container">
    <div class="confessions-container">
      <div class="confessions-header">
        <h2>表白广场</h2>
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
            <!-- 匿名表白不显示超链接 -->
            <router-link v-if="!confession.Anonymous" :to="`/user/${confession.userId}`" class="avatar-link">
              <img :src="confession.userAvatar || '/default-avatar.jpg'" :alt="confession.authorName" class="author-avatar">
            </router-link>
            <!-- 匿名表白只显示默认头像，不可点击 -->
            <div v-else class="avatar-container">
              <img :src="'/default-avatar.jpg'" alt="匿名用户" class="author-avatar">
            </div>
            <div class="confession-content">
              <div class="content-main">
                <div class="content-left">
                  <div class="id-section">
                    <router-link :to="`/confession/${confession.ID}`" class="confession-id-link">表白 #{{ confession.ID }}</router-link>
                    <div class="stats">
                      <span class="stat-item">
                        <img src="@/assets/icons/eye-24.svg" alt="views" class="stat-icon">
                        {{ confession.viewCount }}
                      </span>
                      <span class="stat-item">
                        <img src="@/assets/icons/thumbsup-24.svg" alt="likes" class="stat-icon">
                        {{ confession.likeCount }}
                      </span>
                    </div>
                    <div>
                      <!-- 非匿名表白显示用户链接 -->
                      <router-link v-if="!confession.Anonymous" :to="`/user/${confession.userId}`" class="author-link">
                        <span class="author-name">
                          {{ confession.userNickname || `用户 #${confession.userId}` }}
                        </span>
                      </router-link>
                      <!-- 匿名表白只显示文字，不可点击 -->
                      <span v-else class="author-name anonymous">
                        匿名用户
                      </span>
                    </div>
                  </div>
                </div>
                <div class="content-right">
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

      <div v-else-if="isLoading" class="loading-state">
        正在加载表白内容...
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
import { ref, onMounted, watch } from 'vue';
import { useConfessionStore } from '@/stores/confessionStore';
import { useUserStore } from '@/stores/userStore';

const confessionStore = useConfessionStore();
const userStore = useUserStore();

const confessions = ref([]);
const currentPage = ref(1);
const pageLimit = ref(10);
const totalPages = ref(0);
const isLoading = ref(false);

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

// 获取表白列表
const fetchConfessions = async () => {
  isLoading.value = true;
  
  try {
    const result = await confessionStore.confessionList(currentPage.value, pageLimit.value);
    
    if (result.success && result.data) {
      // 过滤掉私密表白，只显示公开表白
      const publicConfessions = result.data.filter(confession => !confession.Private);
      
      // 按 ID 降序排列表白
      const sortedConfessions = publicConfessions.sort((a, b) => b.ID - a.ID);
      
      // 直接遍历每个表白，获取用户信息并追加到表白对象中
      for (const confession of sortedConfessions) {
        // 设置默认用户信息
        confession.userNickname = `用户 #${confession.userId}`;
        confession.userAvatar = '/default-avatar.jpg';
        
        if (!confession.Anonymous) {
          // 根据 userId 获取用户信息
          try {
            const userResult = await userStore.fetchUserById(confession.userId);

            if (userResult.success && userResult.data) {
              confession.userNickname = userResult.data.nickname || `用户 #${confession.userId}`;
              confession.userAvatar = userResult.data.avatar || '/default-avatar.jpg';
            }
          } catch (error) {
            console.error(`获取用户 #${confession.userId} 信息失败:`, error);
          }
        }        
      }
      
      confessions.value = sortedConfessions;
      
      totalPages.value = Math.ceil(sortedConfessions.length / pageLimit.value) || 1;
      if (result.total) {
        totalPages.value = Math.ceil(result.total / pageLimit.value);
      }
    } else {
      console.error('获取表白列表失败:', result.message);
    }
  } catch (error) {
    console.error('获取表白列表失败:', error);
  } finally {
    isLoading.value = false;
  }
};

// 切换页码
const changePage = (page) => {
  currentPage.value = page;
};

// 监听分页参数变化
watch([currentPage, pageLimit], () => {
  fetchConfessions();
});

// 初始化
onMounted(() => {
  fetchConfessions();
});
</script>

<style scoped>
.square-container {
  min-height: calc(100vh - 120px);
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

.avatar-container {
  display: block;
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

.author-name {
  font-size: 0.9rem;
  color: inherit;
}

.author-name.anonymous {
  color: #999;
  font-style: italic;
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

.loading-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}
</style>
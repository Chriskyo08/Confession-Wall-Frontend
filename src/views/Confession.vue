<template>
  <div class="confession-detail-container">
    <!-- 页面标题 -->
    <div class="page-title">
      <h1>表白 #{{ confessionId }}</h1>
    </div>
    
    <!-- 主体内容 -->
    <div class="main-content">
      <!-- 左栏：表白详情和评论 -->
      <div class="left-column">
        <!-- 表白详情卡片 -->
        <div class="confession-card" v-if="confession">
          <!-- 用户信息区 (淡灰色背景) -->
          <div class="confession-header">
            <div class="user-info">
              <component 
                :is="confession.Anonymous ? 'div' : 'router-link'" 
                :to="confession.Anonymous ? undefined : `/user/${confession.userId}`" 
                class="avatar-link"
              >
                <img 
                  :src="confessionUser?.avatar || '/default-avatar.jpg'" 
                  :alt="confessionUser?.nickname" 
                  class="user-avatar"
                >
              </component>
              <div class="user-details">
                <component 
                  :is="confession.Anonymous ? 'span' : 'router-link'" 
                  :to="confession.Anonymous ? undefined : `/user/${confession.userId}`" 
                  class="username"
                >
                  {{ confessionUser?.nickname || '匿名用户' }}
                </component>
                <div class="publish-time">发布于 {{ formatDate(confession.publishedAt) }}</div>
                <div class="update-time" v-if="confession.changedAt !== confession.publishedAt">
                  修改于 {{ formatDate(confession.changedAt) }}
                </div>
              </div>
            </div>
            <div class="action-buttons">
              <button 
                @click="toggleLike" 
                :class="['action-btn', 'like-btn', { 'liked': isLiked }]"
                title="点赞"
              >
                <img src="@/assets/icons/thumbsup-24.svg" alt="点赞" class="btn-icon">
              </button>
              <button @click="scrollToComment" class="action-btn comment-btn" title="评论">
                <img src="@/assets/icons/comment-24.svg" alt="评论" class="btn-icon">
              </button>
            </div>
          </div>
          
          <!-- 表白内容区 (白色背景) -->
          <div class="confession-content">
            <div class="content-text">{{ confession.content }}</div>
            <div class="content-images" v-if="confession.images && confession.images.length > 0">
              <img 
                v-for="(image, index) in confession.images" 
                :key="index" 
                :src="image" 
                :alt="`图片 ${index + 1}`" 
                class="content-image"
              >
            </div>
          </div>
        </div>
        
        <!-- 评论列表 -->
        <div class="comments-section">
          <h3 class="comments-title">评论</h3>
          <div class="comments-list" v-if="comments.length > 0">
            <div 
              v-for="comment in comments" 
              :key="comment.ID" 
              class="comment-item"
            >
              <div class="comment-header">
                <div class="comment-user-info">
                  <component 
                    :is="comment.user?.anonymous ? 'div' : 'router-link'" 
                    :to="comment.user?.anonymous ? undefined : `/user/${comment.userId}`" 
                    class="avatar-link"
                  >
                    <img 
                      :src="comment.user?.avatar || '/default-avatar.jpg'" 
                      :alt="comment.user?.nickname" 
                      class="comment-avatar"
                    >
                  </component>
                  <div class="comment-details">
                    <div class="comment-title">评论 #{{ comment.ID }}</div>
                    <component 
                      :is="comment.user?.anonymous ? 'span' : 'router-link'" 
                      :to="comment.user?.anonymous ? undefined : `/user/${comment.userId}`" 
                      class="comment-username"
                    >
                      {{ comment.user?.nickname || '匿名用户' }}
                    </component>
                    <div class="comment-time">发布于 {{ formatDate(comment.createdAt) }}</div>
                  </div>
                </div>
                <div class="comment-actions">
                  <button 
                    v-if="isCurrentUserComment(comment.userId)"
                    @click="deleteCommentHandler(comment.ID)" 
                    class="action-btn delete-btn"
                    title="删除评论"
                  >
                    删除
                  </button>
                  <button 
                    @click="replyToComment(comment.ID)" 
                    class="action-btn reply-btn"
                    title="回复评论"
                  >
                    回复
                  </button>
                </div>
              </div>
              <div class="comment-content">
                {{ comment.content }}
              </div>
            </div>
          </div>
          <div v-else class="empty-comments">
            暂无评论
          </div>
        </div>
        
        <!-- 评论输入框 -->
        <div class="comment-input-section" ref="commentInput">
          <h4>发表评论</h4>
          <div class="comment-form">
            <textarea 
              v-model="newComment" 
              placeholder="输入你的评论..." 
              class="comment-textarea"
              rows="4"
            ></textarea>
            <div class="form-controls">
              <div class="parent-id-input" v-if="replyParentId">
                <label>回复评论 ID:</label>
                <input 
                  v-model="replyParentId" 
                  type="number" 
                  class="parent-id-field"
                  readonly
                >
                <button @click="cancelReply" class="cancel-reply-btn">取消回复</button>
              </div>
              <button 
                @click="submitComment" 
                class="submit-comment-btn"
                :disabled="!newComment.trim()"
              >
                <img src="@/assets/icons/paper-airplane-24.svg" alt="发布" class="btn-icon">
                发表评论
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右栏：表白信息 -->
      <div class="right-column">
        <div class="info-card" v-if="confession">
          <div class="info-content">
            <div class="info-left">
              <div class="info-item">发布者</div>
              <div class="info-item">发布时间</div>
              <div class="info-item" v-if="confession.changedAt !== confession.publishedAt">修改时间</div>
              <div class="info-item">浏览数</div>
              <div class="info-item">点赞数</div>
            </div>
            <div class="info-right">
              <div class="info-value">
                <component 
                  :is="confession.Anonymous ? 'div' : 'router-link'" 
                  :to="confession.Anonymous ? undefined : `/user/${confession.userId}`" 
                  class="user-link"
                >
                  <img 
                    :src="confessionUser?.avatar || '/default-avatar.jpg'" 
                    :alt="confessionUser?.nickname" 
                    class="info-avatar"
                  >
                  <span class="info-nickname">{{ confessionUser?.nickname || '匿名用户' }}</span>
                </component>
              </div>
              <div class="info-value">{{ formatDateTime(confession.publishedAt) }}</div>
              <div class="info-value" v-if="confession.changedAt !== confession.publishedAt">
                {{ formatDateTime(confession.changedAt) }}
              </div>
              <div class="info-value">{{ confession.viewCount }}</div>
              <div class="info-value">{{ confession.likeCount }}</div>
            </div>
          </div>
          
          <div class="info-actions">
            <button @click="scrollToComment" class="info-action-btn comment-btn">
              评论
            </button>
            <template v-if="isCurrentUserConfession">
              <button @click="editConfession" class="info-action-btn edit-btn">
                编辑
              </button>
              <button @click="deleteConfessionHandler" class="info-action-btn delete-btn">
                删除
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useConfessionStore } from '@/stores/confessionStore'
import { useCommentStore } from '@/stores/commentStore'
import { useUserStore } from '@/stores/userStore'

// 路由和store
const route = useRoute()
const router = useRouter()
const confessionStore = useConfessionStore()
const commentStore = useCommentStore()
const userStore = useUserStore()

// 响应式数据
const confessionId = ref(Number(route.params.confessionId))
const confession = ref(null)
const confessionUser = ref(null)
const comments = ref([])
const isLiked = ref(false)
const newComment = ref('')
const replyParentId = ref(null)
const commentInput = ref(null)

// 计算属性
const isCurrentUserConfession = computed(() => {
  return confession.value && userStore.userInfo && 
         confession.value.userId === userStore.userInfo.user_id
})

const isCurrentUserComment = (commentUserId) => {
  return userStore.userInfo && commentUserId === userStore.userInfo.user_id
}

// 工具方法
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// 页面标题设置
const setPageTitle = () => {
  document.title = `表白 #${confessionId.value} - 表白墙`
}

// 获取表白详情
const fetchConfessionDetail = async () => {
  try {
    const result = await confessionStore.confessionDetail(confessionId.value)
    if (result.success) {
      confession.value = result.data.data
      isLiked.value = result.data.liked
      
      // 获取发布者信息
      if (!confession.value.Anonymous) {
        const userResult = await userStore.fetchUserById(confession.value.userId)
        if (userResult.success) {
          confessionUser.value = userResult.data
        }
      } else {
        confessionUser.value = { nickname: '匿名用户', avatar: '/default-avatar.jpg' }
      }
    } else {
      console.error('获取表白详情失败:', result.message)
      // 可以添加错误提示
    }
  } catch (error) {
    console.error('获取表白详情出错:', error)
  }
}

// 获取评论列表
const fetchComments = async () => {
  try {
    const result = await commentStore.fetchCommentList(confessionId.value)
    if (result.success) {
      comments.value = result.data
      
      // 为每个评论获取用户信息
      for (const comment of comments.value) {
        if (!comment.user?.anonymous) {
          const userResult = await userStore.fetchUserById(comment.userId)
          if (userResult.success) {
            comment.user = { ...userResult.data, anonymous: false }
          }
        } else {
          comment.user = { nickname: '匿名用户', avatar: '/default-avatar.jpg', anonymous: true }
        }
      }
    } else {
      console.error('获取评论列表失败:', result.message)
    }
  } catch (error) {
    console.error('获取评论列表出错:', error)
  }
}

// 点赞/取消点赞
const toggleLike = async () => {
  try {
    const result = await confessionStore.likeConfession(confessionId.value)
    if (result.success) {
      isLiked.value = result.data.liked
      // 更新点赞数
      if (confession.value) {
        confession.value.likeCount += result.data.liked ? 1 : -1
      }
    } else {
      console.error('点赞操作失败:', result.message)
    }
  } catch (error) {
    console.error('点赞操作出错:', error)
  }
}

// 滚动到评论区
const scrollToComment = () => {
  nextTick(() => {
    if (commentInput.value) {
      commentInput.value.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      })
    }
  })
}

// 回复评论
const replyToComment = (commentId) => {
  replyParentId.value = commentId
  scrollToComment()
}

// 取消回复
const cancelReply = () => {
  replyParentId.value = null
}

// 发表评论
const submitComment = async () => {
  if (!newComment.value.trim()) return
  
  try {
    const commentData = {
      confessionId: confessionId.value,
      content: newComment.value.trim()
    }
    
    if (replyParentId.value) {
      commentData.parentId = replyParentId.value
    }
    
    const result = await commentStore.postComment(commentData)
    if (result.success) {
      // 清空输入框
      newComment.value = ''
      replyParentId.value = null
      // 重新获取评论列表
      await fetchComments()
    } else {
      console.error('发表评论失败:', result.message)
    }
  } catch (error) {
    console.error('发表评论出错:', error)
  }
}

// 删除评论
const deleteCommentHandler = async (commentId) => {
  if (!confirm('确定要删除这条评论吗？')) return
  
  try {
    const result = await commentStore.deleteComment(commentId)
    if (result.success) {
      // 重新获取评论列表
      await fetchComments()
    } else {
      console.error('删除评论失败:', result.message)
    }
  } catch (error) {
    console.error('删除评论出错:', error)
  }
}

// 编辑表白
const editConfession = () => {
  router.push(`/confession/edit/${confessionId.value}`)
}

// 删除表白
const deleteConfessionHandler = async () => {
  if (!confirm('确定要删除这条表白吗？删除后无法恢复！')) return
  
  try {
    const result = await confessionStore.deleteConfession(confessionId.value)
    if (result.success) {
      // 删除成功，跳转到首页或用户主页
      router.push('/')
    } else {
      console.error('删除表白失败:', result.message)
    }
  } catch (error) {
    console.error('删除表白出错:', error)
  }
}

// 生命周期
onMounted(async () => {
  // 验证confessionId是否有效
  if (!confessionId.value || isNaN(confessionId.value)) {
    console.error('无效的表白ID')
    router.push('/')
    return
  }
  
  setPageTitle()
  await fetchConfessionDetail()
  await fetchComments()
})
</script>

<style scoped>
.confession-detail-container {
  min-height: 100vh;
  background-color: #efefef;
  padding: 20px;
}

.page-title {
  text-align: left;
  margin-bottom: 30px;
}

.page-title h1 {
  color: #333;
  font-size: 2rem;
  font-weight: bold;
  margin: 0;
}

.main-content {
  display: flex;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
}

/* 左栏样式 */
.left-column {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 表白卡片样式 */
.confession-card {
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #007bff;
}

.confession-header {
  background-color: #f8f9fa;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.user-info {
  display: flex;
  gap: 12px;
}

.avatar-link {
  text-decoration: none;
}

.user-avatar {
  width: 76px;
  height: 76px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.username {
  color: #007bff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
}

.username:hover {
  color: #0056b3;
}

/* 匿名用户样式 */
.username:not([href]) {
  color: #999;
  cursor: default;
  font-style: italic;
}

.username:not([href]):hover {
  text-decoration: none;
}

.avatar-link:not([href]) {
  cursor: default;
}

.avatar-link:hover .user-avatar {
  transform: scale(1.05);
}

.publish-time,
.update-time {
  color: #666;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

.like-btn {
  background: #f8f9fa;
  color: #666;
}

.like-btn:hover {
  background: #e9ecef;
}

.like-btn.liked {
  background: #007bff;
  color: white;
}

.like-btn.liked .btn-icon {
  filter: brightness(0) invert(1);
}

.comment-btn {
  background: transparent;
  color: #007bff;
  border: 2px solid #007bff;
}

.comment-btn:hover {
  background: #f0f8ff;
}

.comment-btn .btn-icon {
  filter: brightness(0) saturate(100%) invert(26%) sepia(89%) saturate(1583%) hue-rotate(213deg) brightness(99%) contrast(101%);
}

.confession-content {
  padding: 20px;
  background: white;
}

.content-text {
  line-height: 1.6;
  color: #333;
  margin-bottom: 16px;
  white-space: pre-wrap;
}

.content-images {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.content-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  object-fit: cover;
  cursor: pointer;
  transition: transform 0.2s;
}

.content-image:hover {
  transform: scale(1.05);
}

/* 评论区样式 */
.comments-section {
  background: white;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #007bff;
}

.comments-title {
  color: #333;
  font-size: 1.2rem;
  margin-bottom: 16px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.comment-header {
  background-color: #f8f9fa;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.comment-user-info {
  display: flex;
  gap: 10px;
}

.comment-user-info .avatar-link:hover .comment-avatar {
  transform: scale(1.05);
}

.comment-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.comment-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.comment-title {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.comment-username {
  color: #007bff;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
}

.comment-username:hover {
  text-decoration: underline;
}

/* 匿名评论用户样式 */
.comment-username:not([href]) {
  color: #999;
  cursor: default;
  font-style: italic;
}

.comment-username:not([href]):hover {
  text-decoration: none;
}

.comment-time {
  color: #666;
  font-size: 0.8rem;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.reply-btn {
  background: #007bff;
  color: white;
}

.reply-btn:hover {
  background: #0056b3;
}

.comment-content {
  padding: 12px;
  background: white;
  color: #333;
  line-height: 1.5;
  white-space: pre-wrap;
}

.empty-comments {
  text-align: center;
  color: #666;
  padding: 40px;
  font-style: italic;
}

/* 评论输入区样式 */
.comment-input-section {
  background: white;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #007bff;
}

.comment-input-section h4 {
  color: #333;
  margin-bottom: 16px;
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-textarea {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 12px;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  min-height: 100px;
  box-sizing: border-box;
}

.comment-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.parent-id-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #e3f2fd;
  border-radius: 6px;
  border: 1px solid #bbdefb;
}

.parent-id-input label {
  font-size: 0.9rem;
  color: #1976d2;
  font-weight: 500;
}

.parent-id-field {
  border: none;
  background: transparent;
  color: #1976d2;
  font-weight: 600;
  width: 60px;
  text-align: center;
}

.cancel-reply-btn {
  background: #f44336;
  color: white;
  border: none;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
}

.cancel-reply-btn:hover {
  background: #d32f2f;
}

.submit-comment-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
}

.submit-comment-btn .btn-icon {
  filter: brightness(0) invert(1);
}

.submit-comment-btn:hover:not(:disabled) {
  background: #0056b3;
}

.submit-comment-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* 右栏样式 */
.right-column {
  flex: 0 0 280px;
  min-width: 280px;
}

.info-card {
  background: white;
  border-radius: 6px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  border-bottom: 1px solid #007bff;
}

.info-content {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.info-left,
.info-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.info-value {
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-link {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: inherit;
}

.user-link:hover {
  color: #007bff;
}

/* 匿名用户链接样式 */
.user-link:not([href]) {
  cursor: default;
}

.user-link:not([href]):hover {
  color: inherit;
}

.user-link:not([href]) .info-nickname {
  color: #666;
}

.info-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.info-nickname {
  color: #007bff;
  font-weight: 500;
}

.info-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.info-action-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  min-width: auto;
  width: auto;
}

.info-action-btn.comment-btn {
  background: #007bff;
  color: white;
}

.info-action-btn.comment-btn:hover {
  background: #0056b3;
}

.info-action-btn.edit-btn {
  background: #007bff;
  color: white;
}

.info-action-btn.edit-btn:hover {
  background: #0056b3;
}

.info-action-btn.delete-btn {
  background: #dc3545;
  color: white;
}

.info-action-btn.delete-btn:hover {
  background: #c82333;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
    padding: 10px;
  }
  
  .right-column {
    order: -1;
  }
  
  .info-card {
    position: static;
  }
  
  .confession-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .action-buttons {
    align-self: flex-start;
  }
  
  .form-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .parent-id-input {
    justify-content: center;
  }
}
</style>
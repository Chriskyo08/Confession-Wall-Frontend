<template>
  <ContentBase>
    <h2>个人信息</h2>
    <div class="profile-container">
      <div class="avatar-column">
        <div class="avatar-wrapper">
          <img :src="userInfo.avatar" alt="用户头像" class="avatar" @click="openAvatarDialog">
          <input type="file" ref="avatarInput" accept="image/*" @change="handleAvatarChange" style="display: none">
          <p class="avatar-hint">点击更换头像</p>
        </div>
      </div>
      
      <div class="info-column">
        <div class="info-item">
          <label class="info-label">用户名：</label>
          <div class="info-content">
            <input 
              type="text" 
              v-model="editableUsername" 
              :readonly="!isEditing"
            >
          </div>
        </div>
        
        <div class="info-item">
          <label class="info-label">邮箱：</label>
          <div class="info-content">
            <input 
              type="email" 
              v-model="editableEmail" 
              :readonly="!isEditing"
            >
          </div>
        </div>
        
        <div class="info-item">
          <label class="info-label">联系方式：</label>
          <div class="info-content">
            <input 
              type="text" 
              v-model="editablePhone" 
              :readonly="!isEditing"
            >
          </div>
        </div>
        
        <div class="info-item">
          <label class="info-label">个性签名：</label>
          <div class="info-content">
            <textarea 
              v-model="editableSignature" 
              :readonly="!isEditing"
              rows="3"
            ></textarea>
          </div>
        </div>

        <div class="action-buttons">
          <button v-if="!isEditing" @click="startEditing">开始编辑</button>
          <button v-if="isEditing" @click="saveAll">保存所有修改</button>
          <button v-if="isEditing" @click="cancelEditing" class="cancel-btn">取消</button>
        </div>
      </div>
    </div>
  </ContentBase>
  <ContentBase>
    <h2>发布新帖子</h2>
    <div class="post-container">
      <div class="post-editor">
        <div class="post-input">
          <textarea
            v-model="postContent" 
            placeholder="分享你的想法..." 
            rows="10"
            class="post-textarea"
          ></textarea>
        </div>
        <!-- 新增匿名选项 -->
        <div class="anonymous-option">
          <label>
            <input type="checkbox" v-model="isAnonymous">
            匿名发布
          </label>
        </div>
        <div class="post-actions">
          <div class="post-buttons">
            <button class="attach-btn" @click="handleImageUpload">
              <i class="icon-image"></i> 图片
            </button>
            <input type="file" ref="imageInput" accept="image/*" @change="handleImageSelect" style="display: none">
            <input type="file" ref="editImageInput" accept="image/*" @change="handleEditImageSelect" style="display: none">
            <button @click="clearPost">清空</button>
            <button @click="submitPost" class="submit-btn">发布</button>
          </div>
        </div>
        
        <div v-if="selectedImages.length" class="image-preview">
          <div v-for="(img, index) in selectedImages" :key="index" class="preview-item">
            <img :src="img" alt="预览图">
            <button class="remove-img" @click="removeImage(index)">×</button>
          </div>
        </div>
      </div>
    </div>
  </ContentBase>
  <ContentBase>
    <h2>管理帖子</h2>
    <div class="posts-management">
      <div v-if="userPosts.length === 0" class="no-posts">
        暂无发布的帖子
      </div>
      
      <div v-for="(post, index) in userPosts" :key="post.id" class="post-item">
        <div v-if="post.isEditing" class="post-editor">
          <textarea
            v-model="post.editableContent"
            rows="5"
            class="post-textarea"
          ></textarea>
          
          <div v-if="post.editableImages.length" class="image-preview">
            <div v-for="(img, imgIndex) in post.editableImages" :key="imgIndex" class="preview-item">
              <img :src="img" alt="预览图">
              <button class="remove-img" @click="removeEditImage(post, imgIndex)">×</button>
            </div>
          </div>
          
          <div class="edit-actions">
            <button @click="handleImageUploadForEdit(post)">添加图片</button>
            <button @click="savePostEdit(post)">保存修改</button>
            <button @click="cancelPostEdit(post)" class="cancel-btn">取消</button>
          </div>
        </div>
        
        <div v-else class="post-content">
          <!-- 显示作者时判断是否匿名 -->
          <div class="post-author">
            {{ post.isAnonymous ? '匿名用户' : post.author }}
          </div>
          <p>{{ post.content }}</p>
          
          <div v-if="post.images.length" class="image-preview">
            <div v-for="(img, imgIndex) in post.images" :key="imgIndex" class="preview-item">
              <img :src="img" alt="帖子图片">
            </div>
          </div>

          <div class="post-meta">
            <span class="post-time">{{ formatTime(post.timestamp) }}</span>
            <div class="post-actions">
              <button @click="startPostEdit(post)">编辑</button>
              <button @click="deletePost(index)" class="cancel-btn">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ContentBase>
  <div 
    v-if="fullscreenImage" 
    class="fullscreen-overlay"
    @click="exitFullscreen"
  >
    <img 
      :src="fullscreenImage" 
      class="fullscreen-img"
      @click.stop
      @dblclick="exitFullscreen"
    >
    <button class="fullscreen-close" @click="exitFullscreen">×</button>
  </div>
</template>

<script>
import ContentBase from '../components/ContentBase'
import { mapGetters, mapMutations } from 'vuex'


export default {
  name: 'HomeView',
  components:{
    ContentBase,
  },
  data() {
    return {
      isEditing: false, 
      originalInfo: {}, 
      
      editableUsername: '',
      editableEmail: '',
      editablePhone: '',
      editableSignature: '',

      postContent: '',
      selectedImages: [],
      userPosts: [], // 存储用户发布的帖子
      currentEditPost: null, // 当前正在编辑的帖子
      fullscreenImage:null,//存储全屏显示图片地址
      isAnonymous:false//匿名状态变量
    }
  },
  computed: {
    ...mapGetters(['getUserInfo']),
    userInfo() {
      return this.getUserInfo
    }
  },
  watch: {
    userInfo(newVal) {
      this.editableUsername = newVal.username || ''
      this.editableEmail = newVal.email || ''
      this.editablePhone = newVal.phone || ''
      this.editableSignature = newVal.signature || ''
      // 从本地存储加载历史帖子
      this.loadPostsFromStorage()
    }
  },
  mounted() {
    this.editableUsername = this.userInfo.username || ''
    this.editableEmail = this.userInfo.email || ''
    this.editablePhone = this.userInfo.phone || ''
    this.editableSignature = this.userInfo.signature || ''
  },
  methods: {
    ...mapMutations([
      'updateAvatar', 
      'updateUsername',
      'updateEmail',
      'updatePhone',
      'updateSignature'
    ]),
    startEditing() {
      this.originalInfo = {
        username: this.editableUsername,
        email: this.editableEmail,
        phone: this.editablePhone,
        signature: this.editableSignature
      }
      this.isEditing = true
    },
    
    saveAll() {
      if (this.editableUsername.trim()) {
        this.updateUsername(this.editableUsername.trim())
      }
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (this.editableEmail.trim() && emailRegex.test(this.editableEmail.trim())) {
        this.updateEmail(this.editableEmail.trim())
      }
      
      this.updatePhone(this.editablePhone.trim())
      this.updateSignature(this.editableSignature.trim())
      
      this.isEditing = false
    },
    
    cancelEditing() {
      this.editableUsername = this.originalInfo.username
      this.editableEmail = this.originalInfo.email
      this.editablePhone = this.originalInfo.phone
      this.editableSignature = this.originalInfo.signature
      this.isEditing = false
    },
    
    openAvatarDialog() {
      this.$refs.avatarInput.click()
    },
    handleAvatarChange(e) {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          this.updateAvatar(event.target.result)
        }
        reader.readAsDataURL(file)
      }
    },
    handleImageUpload() {
      this.$refs.imageInput.click()
    },
     handleImageSelect(e) {
       const files = e.target.files
       if (files) {
        // 计算可添加的图片数量（最多9张）
        const remaining = 9 - this.selectedImages.length
        if (remaining <= 0) {
          alert('最多只能上传9张图片')
          e.target.value = ''
          return
        }
        
        // 只取能添加的数量（避免选择超过剩余数量的图片）
        const selectFiles = Array.from(files).slice(0, remaining)
        
        selectFiles.forEach(file => {
          const reader = new FileReader()
          reader.onload = (event) => {
            this.selectedImages.push(event.target.result)
          }
          reader.readAsDataURL(file)
        })
      }

      e.target.value = ''
    },
    
    removeImage(index) {
      this.selectedImages.splice(index, 1)
    },
    
    clearPost() {
      this.postContent = ''
      this.selectedImages = []
    },
    
     submitPost() {
      if (!this.postContent.trim() && this.selectedImages.length === 0) {
        alert('请输入内容或选择图片')
        return
      }
      
      const newPost = {
        id: Date.now(),
        content: this.postContent,
        images: [...this.selectedImages],
        // 存储原始作者信息（用于编辑判断）
        author: this.userInfo.username,
        // 新增匿名标识
        isAnonymous: this.isAnonymous,
        timestamp: new Date()
      }
      
      this.userPosts.unshift(newPost)
      this.savePostsToStorage()
      
      // 重置表单时同时重置匿名选项
      this.clearPost()
      this.isAnonymous = false
      alert('发布成功！')
    },
    
    // 帖子管理相关新方法
    loadPostsFromStorage() {
      // 从本地存储加载帖子
      const savedPosts = localStorage.getItem('userPosts')
      if (savedPosts) {
        this.userPosts = JSON.parse(savedPosts).map(post => ({
          ...post,
          timestamp: new Date(post.timestamp),
          isEditing: false
        }))
      }
    },
    
    savePostsToStorage() {
      // 保存帖子到本地存储
      localStorage.setItem('userPosts', JSON.stringify(this.userPosts))
    },
    
    formatTime(date) {
      // 格式化时间显示
      return new Date(date).toLocaleString()
    },
    
    deletePost(index) {
      // 删除帖子
      if (confirm('确定要删除这条帖子吗？')) {
        this.userPosts.splice(index, 1)
        this.savePostsToStorage()
      }
    },
    
    handleImageUploadForEdit(post) {
      // 编辑时上传图片
      this.currentEditPost = post
      this.$refs.editImageInput.click()
    },
    
    handleEditImageSelect(e) {
      const files = e.target.files
      if (files&&this.currentEditPost) {
        // 计算可添加的图片数量（最多9张）
        const remaining = 9 - this.currentEditPost.editableImages.length
        if (remaining <= 0) {
          alert('最多只能上传9张图片')
          e.target.value = ''
          return
        }
        
        // 只取能添加的数量（避免选择超过剩余数量的图片）
        const selectFiles = Array.from(files).slice(0, remaining)
        
        selectFiles.forEach(file => {
          const reader = new FileReader()
          reader.onload = (event) => {
            this.currentEditPost.editableImages.push(event.target.result)
          }
          reader.readAsDataURL(file)
        })
      }
      e.target.value = ''
    },
    
    // 编辑帖子时保持匿名状态不变
    startPostEdit(post) {
      post.isEditing = true
      post.originalContent = post.content
      post.editableContent = post.content
      post.editableImages = [...post.images]
      // 保留匿名状态
      post.originalIsAnonymous = post.isAnonymous
      this.currentEditPost = post
    },
    savePostEdit(post) {
      if (!post.editableContent.trim() && post.editableImages.length === 0) {
        alert('帖子内容不能为空')
        return
      }
      
      post.content = post.editableContent
      post.images = [...post.editableImages]
      // 保持匿名状态不变
      post.isEditing = false
      post.timestamp = new Date()
      
      this.currentEditPost = null
      this.savePostsToStorage()
      alert('修改成功！')
    }
  }
}
</script>
<style scoped>
/*匿名样式*/ 
.anonymous-option {
  margin: 10px 0;
  display: flex;
  align-items: center;
  color: #666;
}

.anonymous-option input {
  margin-right: 8px;
}
/*作者显示样式*/
.post-author {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
  font-weight: 500;
}
/* 添加全屏预览样式 */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.9);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
}

.fullscreen-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  cursor: zoom-out;
}

.fullscreen-close {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.3);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
}

.fullscreen-close:hover {
  background: rgba(255, 255, 255, 0.5);
}

/* 修改现有图片元素添加双击事件支持 */
/* 帖子图片预览样式 */
.image-preview {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.preview-item {
  position: relative;
  width: 120px; /* 固定宽度 */
  height: 120px; /* 固定高度 */
  overflow: hidden;
  border-radius: 4px;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保持比例并覆盖容器 */
  transition: transform 0.2s;
}

.preview-item img:hover {
  transform: scale(1.05);
}

/* 帖子内容中的图片样式 */
.post-content .image-preview .preview-item {
  width: 150px;
  height: 150px;
}
.image-count {
  margin-top: 8px;
  color: #666;
  font-size: 14px;
}
.post-item {
  border: 1px solid #e0e0e0; /* 边框 */
  border-radius: 6px; /* 圆角 */
  padding: 15px; /* 内边距 */
  margin-bottom: 15px; /* 帖子之间的间距 */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05); /* 轻微阴影增强立体感 */
}
.post-content {
  padding: 5px 0;
}
.post-meta {
  display: flex; /* 使用flex布局 */
  justify-content: space-between; /* 两端对齐 */
  align-items: center; /* 垂直居中 */
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee; /* 顶部虚线分隔 */
}
.edit-actions {
  display: flex;
  justify-content: flex-end; /* 靠右对齐 */
  gap: 10px; /* 按钮间距 */
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed #eee;
}
.profile-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}
.avatar-column {
  flex: 0 0 160px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-wrapper {
  text-align: center;
}

.avatar {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  border: 2px solid #ddd;
  transition: transform 0.2s;
}

.avatar:hover {
  transform: scale(1.05);
}

.avatar-hint {
  margin-top: 10px;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.info-column {
  flex: 1;
  min-width: 300px;
}

.action-buttons {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.cancel-btn {
  background: #f56c6c;
}

.cancel-btn:hover {
  background: #e45e5e;
}

.info-item {
  display: flex;
  margin-bottom: 20px;
  align-items: flex-start;
}

.info-label {
  flex: 0 0 100px;
  color: #666;
  padding-top: 6px;
}

.info-content {
  flex: 1;
  display: flex;
  gap: 10px;
  align-items: center;
}

.info-content input,
.info-content textarea {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.info-content textarea {
  resize: vertical;
  min-height: 60px;
}
.profile-container, .post-container {
  max-width: 800px;
  margin: 20px auto;
  padding: 0 20px; 
}
.post-actions{
  margin-top:10px;
}
.post-buttons{
  display:flex;
  gap:10px;
  align-items:center;
  justify-content:flex-end;
}
.attach-btn{
}
.post-input{
  width:100%;
}
.post-textarea{
  width:100%;
  min-height:120px;
  resize:vertical;
}
.posts-management {
  margin-top: 30px;
}
button {
  padding: 6px 12px;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  white-space: nowrap;
}

button:hover {
  background: #359e75;
}

@media (max-width: 600px) {
  .profile-container {
    flex-direction: column;
    align-items: center;
  }
  
  .info-item {
    flex-direction: column;
  }
  
  .info-label {
    margin-bottom: 8px;
  }
}
</style>
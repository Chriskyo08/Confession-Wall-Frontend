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
        
        <div class="post-actions">
          <div class="post-buttons">
            <button class="attach-btn" @click="handleImageUpload">
              <i class="icon-image"></i> 图片
            </button>
            <input type="file" ref="imageInput" accept="image/*" @change="handleImageSelect" style="display: none">
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
      selectedImages: []
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
        Array.from(files).forEach(file => {
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
      

      console.log({
        content: this.postContent,
        images: this.selectedImages,
        author: this.userInfo.username,
        timestamp: new Date()
      })
      
      
      this.clearPost()
      alert('发布成功！')
    }
  }
}
</script>
<style scoped>
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
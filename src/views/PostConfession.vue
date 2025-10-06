<template>
  <div class="main-box">
    <h1 class="page-title">新建表白</h1>
    
    <form @submit.prevent="handlePostConfession" class="confession-form">
      <!-- 表白内容 -->
      <div class="form-row">
        <label class="form-label">表白内容</label>
        <textarea
          v-model="formData.content"
          class="content-textarea"
          placeholder="请输入表白内容..."
          rows="8"
          required
        ></textarea>
      </div>

      <!-- 上传图片 -->
      <div class="form-row">
        <label class="form-label">上传图片</label>
        <div class="upload-section">
          <div class="upload-info">
            已上传 {{ previewImages.length }} 张，最多 9 张
          </div>
          <input
            ref="imageInput"
            type="file"
            multiple
            accept="image/*"
            @change="handleImageUpload"
            class="hidden-input"
          />
          <button
            type="button"
            @click="triggerImageUpload"
            class="upload-btn"
            :disabled="previewImages.length >= 9"
          >
            选择图片
          </button>
          
          <!-- 图片预览 -->
          <div v-if="previewImages.length > 0" class="image-preview-container">
            <div
              v-for="(image, index) in previewImages"
              :key="index"
              class="image-preview-item"
            >
              <img :src="image.url" :alt="`预览图片 ${index + 1}`" class="preview-image" />
              <button
                type="button"
                @click="removeImage(index)"
                class="remove-image-btn"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 是否匿名 -->
      <div class="form-row">
        <label class="form-label">是否匿名</label>
        <div class="radio-group">
          <label class="radio-option">
            <input
              type="radio"
              v-model="formData.anonymous"
              :value="false"
              name="anonymous"
            />
            <span class="radio-label">实名</span>
          </label>
          <label class="radio-option">
            <input
              type="radio"
              v-model="formData.anonymous"
              :value="true"
              name="anonymous"
            />
            <span class="radio-label">匿名</span>
          </label>
        </div>
      </div>

      <!-- 是否隐藏 -->
      <div class="form-row">
        <label class="form-label">是否隐藏</label>
        <div class="radio-group">
          <label class="radio-option">
            <input
              type="radio"
              v-model="formData.private"
              :value="false"
              name="private"
            />
            <span class="radio-label">公开</span>
          </label>
          <label class="radio-option">
            <input
              type="radio"
              v-model="formData.private"
              :value="true"
              name="private"
            />
            <span class="radio-label">隐藏</span>
          </label>
        </div>
      </div>

      <!-- 定时发布 -->
      <div class="form-row">
        <label class="form-label">定时发布</label>
        <div class="datetime-section">
          <input
            type="datetime-local"
            v-model="publishDateTime"
            class="datetime-input"
            :min="minDateTime"
            :max="maxDateTime"
          />
          <p class="help-text">
            可设置为 7 天内定时发布，留空则为立即发布
          </p>
        </div>
      </div>

      <!-- 发布按钮 -->
      <div class="form-row">
        <div class="form-label"></div>
        <button
          type="submit"
          class="publish-btn"
          :disabled="isSubmitting || !formData.content.trim()"
        >
          <img src="@/assets/icons/paper-airplane-24.svg" alt="发布表白" class="publish-icon">
          <span>{{ isSubmitting ? '发布中...' : '发布' }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useConfessionStore } from '@/stores/confessionStore';

const router = useRouter();
const confessionStore = useConfessionStore();

// 表单数据
const formData = ref({
  content: '',
  anonymous: false,
  private: false,
  images: []
});

// 图片相关
const imageInput = ref(null);
const previewImages = ref([]);

// 定时发布
const publishDateTime = ref('');

// 提交状态
const isSubmitting = ref(false);

// 计算最小和最大时间
const minDateTime = computed(() => {
  const now = new Date();
  return now.toISOString().slice(0, 16);
});

const maxDateTime = computed(() => {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  return maxDate.toISOString().slice(0, 16);
});

// 触发图片上传
const triggerImageUpload = () => {
  imageInput.value?.click();
};

// 处理图片上传
const handleImageUpload = (event) => {
  const files = Array.from(event.target.files);
  
  files.forEach(file => {
    // 检查是否超过数量限制
    if (previewImages.value.length >= 9) {
      alert('最多只能上传 9 张图片');
      return;
    }
    
    if (file.type.startsWith('image/')) {
      // 检查文件大小（限制为 5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过 5MB');
        return;
      }
      
      // 添加到表单数据
      formData.value.images.push(file);
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImages.value.push({
          url: e.target.result,
          file: file
        });
      };
      reader.readAsDataURL(file);
    }
  });
  
  // 清空input以允许重复选择相同文件
  event.target.value = '';
};

// 移除图片
const removeImage = (index) => {
  formData.value.images.splice(index, 1);
  previewImages.value.splice(index, 1);
};

// 格式化时间为 ISO 8601 格式
const formatPublishTime = (dateTimeString) => {
  if (!dateTimeString) return '';
  
  const date = new Date(dateTimeString);
  // 转换为中国时区的 ISO 8601 格式
  const chinaOffset = 8 * 60; // 中国时区偏移量（分钟）
  const localOffset = date.getTimezoneOffset();
  const chinaTime = new Date(date.getTime() + (chinaOffset + localOffset) * 60 * 1000);
  
  return chinaTime.toISOString().replace('Z', '+08:00');
};

// 处理表白发布
const handlePostConfession = async () => {
  if (isSubmitting.value) return;
  
  if (!formData.value.content.trim()) {
    alert('请输入表白内容');
    return;
  }
  
  isSubmitting.value = true;
  
  try {
    // 准备发布数据
    const postData = {
      content: formData.value.content.trim(),
      anonymous: formData.value.anonymous,
      private: formData.value.private,
      images: formData.value.images.length > 0 ? formData.value.images : undefined,
      publishTime: publishDateTime.value ? formatPublishTime(publishDateTime.value) : undefined
    };
    
    const result = await confessionStore.publishConfession(postData);
    
    if (result.success) {
      alert('表白发布成功！');
      // 清空表单
      formData.value = {
        content: '',
        anonymous: false,
        private: false,
        images: []
      };
      previewImages.value = [];
      publishDateTime.value = '';
      
      // 跳转到首页或个人页面
      router.push('/');
    } else {
      alert(result.message || '发布失败，请重试');
    }
  } catch (error) {
    console.error('发布表白失败:', error);
    alert('发布失败，请重试');
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(() => {
  // 页面加载时的初始化操作
});
</script>

<style scoped>
.main-box {
  max-width: 1000px;
  width: 100%;
  margin: 2rem auto;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);;
  padding: 2rem;
  overflow: hidden;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 2rem;
  text-align: left;
}

.confession-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 1rem;
  align-items: start;
}

.form-label {
  font-size: 1rem;
  font-weight: 500;
  color: #555;
}

.content-textarea {
  width: 100%;
  min-height: 150px;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s ease;
  box-sizing: border-box;
}

.content-textarea:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-info {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.hidden-input {
  display: none;
}

.upload-btn {
  align-self: flex-start;
  padding: 0.5rem 1rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.upload-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.upload-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.image-preview-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  max-width: 100%;
  overflow: hidden;
}

.image-preview-item {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #ddd;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 24px;
  height: 24px;
  background-color: rgba(231, 76, 60, 0.8);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.remove-image-btn:hover {
  background-color: rgba(192, 57, 43, 0.9);
}

.radio-group {
  display: flex;
  gap: 1rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.radio-option input[type="radio"] {
  margin: 0;
  width: 16px;
  height: 16px;
  accent-color: #3498db;
}

.radio-option input[type="radio"]:checked {
  background-color: #3498db;
  border-color: #3498db;
}

.radio-label {
  font-size: 0.9rem;
  color: #666;
}

.datetime-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.datetime-input {
  width: 12rem;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.datetime-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.1);
}

.help-text {
  font-size: 0.85rem;
  color: #666;
  margin: 0;
  line-height: 1.4;
}

.publish-btn {
  align-self: flex-start;
  padding: 0.5rem 1.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
  width: 7rem;
  height: 2.5rem;
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.publish-icon {
  width: 16px;
  height: 16px;
  filter: brightness(0) invert(1); /* 将SVG图标变为白色 */
}

.publish-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.publish-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-box {
    margin: 1rem;
    padding: 1.5rem;
    max-width: calc(100% - 2rem);
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .form-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .form-label {
    padding-top: 0;
  }
  
  .image-preview-item {
    width: 100px;
    height: 100px;
  }
  
  .radio-group {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
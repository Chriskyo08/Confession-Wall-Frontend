import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';
import type {
  RegisterInfo,
  RegisterResponse,
  LoginInfo,
  LoginResponse,
  UserProfile,
  UserByIdResponse,
  UpdateNicknameResponse,
  UpdatePasswordInfo,
  UpdatePasswordResponse,
  UploadAvatarResponse,
  BlockUserResponse,
  UnblockUserResponse,
  BlacklistResponse
} from '@/types/userType';

export const useUserStore = defineStore('user', () => {
  // 状态
  const token = ref<string | null>(null);
  const userInfo = ref<UserProfile | null>(null);

  // 计算属性：判断是否已登录
  const isLoggedIn = computed(() => {
    return token.value !== null && token.value !== '';
  });

  // 注册方法
  const register = async (registerInfo: RegisterInfo) => {
    try {
      const response = await request.post<RegisterResponse>('/api/auth/register', registerInfo);
      return {
        success: true,
        data: response.data,
        message: response.data.msg || '注册成功'
      };
    } catch (error: any) {
      console.error('注册失败:', error);
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || '注册失败，请重试'
      };
    }
  };

  // 登录方法
  const login = async (loginInfo: LoginInfo) => {
    try {
      const response = await request.post<LoginResponse>('/api/auth/login', loginInfo);

      // 保存 token 和用户信息
      token.value = response.data.data.token;
      localStorage.setItem('token', token.value);
      await fetchUserInfo();

      return {
        success: true,
        data: response.data
      };
    } catch (error: any) {
      console.error('登录失败:', error);
      return {
        success: false,
        message: error.response?.data?.message || '登录失败，请重试'
      };
    }
  };

  // 登出方法
  const logout = (router?: any) => {
    // 清除状态
    token.value = null;
    userInfo.value = null;

    // 清除 localStorage 中的数据
    localStorage.removeItem('token');
    localStorage.removeItem('user-store');

    // 如果提供了 router，则进行重定向
    if (router) {
      router.push( {name: 'Homepage' } );
    }
  };

  // 获取当前用户信息
  const fetchUserInfo = async () => {
    if (!token.value) return;

    try {
      const response = await request.get<UserProfile>('/api/user/profile');

      if (response.status === 401) {
        logout();
        return { success: false, message: response.statusText };
      }


      userInfo.value = response.data;
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
      // 如果 token 无效，清除登录状态
      if (error.response?.status === 401) {
        logout();
      }
      return { success: false, message: '获取用户信息失败' };
    }
  };

  // 获取指定用户信息（昵称、头像）
  const fetchUserById = async (userId: number) => {
    try {
      const response = await request.get<UserByIdResponse>(`/api/user/detail`, {
        params: { user_id: userId }
      });

      if (response.data.code === 200) {
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.msg };
      }
    } catch (error: any) {
      console.error('获取用户信息失败:', error);
      return { success: false, message: '获取用户信息失败' };
    }
  }

  // 修改昵称
  const updateNickname = async (newNickname: string) => {
    if (!token.value) {
      return { success: false, message: '未登录' };
    }

    try {
      const response = await request.put<UpdateNicknameResponse>('/api/user/nickname', {
        nickname: newNickname
      });

      if (response.data.code === 200 && response.data.data) {
        // 更新本地用户信息
        if (userInfo.value) {
          userInfo.value.nickname = response.data.data.nickname;
        }
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.msg };
      }
    } catch (error: any) {
      console.error('修改昵称失败:', error);
      return { success: false, message: '修改昵称失败' };
    }
  }

  // 修改密码
  const updatePassword = async (passwordInfo: UpdatePasswordInfo) => {
    if (!token.value) {
      return { success: false, message: '未登录' };
    }

    try {
      const response = await request.put<UpdatePasswordResponse>('/api/user/password', passwordInfo);

      if (response.data.code === 200) {
        // 如果返回了新的 token，更新本地 token
        if (response.data.token) {
          token.value = response.data.token;
          localStorage.setItem('token', token.value);
        }
        return { success: true, message: response.data.msg };
      } else {
        return { success: false, message: response.data.msg };
      }
    } catch (error: any) {
      console.error('修改密码失败:', error);
      return { success: false, message: '修改密码失败' };
    }
  }

  // 上传头像
  const uploadAvatar = async (file: File) => {
    if (!token.value) {
      return { success: false, message: '未登录' };
    }

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await request.put<UploadAvatarResponse>('/api/user/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.code === 200) {
        // 更新本地用户信息
        if (userInfo.value) {
          userInfo.value.avatar = response.data.data.avatar;
        }
        return { success: true, data: response.data.data };
      } else {
        return { success: false, message: response.data.msg };
      }
    } catch (error: any) {
      console.error('上传头像失败:', error);
      return { success: false, message: '上传头像失败' };
    }
  }

  // 拉黑用户
  const blockUser = async (userId: number) => {
    if (!token.value) {
      return { success: false, message: '未登录' };
    }

    try {
      const response = await request.post<BlockUserResponse>('/api/blacklist/add', { user_id: userId });

      if (response.data.code === 200) {
        return { success: true, message: response.data.msg };
      } else {
        return { success: false, message: response.data.msg };
      }
    } catch (error: any) {
      console.error('拉黑用户失败:', error);
      return { success: false, message: '拉黑用户失败' };
    }
  }

  // 取消拉黑用户
  const unblockUser = async (userId: number) => {
    if (!token.value) {
      return { success: false, message: '未登录' };
    }

    try {
      const response = await request.post<UnblockUserResponse>('/api/blacklist/remove', { user_id: userId });

      if (response.data.code === 200) {
        return { success: true, message: response.data.msg };
      } else {
        return { success: false, message: response.data.msg };
      }
    } catch (error: any) {
      console.error('取消拉黑用户失败:', error);
      return { success: false, message: '取消拉黑用户失败' };
    }
  }

  // 获取拉黑列表
  const fetchBlacklist = async () => {
    if (!token.value) {
      return { success: false, message: '未登录' };
    }

    try {
      const response = await request.get<BlacklistResponse>('/api/blacklist/list');

      if (response.data.code === 200) {
        return { success: true, data: response.data.data.userList };
      } else {
        return { success: false, message: response.data.total };
      }
    } catch (error: any) {
      console.error('获取拉黑列表失败:', error);
      return { success: false, message: '获取拉黑列表失败' };
    }
  }

  // 初始化：从 localStorage 恢复 token
  const initAuth = () => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      token.value = savedToken;
      fetchUserInfo();
    }
  };

  return {
    // 状态
    token,
    userInfo,
    // 计算属性
    isLoggedIn,
    // 方法
    login,
    register,
    logout,
    fetchUserInfo,
    fetchUserById,
    updateNickname,
    updatePassword,
    uploadAvatar,
    blockUser,
    unblockUser,
    fetchBlacklist,
    initAuth
  };
}, {
  persist: true
});
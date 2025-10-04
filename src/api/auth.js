import axios from 'axios';

// 登录接口
export const loginAPI = (username, password) => {
  return axios.post('/api/auth/login', {
    username,
    password,
  });
};
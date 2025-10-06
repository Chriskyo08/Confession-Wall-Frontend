import axios from 'axios';

// 创建 axios 实例
const request = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, // 所有环境都使用环境变量
    timeout: 5000, // 请求超时时间
    withCredentials: true // 允许跨域请求携带凭证
});

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 从 localStorage 获取 token
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export default request;
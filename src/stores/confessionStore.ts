import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';
import type {
    PostConfessionRequest,
    PostConfessionResponse,
    UpdateConfessionRequest,
    UpdateConfessionResponse,
    ConfessionListResponse,
    UserConfessionListResponse,
    ConfessionDetailResponse,
    LikeConfessionResponse,
    DeleteConfessionResponse,
    ConfessionHotListResponse
} from '@/types/confessionType'

export const useConfessionStore = defineStore('confession', () => {
    // 状态
    const token = ref(
        localStorage.getItem('token')
        ? localStorage.getItem('token')
        : null
    );

    const userInfo = ref(
        localStorage.getItem('userInfo')
        ? JSON.parse(localStorage.getItem('userInfo') as string)
        : null
    );

    // 发布表白方法
    const publishConfession = async (postConfessionRequest: PostConfessionRequest) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.post<PostConfessionResponse>('/api/confession/post', postConfessionRequest);
            return {
                success: true,
                data: response.data,
                message: response.data.msg || '表白发布成功'
            };
        } catch (error: any) {
            console.error('注册失败:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || '表白发布失败，请重试'
            };
        }
    };

    // 更新表白方法
    const updateConfession = async (updateConfessionRequest: UpdateConfessionRequest) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const formData = new FormData();
            formData.append('confession_id', String(updateConfessionRequest.confession_id));
            formData.append('content', updateConfessionRequest.content);
            formData.append('anonymous', String(updateConfessionRequest.anonymous));
            formData.append('private', String(updateConfessionRequest.private));

            // 如果有图片，则添加到 formData
            if (updateConfessionRequest.images && updateConfessionRequest.images.length > 0) {
                updateConfessionRequest.images.forEach(image => {
                    formData.append('images', image);
                });
            }

            // 如果有发布时间，则添加到 formData
            if (updateConfessionRequest.publish_time) {
                formData.append('publish_time', updateConfessionRequest.publish_time);
            }

            const response = await request.post<UpdateConfessionResponse>('/api/confession/update', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            return {
                success: true,
                data: response.data,
                message: response.data.msg || '表白更新成功'
            };
        } catch (error: any) {
            console.error('表白更新失败:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || '表白更新失败，请重试'
            };
        }
    };

    // 获取表白列表（社区）方法
    const confessionList = async (page: number, pageLimit: number) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.get<ConfessionListResponse>(`/api/confession/list`, {
                params: {
                    Page: page,
                    PageLimit: pageLimit
                }
            });

            if (response.data.code === 200) {
                return {
                    success: true, data: response.data.data, message: response.data.msg || '获取表白列表成功'
                };
            } else {
                return {
                    success: false, data: null, message: response.data.msg || '获取表白列表失败'
                };
            } 
        } catch (error: any) {
            console.error('获取表白列表失败:', error);
            return { success: false, data: null, message: '获取表白列表失败' };
        }
    };

    // 获取个人表白列表方法
    const userConfessionList = async (userId: number, page: number, pageLimit: number) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.get<UserConfessionListResponse>(`/api/confession/user`, {
                params: {
                    user_id: userId,
                    Page: page,
                    PageLimit: pageLimit
                }
            });

            if (response.data.code === 200) {
                return {
                    success: true, data: response.data.data, message: response.data.msg || '获取个人表白列表成功'
                };
            } else {
                return {
                    success: false, data: null, message: response.data.msg || '获取个人表白列表失败'
                };
            }
        } catch (error: any) {
            console.error('获取个人表白列表失败:', error);
            return { success: false, data: null, message: '获取个人表白列表失败' };
        }
    };

    // 获取表白详情方法
    const confessionDetail = async (confessionId: number) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.get<ConfessionDetailResponse>(`/api/confession/detail`, {
                params: {
                    id: confessionId
                }
            });

            if (response.status === 200) {
                return {
                    success: true, data: response.data, message: '获取表白详情成功'
                };
            } else {
                return {
                    success: false, data: null, message: '获取表白详情失败'
                };
            }
        } catch (error: any) {
            console.error('获取表白详情失败:', error);
            return { success: false, data: null, message: '获取表白详情失败' };
        }
    };

    // 操作表白点赞（点赞或取消点赞）方法
    const likeConfession = async (confessionId: number) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.post<LikeConfessionResponse>(`/api/confession/like`, {
                confession_id: confessionId
            });

            if (response.data.code === 200) {
                return {
                    success: true, data: response.data.data, message: response.data.msg || '操作点赞成功'
                };
            } else {
                return {
                    success: false, data: null, message: response.data.msg || '操作点赞失败'
                };
            }
        } catch (error: any) {
            console.error('操作表白点赞失败:', error);
            return { success: false, data: null, message: '操作点赞失败' };
        }
    };

    // 删除表白方法
    const deleteConfession = async (confessionId: number) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.delete<DeleteConfessionResponse>(`/api/confession/delete`, {
                params: {
                    confession_id: confessionId
                }
            });

            if (response.data.code === 200) {
                return {
                    success: true, data: response.data, message: response.data.msg || '删除表白成功'
                };
            } else {
                return {
                    success: false, data: null, message: response.data.msg || '删除表白失败'
                };
            }
        } catch (error: any) {
            console.error('删除表白失败:', error);
            return { success: false, data: null, message: '删除表白失败' };
        }
    };

    // 获取表白热度榜单方法
    const confessionHotList = async () => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.get<ConfessionHotListResponse>(`/api/confession/hot`);

            if (response.status === 200) {
                return {
                    success: true, data: response.data.data, message: '获取表白热度榜单成功'
                };
            } else {
                return {
                    success: false, data: null, message: '获取表白热度榜单失败'
                };
            }
        } catch (error: any) {
            console.error('获取表白热度榜单失败:', error);
            return { success: false, data: null, message: '获取表白热度榜单失败' };
        }
    };

    return {
        // 状态
        token,
        userInfo,
        // 方法
        publishConfession,
        updateConfession,
        confessionList,
        userConfessionList,
        confessionDetail,
        likeConfession,
        deleteConfession,
        confessionHotList
    };
}, {
    persist: true
});
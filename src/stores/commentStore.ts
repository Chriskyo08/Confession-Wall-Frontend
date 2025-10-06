import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import request from '@/utils/request';
import type {
    PostCommentRequest,
    PostCommentResponse,
    FetchCommentListResponse,
    DeleteCommentResponse
} from '@/types/commentType'

export const useCommentStore = defineStore('comment', () => {
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

    // 发表评论方法
    const postComment = async (postCommentRequest: PostCommentRequest) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.post<PostCommentResponse>('/api/confession/comment', postCommentRequest);
            return {
                success: true,
                data: response.data,
                message: response.data.msg || '评论发布成功'
            };
        } catch (error: any) {
            console.error('评论发布失败:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || '评论发布失败，请重试'
            };
        }
    };

    // 获取评论列表方法
    const fetchCommentList = async (confessionId: number) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.get<FetchCommentListResponse>(`/api/confession/comment`, {
                params: {
                    confession_id: confessionId
                }
            });

            if (response.data.code === 200) {
                return {
                    success: true,
                    data: response.data.data,
                    message: response.data.msg || '获取评论列表成功'
                };
            } else {
                return {
                    success: false,
                    data: null,
                    message: response.data.msg || '获取评论列表失败'
                };
            }
        } catch (error: any) {
            console.error('获取评论列表失败:', error);
            return {
                success: false,
                data: null,
                message: error.response?.data?.message || '获取评论列表失败'
            };
        }
    }

    // 删除评论方法
    const deleteComment = async (commentId: number) => {
        if (!token.value) {
            return { success: false, message: '未登录' };
        } try {
            const response = await request.delete<DeleteCommentResponse>(`/api/confession/comment`, {
                params: {
                    comment_id: commentId
                }
            });

            if (response.data.code === 200) {
                return {
                    success: true,
                    message: response.data.msg || '删除评论成功'
                };
            } else {
                return {
                    success: false,
                    message: response.data.msg || '删除评论失败'
                };
            }
        } catch (error: any) {
            console.error('删除评论失败:', error);
            return {
                success: false,
                message: '删除评论失败'
            };
        }
    }

    return {
        // 状态
        token,
        userInfo,
        // 方法
        postComment,
        fetchCommentList,
        deleteComment
    };
}, {
    persist: true,
});
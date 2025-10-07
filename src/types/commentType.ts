// 发表评论请求
export interface PostCommentRequest {
    confession_id: number;
    content: string;
    parentId?: number; // 可选，回复评论时使用
}

// 发表评论返回值
export interface PostCommentResponse {
    code: number;
    msg: string;
    token?: string;
}

// 评论类型
export interface Comment {
    ID: number;
    userId: number;
    confession_id: number;
    content: string;
    createdAt: string;
    user: {
        id: number;
        nickname: string;
        username: string;
        avatar: string;
        createAt: string;
        changeAt: string;
    };
}

// 获取评论列表返回值
export interface FetchCommentListResponse {
    code: number;
    data: Comment[];
    msg: string;
}

// 删除评论返回值
export interface DeleteCommentResponse {
    code: number;
    msg: string;
    token?: string;
}
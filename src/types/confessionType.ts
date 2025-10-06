// 发布表白请求
export interface PostConfessionRequest {
  content: string;
  anonymous: boolean; // 是否匿名
  private: boolean; // 是否私密
  images?: File[]; // 可选，图片文件
  publishTime?: string; // 可选，发布时间
}

// 发布表白返回值
export interface PostConfessionResponse {
  code: number;
  msg: string;
  token?: string;
}

// 更新表白返回值
export interface UpdateConfessionResponse {
  code: number;
  msg: string;
  token?: string;
}

// 表白类型
export interface Confession {
  ID: number;
  userId: number;
  content: string;
  images?: string[];
  Anonymous: boolean; // 是否匿名
  Private: boolean; // 是否私密
  viewCount: number;
  likeCount: number;
  publishedAt: string;
  changedAt: string;
}

// 获取表白列表（社区）返回值
export interface ConfessionListResponse {
  code: number;
  data: Confession[];
  msg: string;
}

// 获取个人表白列表返回值
export interface UserConfessionListResponse {
  code: number;
  data: Confession;
  msg: string;
}

// 获取表白详情返回值
export interface ConfessionDetailResponse {
  data: Confession;
  liked: boolean;
}

// 操作表白点赞（点赞或取消点赞）返回值
export interface LikeConfessionResponse {
  code: number;
  data: {
    liked: boolean;
  };
  msg: string;
}

// 删除表白返回值
export interface DeleteConfessionResponse {
  code: number;
  msg: string;
  token?: string;
}

// 获取表白热度榜单返回值
export interface ConfessionHotListResponse {
  data: Confession[];
}
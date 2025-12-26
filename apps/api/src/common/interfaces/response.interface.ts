/**
 * 统一 API 响应格式接口
 */
export interface ApiResponse<T = any> {
  /**
   * 业务状态码
   * 0: 成功
   * 4xxxx: 业务失败
   * 5xxxx: 接口失败
   */
  code: number;

  /**
   * 响应消息
   */
  message: string;

  /**
   * 响应数据
   */
  data?: T;

  /**
   * 时间戳
   */
  timestamp: number;

  /**
   * 请求路径
   */
  path: string;

  /**
   * 请求追踪 ID
   */
  requestId: string;

  /**
   * 响应时间（毫秒）
   */
  duration: number;
}

/**
 * 分页信息接口
 */
export interface PaginationInfo {
  /**
   * 当前页码（从 1 开始）
   */
  page: number;

  /**
   * 每页数量
   */
  pageSize: number;

  /**
   * 总记录数
   */
  total: number;

  /**
   * 总页数
   */
  totalPages: number;

  /**
   * 是否有上一页
   */
  hasPrevious: boolean;

  /**
   * 是否有下一页
   */
  hasNext: boolean;
}

/**
 * 分页响应格式接口
 */
export interface PagedApiResponse<T = any> extends ApiResponse<T[]> {
  /**
   * 分页信息
   */
  pagination: PaginationInfo;
}

/**
 * 分页数据输入接口
 * Controller 返回的分页数据格式
 */
export interface PagedData<T = any> {
  /**
   * 数据列表
   */
  items: T[];

  /**
   * 总记录数
   */
  total: number;
}

/**
 * Express 类型扩展
 * 为 Request 对象添加自定义属性
 */
declare namespace Express {
  export interface Request {
    /**
     * 请求唯一标识符,用于请求追踪
     */
    requestId?: string;

    /**
     * 请求开始时间戳(毫秒)
     */
    startTime?: number;
  }
}

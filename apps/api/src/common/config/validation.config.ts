/**
 * 验证配置
 */
export const ValidationConfig = {
  /**
   * 错误消息格式
   * - 'full': 显示所有错误 (默认)
   * - 'summary': 显示字段数量摘要
   * - 'first': 只显示第一个错误
   */
  messageFormat: 'full' as 'full' | 'summary' | 'first',

  /**
   * 最大显示错误数量（仅当 messageFormat 为 'full' 时有效）
   * 0 表示无限制
   */
  maxErrors: 0,
};

/**
 * 图片相关工具函数
 */

/**
 * R2 静态资源基础 URL
 */
const R2_BASE_URL = process.env.NUXT_PUBLIC_R2_URL || 'https://blogimg.wangdengfeng.top'

/**
 * 获取完整的头像 URL
 * @param avatar - 头像路径
 * @returns 完整的头像 URL,如果没有头像则返回空字符串
 */
export function getAvatarUrl(avatar?: string): string {
  if (!avatar) return ''

  // 如果已经是完整 URL,直接返回
  if (avatar.startsWith('http://') || avatar.startsWith('https://')) {
    return avatar
  }

  // 拼接 R2 基础 URL
  return `${R2_BASE_URL}/${avatar}`
}

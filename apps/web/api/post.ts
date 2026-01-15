/**
 * 文章相关 API
 */
import { apiGet } from '~/utils/api'
import type { Post } from '@my/prisma'

// 扩展 Post 类型，包含关联数据
export interface PostWithRelations extends Post {
  author: {
    id: string
    nickname: string
  }
  category?: {
    id: string
    name: string
    slug: string
  }
  tags?: {
    id: string
    name: string
    slug: string
  }[]
}

/**
 * 获取文章列表
 * @param published - 是否只显示已发布文章，默认 true
 */
export function getPosts(published = true) {
  return apiGet<PostWithRelations[]>(`/posts?published=${published}`, { auth: false })
}

/**
 * 获取文章详情
 * @param id - 文章 ID
 */
export function getPostById(id: string) {
  return apiGet<PostWithRelations>(`/posts/${id}`, { auth: false })
}

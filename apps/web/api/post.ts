/**
 * 文章相关 API
 */
import { apiGet, apiPost, apiPatch, apiDelete } from '~/utils/api'
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
 * 获取所有文章（包括草稿，用于管理后台）
 */
export function getAllPosts() {
  return apiGet<PostWithRelations[]>('/posts?published=false', { auth: true })
}

/**
 * 获取文章详情
 * @param id - 文章 ID
 */
export function getPostById(id: string) {
  return apiGet<PostWithRelations>(`/posts/${id}`, { auth: false })
}

/**
 * 创建文章
 * @param data - 文章数据
 */
export interface CreatePostData {
  title: string
  slug: string
  content: string
  excerpt?: string
  coverImage?: string
  categoryId?: string
  tagIds?: string[]
  published?: boolean
}

export function createPost(data: CreatePostData) {
  return apiPost<Post>('/posts', data)
}

/**
 * 更新文章
 * @param id - 文章 ID
 * @param data - 更新数据
 */
export interface UpdatePostData {
  title?: string
  slug?: string
  content?: string
  excerpt?: string
  coverImage?: string
  categoryId?: string | null
  tagIds?: string[]
  published?: boolean
}

export function updatePost(id: string, data: UpdatePostData) {
  return apiPatch<Post>(`/posts/${id}`, data)
}

/**
 * 删除文章
 * @param id - 文章 ID
 */
export function deletePost(id: string) {
  return apiDelete<Post>(`/posts/${id}`)
}

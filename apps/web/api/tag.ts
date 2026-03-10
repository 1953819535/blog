/**
 * 标签相关 API
 */
import { apiGet, apiPost, apiPatch, apiDelete } from '~/utils/api'
import type { Tag } from '@my/prisma'

// 重新导出类型供其他模块使用
export type { Tag } from '@my/prisma'

/**
 * 获取所有标签
 */
export function getTags() {
  return apiGet<Tag[]>('/tags', { auth: false })
}

/**
 * 获取单个标签
 * @param id - 标签 ID
 */
export function getTagById(id: string) {
  return apiGet<Tag>(`/tags/${id}`, { auth: false })
}

/**
 * 创建标签
 * @param data - 标签数据
 */
export interface CreateTagData {
  name: string
  slug: string
}

export function createTag(data: CreateTagData) {
  return apiPost<Tag>('/tags', data)
}

/**
 * 更新标签
 * @param id - 标签 ID
 * @param data - 更新数据
 */
export interface UpdateTagData {
  name?: string
  slug?: string
}

export function updateTag(id: string, data: UpdateTagData) {
  return apiPatch<Tag>(`/tags/${id}`, data)
}

/**
 * 删除标签
 * @param id - 标签 ID
 */
export function deleteTag(id: string) {
  return apiDelete<Tag>(`/tags/${id}`)
}
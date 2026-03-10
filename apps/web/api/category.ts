/**
 * 分类相关 API
 */
import { apiGet, apiPost, apiPatch, apiDelete } from '~/utils/api'
import type { Category } from '@my/prisma'

// 重新导出类型供其他模块使用
export type { Category } from '@my/prisma'

/**
 * 获取所有分类
 */
export function getCategories() {
  return apiGet<Category[]>('/categories', { auth: false })
}

/**
 * 获取单个分类
 * @param id - 分类 ID
 */
export function getCategoryById(id: string) {
  return apiGet<Category>(`/categories/${id}`, { auth: false })
}

/**
 * 创建分类
 * @param data - 分类数据
 */
export interface CreateCategoryData {
  name: string
  slug: string
  description?: string
}

export function createCategory(data: CreateCategoryData) {
  return apiPost<Category>('/categories', data)
}

/**
 * 更新分类
 * @param id - 分类 ID
 * @param data - 更新数据
 */
export interface UpdateCategoryData {
  name?: string
  slug?: string
  description?: string
}

export function updateCategory(id: string, data: UpdateCategoryData) {
  return apiPatch<Category>(`/categories/${id}`, data)
}

/**
 * 删除分类
 * @param id - 分类 ID
 */
export function deleteCategory(id: string) {
  return apiDelete<Category>(`/categories/${id}`)
}
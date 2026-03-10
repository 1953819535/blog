/**
 * 标签管理 Composable
 * 提供标签的 CRUD 操作和状态管理
 */
import {
  getTags,
  createTag,
  updateTag,
  deleteTag,
  type Tag,
  type CreateTagData,
  type UpdateTagData
} from '~/api'

export const useTag = () => {
  // 标签列表状态
  const tags = useState<Tag[]>('tags', () => [])
  const loading = useState('tags-loading', () => false)
  const error = useState<string | null>('tags-error', () => null)

  /**
   * 获取所有标签
   */
  const fetchTags = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getTags()
      tags.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取标签失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建标签
   */
  const create = async (data: CreateTagData) => {
    loading.value = true
    error.value = null
    try {
      const response = await createTag(data)
      tags.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建标签失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新标签
   */
  const update = async (id: string, data: UpdateTagData) => {
    loading.value = true
    error.value = null
    try {
      const response = await updateTag(id, data)
      const index = tags.value.findIndex(t => t.id === id)
      if (index !== -1) {
        tags.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新标签失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除标签
   */
  const remove = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await deleteTag(id)
      tags.value = tags.value.filter(t => t.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除标签失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据多个 ID 获取标签名称列表
   */
  const getTagNames = (ids: string[] | undefined) => {
    if (!ids || ids.length === 0) return []
    return ids.map(id => tags.value.find(t => t.id === id)?.name || '').filter(Boolean)
  }

  return {
    // 状态
    tags: computed(() => tags.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // 方法
    fetchTags,
    create,
    update,
    remove,
    getTagNames
  }
}
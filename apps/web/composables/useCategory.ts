/**
 * 分类管理 Composable
 * 提供分类的 CRUD 操作和状态管理
 */
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  type Category,
  type CreateCategoryData,
  type UpdateCategoryData
} from '~/api'

export const useCategory = () => {
  // 分类列表状态
  const categories = useState<Category[]>('categories', () => [])
  const loading = useState('categories-loading', () => false)
  const error = useState<string | null>('categories-error', () => null)

  /**
   * 获取所有分类
   */
  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getCategories()
      categories.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取分类失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建分类
   */
  const create = async (data: CreateCategoryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await createCategory(data)
      categories.value.push(response.data)
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建分类失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新分类
   */
  const update = async (id: string, data: UpdateCategoryData) => {
    loading.value = true
    error.value = null
    try {
      const response = await updateCategory(id, data)
      const index = categories.value.findIndex(c => c.id === id)
      if (index !== -1) {
        categories.value[index] = response.data
      }
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新分类失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除分类
   */
  const remove = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await deleteCategory(id)
      categories.value = categories.value.filter(c => c.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除分类失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 根据 ID 获取分类名称
   */
  const getCategoryName = (id: string | undefined) => {
    if (!id) return ''
    return categories.value.find(c => c.id === id)?.name || ''
  }

  return {
    // 状态
    categories: computed(() => categories.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // 方法
    fetchCategories,
    create,
    update,
    remove,
    getCategoryName
  }
}
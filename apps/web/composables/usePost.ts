/**
 * 文章管理 Composable
 * 提供文章的 CRUD 操作和状态管理
 */
import { getPosts, getAllPosts, getPostById, createPost, updatePost, deletePost, type PostWithRelations, type CreatePostData, type UpdatePostData } from '~/api'
import type { Post } from '@my/prisma'

export const usePost = () => {
  // 文章列表状态
  const posts = useState<PostWithRelations[]>('posts', () => [])
  const loading = useState('posts-loading', () => false)
  const error = useState<string | null>('posts-error', () => null)

  /**
   * 获取已发布文章列表（公开页面用）
   */
  const fetchPublishedPosts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getPosts()
      posts.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取文章失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取所有文章（管理后台用）
   */
  const fetchAllPosts = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await getAllPosts()
      posts.value = response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '获取文章失败'
    } finally {
      loading.value = false
    }
  }

  /**
   * 创建文章
   */
  const create = async (data: CreatePostData) => {
    loading.value = true
    error.value = null
    try {
      const response = await createPost(data)
      // 创建后重新获取列表以获取完整的关联数据
      await fetchAllPosts()
      return response.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '创建文章失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 更新文章
   */
  const update = async (id: string, data: UpdatePostData) => {
    loading.value = true
    error.value = null
    try {
      const response = await updatePost(id, data)
      // 更新后重新获取完整的文章数据
      const fullPost = await getPostById(id)
      const index = posts.value.findIndex(p => p.id === id)
      if (index !== -1) {
        posts.value[index] = fullPost.data
      }
      return fullPost.data
    } catch (err) {
      error.value = err instanceof Error ? err.message : '更新文章失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * 删除文章
   */
  const remove = async (id: string) => {
    loading.value = true
    error.value = null
    try {
      await deletePost(id)
      posts.value = posts.value.filter(p => p.id !== id)
    } catch (err) {
      error.value = err instanceof Error ? err.message : '删除文章失败'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // 状态
    posts: computed(() => posts.value),
    loading: computed(() => loading.value),
    error: computed(() => error.value),

    // 方法
    fetchPublishedPosts,
    fetchAllPosts,
    create,
    update,
    remove
  }
}
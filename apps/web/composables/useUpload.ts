/**
 * 文件上传 Composable
 * 提供文件上传和状态管理
 */
import { uploadFile } from '~/api'

export const useUpload = () => {
  // 上传状态
  const uploading = useState('uploading', () => false)
  const progress = useState('upload-progress', () => 0)
  const error = useState<string | null>('upload-error', () => null)
  const uploadedUrl = useState<string | null>('uploaded-url', () => null)

  /**
   * 上传单个文件
   * @param file - 要上传的文件
   * @returns 上传后的文件 URL
   */
  const upload = async (file: File): Promise<string> => {
    uploading.value = true
    progress.value = 0
    error.value = null
    uploadedUrl.value = null

    try {
      // 模拟进度（R2 直传不支持真实进度）
      const progressInterval = setInterval(() => {
        if (progress.value < 90) {
          progress.value += 10
        }
      }, 100)

      const url = await uploadFile(file)

      clearInterval(progressInterval)
      progress.value = 100
      uploadedUrl.value = url

      return url
    } catch (err) {
      error.value = err instanceof Error ? err.message : '上传失败'
      throw err
    } finally {
      uploading.value = false
    }
  }

  /**
   * 重置上传状态
   */
  const reset = () => {
    uploading.value = false
    progress.value = 0
    error.value = null
    uploadedUrl.value = null
  }

  return {
    // 状态
    uploading: computed(() => uploading.value),
    progress: computed(() => progress.value),
    error: computed(() => error.value),
    uploadedUrl: computed(() => uploadedUrl.value),

    // 方法
    upload,
    reset
  }
}
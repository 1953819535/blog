/**
 * 文件上传相关 API
 * 对接 Cloudflare R2 预签名 URL 上传
 */
import { apiPost } from '~/utils/api'

/**
 * 预签名 URL 响应
 */
export interface PresignedUrlResponse {
  uploadUrl: string
  fileUrl: string
  key: string
}

/**
 * 获取上传预签名 URL
 * @param filename - 文件名
 * @param contentType - 文件类型 (如 image/jpeg)
 */
export function getPresignedUrl(filename: string, contentType: string) {
  return apiPost<PresignedUrlResponse>('/r2/presigned-url', {
    filename,
    contentType
  })
}

/**
 * 上传文件到 R2
 * @param file - 要上传的文件
 * @returns 上传后的文件 URL
 */
export async function uploadFile(file: File): Promise<string> {
  // 1. 获取预签名 URL
  const response = await getPresignedUrl(file.name, file.type)
  const { uploadUrl, fileUrl } = response.data

  // 2. 直接上传到 R2
  const uploadResponse = await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type
    }
  })

  if (!uploadResponse.ok) {
    throw new Error(`上传失败: ${uploadResponse.status}`)
  }

  // 3. 返回文件 URL
  return fileUrl
}
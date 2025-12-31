import type { ApiResponse } from '~/types/api'

/**
 * API 基础路径
 */
const API_BASE_URL = process.env.NUXT_PUBLIC_API_BASE_URL || 'http://localhost:3010/api'

/**
 * API 错误类
 */
export class ApiError extends Error {
  code: number
  path: string
  requestId: string
  timestamp: number

  constructor(response: ApiResponse<any>) {
    super(response.message)
    this.name = 'ApiError'
    this.code = response.code
    this.path = response.path
    this.requestId = response.requestId
    this.timestamp = response.timestamp
  }
}

/**
 * 请求配置选项
 */
interface RequestOptions extends RequestInit {
  /** 是否需要认证（自动添加 token），默认为 true */
  auth?: boolean
  /** 自定义 headers */
  headers?: HeadersInit
}

/**
 * 通用的 API 请求函数
 * @param url - 请求路径（相对于 API_BASE_URL）
 * @param options - 请求选项
 * @returns Promise<ApiResponse<T>>
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { auth = true, headers = {}, ...fetchOptions } = options

  // 构建完整 URL
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`

  // 构建请求头
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  }

  // 默认添加 token（除非明确设置 auth: false）
  if (auth) {
    const token = localStorage.getItem('token')
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  try {
    const response = await fetch(fullUrl, {
      ...fetchOptions,
      headers: requestHeaders,
    })

    // 检查 HTTP 状态码
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`)
    }

    const data: ApiResponse<T> = await response.json()

    // 检查业务状态码（后端成功状态码是 0）
    if (data.code !== 0) {
      throw new ApiError(data)
    }

    return data
  } catch (error) {
    // 如果是 ApiError，直接抛出
    if (error instanceof ApiError) {
      throw error
    }

    // 网络错误或其他错误
    throw new Error(error instanceof Error ? error.message : '网络请求失败')
  }
}

/**
 * GET 请求
 */
export async function apiGet<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'GET' })
}

/**
 * POST 请求
 */
export async function apiPost<T = any>(
  url: string,
  body?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: 'POST',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PUT 请求
 */
export async function apiPut<T = any>(
  url: string,
  body?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * PATCH 请求
 */
export async function apiPatch<T = any>(
  url: string,
  body?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, {
    ...options,
    method: 'PATCH',
    body: body ? JSON.stringify(body) : undefined,
  })
}

/**
 * DELETE 请求
 */
export async function apiDelete<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  return apiRequest<T>(url, { ...options, method: 'DELETE' })
}

/**
 * 处理 API 错误的辅助函数
 * @param error - 错误对象
 * @returns 用户友好的错误消息
 */
export function handleApiError(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return '发生未知错误，请稍后重试'
}

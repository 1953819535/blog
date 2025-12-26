import { SetMetadata } from '@nestjs/common';

/**
 * 响应类型枚举
 */
export enum ResponseType {
  STANDARD = 'standard', // 标准响应（默认）
  RAW = 'raw', // 原始响应（不包装）
  PAGED = 'paged', // 分页响应
  FILE = 'file', // 文件响应（不包装）
}

/**
 * 响应类型元数据键
 */
export const RESPONSE_TYPE_KEY = 'responseType';

/**
 * 标准响应装饰器（默认行为，可省略）
 */
export const StandardResponse = () => SetMetadata(RESPONSE_TYPE_KEY, ResponseType.STANDARD);

/**
 * 原始响应装饰器
 * 跳过响应包装，直接返回数据
 *
 * @example
 * ```typescript
 * @Get('raw')
 * @RawResponse()
 * async getRawData() {
 *   return { foo: 'bar' }; // 直接返回 { foo: 'bar' }
 * }
 * ```
 */
export const RawResponse = () => SetMetadata(RESPONSE_TYPE_KEY, ResponseType.RAW);

/**
 * 分页响应装饰器
 * 用于分页数据的特殊包装
 * page 和 pageSize 会自动从请求查询参数中提取
 *
 * @example
 * ```typescript
 * @Get('list')
 * @PagedResponse()
 * async getList(@Query() query: ListQueryDto) {
 *   // page 和 pageSize 会自动从请求参数中获取
 *   // 只需返回 items 和 total
 *   const [items, total] = await this.service.findAndCount(query);
 *   return { items, total };
 * }
 * ```
 */
export const PagedResponse = () => SetMetadata(RESPONSE_TYPE_KEY, ResponseType.PAGED);

/**
 * 文件响应装饰器
 * 用于文件下载、流式响应等场景
 *
 * @example
 * ```typescript
 * @Get('download/:id')
 * @FileResponse()
 * async downloadFile(@Param('id') id: string, @Res() res: Response) {
 *   const file = await this.service.getFile(id);
 *   res.download(file.path);
 * }
 * ```
 */
export const FileResponse = () => SetMetadata(RESPONSE_TYPE_KEY, ResponseType.FILE);

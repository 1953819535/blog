import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { BusinessException } from '../exceptions/business.exception.js';
import { ResponseCode } from '../constants/code.enum.js';
import { ValidationConfig } from '../config/validation.config.js';

/**
 * 自定义验证管道
 * 使用 class-validator 和 class-transformer 实现请求数据验证
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  /**
   * 转换并验证输入数据
   * @param value - 待验证的值
   * @param metadata - 参数元数据
   * @returns 验证通过后的值
   * @throws BusinessException - 验证失败时抛出业务异常
   */
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // 如果没有元类型或不需要验证,直接返回原值
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // 将普通对象转换为类实例
    const object = plainToInstance(metatype, value);

    // 执行验证
    const errors = await validate(object);

    // 如果有验证错误,抛出业务异常
    if (errors.length > 0) {
      const errorMessages = this.formatErrors(errors);
      const message = this.buildErrorMessage(errorMessages);
      // 将详细的验证错误作为 data 传递
      throw new BusinessException(ResponseCode.BAD_REQUEST, message, errorMessages);
    }

    return object;
  }

  /**
   * 判断是否需要验证该类型
   * @param metatype - 类型
   * @returns 是否需要验证
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  /**
   * 格式化验证错误信息
   * @param errors - 验证错误数组
   * @returns 格式化后的错误信息
   */
  private formatErrors(errors: ValidationError[]): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    errors.forEach((error) => {
      if (error.constraints) {
        formattedErrors[error.property] = Object.values(error.constraints);
      }

      // 处理嵌套对象的验证错误
      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatNestedErrors(error.children, error.property);
        Object.assign(formattedErrors, nestedErrors);
      }
    });

    return formattedErrors;
  }

  /**
   * 格式化嵌套对象的验证错误
   * @param errors - 嵌套的验证错误数组
   * @param parentProperty - 父属性名
   * @returns 格式化后的错误信息
   */
  private formatNestedErrors(
    errors: ValidationError[],
    parentProperty: string,
  ): Record<string, string[]> {
    const formattedErrors: Record<string, string[]> = {};

    errors.forEach((error) => {
      const propertyPath = `${parentProperty}.${error.property}`;

      if (error.constraints) {
        formattedErrors[propertyPath] = Object.values(error.constraints);
      }

      if (error.children && error.children.length > 0) {
        const nestedErrors = this.formatNestedErrors(error.children, propertyPath);
        Object.assign(formattedErrors, nestedErrors);
      }
    });

    return formattedErrors;
  }

  /**
   * 构建错误消息
   * @param errors - 格式化后的错误信息
   * @returns 错误消息字符串
   */
  private buildErrorMessage(errors: Record<string, string[]>): string {
    const fieldCount = Object.keys(errors).length;
    const allMessages: string[] = [];

    for (const messages of Object.values(errors)) {
      // 直接使用验证器返回的消息，不添加字段名前缀
      // 因为 class-validator 的消息中已经包含了字段名
      allMessages.push(messages.join(', '));
    }

    // 根据配置格式化错误消息
    switch (ValidationConfig.messageFormat) {
      case 'summary':
        // 摘要模式：只显示字段数量
        return `${fieldCount} 个字段验证失败`;

      case 'first':
        // 首个错误模式：只显示第一个错误
        return allMessages[0] || '数据验证失败';

      case 'full':
      default:
        // 完整模式：显示所有错误（可限制数量）
        const maxErrors = ValidationConfig.maxErrors;
        const messagesToShow =
          maxErrors > 0 ? allMessages.slice(0, maxErrors) : allMessages;

        let result = messagesToShow.join('; ');

        // 如果有更多错误被截断，添加提示
        if (maxErrors > 0 && allMessages.length > maxErrors) {
          result += `; 还有 ${allMessages.length - maxErrors} 个错误`;
        }

        return result;
    }
  }
}

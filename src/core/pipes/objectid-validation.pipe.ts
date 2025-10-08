import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { isValidObjectId, Types } from 'mongoose';

import { DomainException, DomainExceptionCode } from '../exceptions/domain-exception';

// Custom pipe example
// https://docs.nestjs.com/pipes#custom-pipes
@Injectable()
export class ObjectIdValidationTransformationPipe implements PipeTransform {
  transform(value: string, metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — ObjectId
    if (metadata.metatype !== Types.ObjectId) {
      return value;
    }

    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid ObjectId: ${value}`,
      });
    }
    return new Types.ObjectId(value); // Преобразуем строку в ObjectId

    // Если тип не ObjectId, возвращаем значение без изменений
  }
}

/**
 * Not add it globally. Use only locally
 */
@Injectable()
export class ObjectIdValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    // Проверяем, что тип данных в декораторе — ObjectId
    console.log('ObjectIdValidationPipe metadata', metadata);

    if (!isValidObjectId(value)) {
      throw new DomainException({
        code: DomainExceptionCode.BadRequest,
        message: `Invalid ObjectId: ${value}`,
      });
    }

    // Если тип не ObjectId, возвращаем значение без изменений
    return value;
  }
}

import {
  INestApplication,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import {
  DomainException,
  DomainExceptionCode,
  Extension,
} from '../core/exceptions/domain-exception';
import { ObjectIdValidationTransformationPipe } from '../core/pipes/objectid-validation.pipe';

export const errorFormatter = (
  errors: ValidationError[],
  errorMessage?: any,
): Extension[] => {
  const errorsForResponse = errorMessage || [];

  for (const error of errors) {
    if (!error.constraints && error.children?.length) {
      errorFormatter(error.children, errorsForResponse);
    } else if (error.constraints) {
      const constrainKeys = Object.keys(error.constraints);

      for (const key of constrainKeys) {
        errorsForResponse.push({
          message: error.constraints[key]
            ? `${error.constraints[key]}; Received value: ${error?.value}`
            : '',
          field: error.property,
        });
      }
    }
  }

  return errorsForResponse;
};

export function pipesSetup(app: INestApplication) {
  //Глобальный пайп для валидации и трансформации входящих данных.
  //На следующем занятии рассмотрим подробнее
  app.useGlobalPipes(
    new ObjectIdValidationTransformationPipe(),
    new ValidationPipe({
      //class-transformer создает экземпляр dto
      //соответственно применятся значения по-умолчанию
      //и методы классов dto
      transform: true,
      //TODO: почему whitelist ломает логику вывода погинации? {"totalCount": 1,"pagesCount": null, "items": []}
      // whitelist: true,
      stopAtFirstError: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errorFormatter(errors);

        throw new DomainException({
          code: DomainExceptionCode.ValidationError,
          message: 'Validation failed',
          errorsMessages: formattedErrors,
        });
      },
    }),
  );
}

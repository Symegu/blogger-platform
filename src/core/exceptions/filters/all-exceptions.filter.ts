import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { ErrorResponseBody } from '../domain-exception';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    // const status = exception.getStatus();

    const message = exception.message || 'Unknown exception occured.';
    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    const responseBody = this.buildResponseBody(request.url, message);
    response.status(status).json(responseBody);
  }
  private buildResponseBody(
    requestUrl: string,
    message: string,
  ): ErrorResponseBody {
    //TODO: Replace with getter from configService. will be in the following lessons
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      return {
        // timestamp: new Date().toISOString(),
        // path: null,
        // message: 'Some error occurred',
        errorsMessages: [],
        //code: DomainExceptionCode.InternalServerError,
      };
    }

    return {
      // timestamp: new Date().toISOString(),
      // path: requestUrl,
      // message,
      errorsMessages: [],
      // code: DomainExceptionCode.InternalServerError,
    };
  }
}

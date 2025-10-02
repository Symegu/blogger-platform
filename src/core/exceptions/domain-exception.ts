export enum DomainExceptionCode {
  //common
  NotFound = 1,
  BadRequest = 2,
  InternalServerError = 3,
  Forbidden = 4,
  ValidationError = 5,
  //auth
  Unauthorized = 11,
  EmailNotConfirmed = 12,
  ConfirmationCodeExpired = 13,
  PasswordRecoveryCodeExpired = 14,
  //...
}

export class Extension {
  constructor(
    public message: string,
    public field: string,
  ) {}
}

export class DomainException extends Error {
  message: string;
  code: DomainExceptionCode;
  errorsMessages: Extension[];

  constructor(errorInfo: {
    code: DomainExceptionCode;
    message: string;
    errorsMessages?: Extension[];
  }) {
    super(errorInfo.message);
    this.message = errorInfo.message;
    this.code = errorInfo.code;
    this.errorsMessages =
      errorInfo.errorsMessages && errorInfo.errorsMessages.length > 0
        ? errorInfo.errorsMessages
        : [new Extension(errorInfo.message, 'global')];
  }
}

export type ErrorResponseBody = {
  // timestamp: string;
  // path: string | null;
  // message: string;
  errorsMessages: Extension[];
  //code: DomainExceptionCode;
};

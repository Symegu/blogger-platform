import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IsNumber, IsNotEmpty, IsEnum, IsBoolean, validateSync } from 'class-validator';

export enum Environments {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TESTING = 'testing',
}

export const configValidationUtility = {
  validateConfig: (configInstance: any) => {
    const errors = validateSync(configInstance);
    if (errors.length > 0) {
      const sortedMessages = errors
        .map(error => {
          const currentValue = error.value;
          const constraints = Object.values(error.constraints || {}).join(', ');
          return `😵 ${constraints} (current value: ${currentValue})`;
        })
        .join('; ');
      throw new Error('❌ Validation failed: ' + sortedMessages);
    }
  },
  convertToBoolean(value: string) {
    const trimmedValue = value?.trim();
    if (trimmedValue === 'true') return true;
    if (trimmedValue === '1') return true;
    if (trimmedValue === 'enabled') return true;
    if (trimmedValue === 'false') return false;
    if (trimmedValue === '0') return false;
    if (trimmedValue === 'disabled') return false;

    return null;
  },
  getEnumValues<T extends Record<string, string>>(enumObj: T): string[] {
    return Object.values(enumObj);
  },
};

@Injectable()
export class CoreConfig {
  @IsNumber(
    {},
    {
      message: 'Set Env variable PORT, example: 4000',
    },
  )
  port: number;

  @IsNotEmpty({
    message: 'Set Env variable MONGO_URI, example: mongodb://localhost:27017/my-app-local-db',
  })
  mongoURI: string;

  @IsEnum(Environments, {
    message:
      'Set correct NODE_ENV value, available values: ' +
      configValidationUtility.getEnumValues(Environments).join(', '),
  })
  env: string;

  @IsBoolean({
    message:
      'Set Env variable IS_SWAGGER_ENABLED to enable/disable Swagger, example: true, available values: true, false',
  })
  isSwaggerEnabled: boolean;

  @IsBoolean({
    message:
      'Set Env variable INCLUDE_TESTING_MODULE to enable/disable Dangerous for production TestingModule, example: true, available values: true, false, 0, 1',
  })
  includeTestingModule: boolean;

  constructor(private configService: ConfigService<any, true>) {
    this.port = parseInt(this.configService.get('PORT'));
    this.mongoURI = this.configService.get('MONGO_URI');
    this.env = this.configService.get('NODE_ENV');
    this.isSwaggerEnabled = configValidationUtility.convertToBoolean(
      this.configService.get('IS_SWAGGER_ENABLED'),
    ) as boolean;
    this.includeTestingModule = configValidationUtility.convertToBoolean(
      this.configService.get('INCLUDE_TESTING_MODULE'),
    ) as boolean;

    configValidationUtility.validateConfig(this);
  }
}

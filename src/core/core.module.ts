import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { CoreConfig } from './core.config';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [CqrsModule, CoreConfig],
  exports: [CqrsModule, CoreConfig],

  providers: [],
})
export class CoreModule {}

import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

//глобальный модуль для провайдеров и модулей необходимых во всех частях приложения (например LoggerService, CqrsModule, etc...)
@Global()
@Module({
  imports: [CqrsModule],
  exports: [CqrsModule],

  providers: [],
})
export class CoreModule {}

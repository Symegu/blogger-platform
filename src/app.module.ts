import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreConfig } from './core/core.config';
import { CoreModule } from './core/core.module';
import { AllExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { configModule } from './dynamic-config-module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { TestingModule } from './modules/testing/testing.module';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';

@Module({
  imports: [CoreModule, configModule],
  controllers: [AppController],
  //важен порядок регистрации! Первым сработает DomainHttpExceptionsFilter!
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_FILTER,
      useClass: DomainHttpExceptionsFilter,
    },
  ],
})
export class AppModule {
  static async forRoot(coreConfig: CoreConfig): Promise<DynamicModule> {
    // такой мудрёный способ мы используем, чтобы добавить к основным модулям необязательный модуль.
    // чтобы не обращаться в декораторе к переменной окружения через process.env в декораторе, потому что
    // запуск декораторов происходит на этапе склейки всех модулей до старта жизненного цикла самого NestJS
    const modules: any[] = [
      UserAccountsModule,
      TestingModule,
      BloggersPlatformModule,
      MongooseModule.forRootAsync({
        // если CoreModule не глобальный, то явно импортируем в монгусовский модуль, иначе CoreConfig не заинджектится
        imports: [CoreModule],
        useFactory: (coreConfig: CoreConfig) => {
          // используем DI чтобы достать mongoURI контролируемо
          return {
            uri: coreConfig.mongoURI,
          };
        },
        inject: [CoreConfig],
      }),
    ];

    if (coreConfig.includeTestingModule) {
      modules.push(TestingModule);
    }

    return {
      module: AppModule,
      imports: modules, // Add dynamic modules here
    };
  }
}

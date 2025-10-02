import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserAccountsModule } from './modules/user-accounts/user-accounts.module';
import { CoreModule } from './core/core.module';
import { TestingModule } from './modules/testing/testing.module';
import { BloggersPlatformModule } from './modules/bloggers-platform/bloggers-platform.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from './core/exceptions/filters/all-exceptions.filter';
import { DomainHttpExceptionsFilter } from './core/exceptions/filters/domain-exceptions.filter';
import { NotificationsModule } from './modules/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost/nest-blogger-platform'), // свой URL MongoDB
    NotificationsModule,
    TestingModule,
    UserAccountsModule,
    BloggersPlatformModule,
    CoreModule,
  ],
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
export class AppModule {}

import { DynamicModule } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { CoreConfig } from './core/core.config';

export async function initAppModule(): Promise<DynamicModule> {
  // из-за того, что нам нужно донастроить динамический AppModule, мы не можем сразу создавать приложение,
  // а создаём сначала контекст
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  await appContext.close();

  return AppModule.forRoot(coreConfig);
}

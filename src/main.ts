import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { CoreConfig } from './core/core.config';
import { initAppModule } from './init-app-module';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const DynamicAppModule = await initAppModule();
  // создаём на основе донастроенного модуля наше приложение
  const app = await NestFactory.create(DynamicAppModule);

  const coreConfig = app.get<CoreConfig>(CoreConfig);

  appSetup(app, coreConfig.isSwaggerEnabled); //глобальные настройки приложения

  const port = coreConfig.port;
  app.use(cookieParser());
  await app.listen(port, () => {
    console.log('App starting listen port: ', port);
    console.log('NODE_ENV: ', coreConfig.env);
  });
}
bootstrap();

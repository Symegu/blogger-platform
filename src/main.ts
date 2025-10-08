import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  appSetup(app); //глобальные настройки приложения
  const PORT = process.env.PORT || 3005; //TODO: move to configService. will be in the following lessons
  await app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
  });
}
bootstrap();

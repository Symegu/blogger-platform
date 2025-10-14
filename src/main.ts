import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import { CoreConfig } from './core/core.config';

async function bootstrap() {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('Loaded from:', process.env.MONGO_URI);
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const coreConfig = appContext.get<CoreConfig>(CoreConfig);
  const DynamicAppModule = await AppModule.forRoot(coreConfig);
  const app = await NestFactory.create(DynamicAppModule);

  await appContext.close();

  // Add cookie parser middleware
  app.use(cookieParser());

  if (coreConfig.isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('it-incubator Configuration example')
      .setDescription('The API description')
      .setVersion('1.0')
      .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);
  }

  console.log('process.env.PORT: ', coreConfig.port);
  await app.listen(coreConfig.port);
}
bootstrap();

import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { GLOBAL_PREFIX } from './global-prefix.setup';

export function swaggerSetup(app: INestApplication, isSwaggerEnabled: boolean) {
  if (isSwaggerEnabled) {
    const config = new DocumentBuilder()
      .setTitle('BLOGGER API')
      .setVersion('1.0')
      .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
      })
      .addBasicAuth(
        {
          type: 'http',
          scheme: 'basic',
        },
        'basicAuth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);

    document.components = {
      ...document.components,
      securitySchemes: {
        ...document.components?.securitySchemes,
        refreshToken: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken',
          description: 'JWT refresh token inside cookie',
        },
      },
    };
    SwaggerModule.setup(GLOBAL_PREFIX, app, document, {
      customSiteTitle: 'Blogger Swagger',
      swaggerOptions: {
        withCredentials: true,
        displayRequestDuration: true,
      },
    });
  }
}

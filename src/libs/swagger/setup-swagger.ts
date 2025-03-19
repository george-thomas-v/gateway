import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { tags } from './tags.constant';

export const setup = (app: INestApplication): void => {
  const builder = new DocumentBuilder()
    .setTitle('JK Machine Task')
    .setVersion(process.env.npm_package_version as string)
    .addBearerAuth();

  Object.values(tags).map((tag) => {
    builder.addTag(tag.name, tag.description);
  });

  const config = builder.build();
  const document = SwaggerModule.createDocument(app, config);

  const options = {
    explorer: true,
  };

  SwaggerModule.setup('docs', app, document, options);
};

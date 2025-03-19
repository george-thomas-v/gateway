import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { config } from 'dotenv';
config();

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(String(process.env.DATABASE_PORT)),
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  entities: ['src/data/entities/**/*.entity.ts'],
  migrations: ['src/data/migrations/[!index]*.ts'],
  namingStrategy: new SnakeNamingStrategy(),
  migrationsTableName: 'migrations',
  synchronize: false,
  logging: false,
  uuidExtension: 'pgcrypto',
};

export default new DataSource(dataSourceOptions);

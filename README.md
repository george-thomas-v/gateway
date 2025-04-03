# JK-POC Gateway

## Overview
JK-POC Gateway is a NestJS-based microservice that acts as an API gateway, managing request routing, authentication, and communication between various microservices.

## Features
- Microservices architecture
- Kafka message handling
- Authentication using JWT
- PostgreSQL integration with TypeORM
- API documentation using Swagger

## Installation

```sh
npm install
```

## Environment Variables
Create a `.env` file and configure necessary variables (refer to `.env.example`):

```env
KAFKA_BROKER=kafka:9092
JWT_SECRET=your_jwt_secret
DATABASE_URL=postgres://user:password@localhost:5432/database
```

## Running the Application

### Development Mode
```sh
npm run start:dev
```

### Production Mode
```sh
npm run build
npm run start:prod
```

## Database Migrations

### Create a new migration
```sh
npm run task:migration:create --name=MigrationName
```

### Run migrations
```sh
npm run task:migration:run
```

### Revert the last migration
```sh
npm run task:migration:revert
```

## Testing
Run unit tests:
```sh
npm run test
```
Run e2e tests:
```sh
npm run test:e2e
```

## API Documentation
After running the service, access Swagger documentation at:
```
http://localhost:3000/docs
```

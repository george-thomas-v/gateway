import request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { getConnection } from 'typeorm';
import { EUserRoles } from 'src/data/enums/user.enum';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await getConnection().dropDatabase();
    await app.close();
  });

  it('should register a user', async () => {
    const response = await request(server).post('/auth/register').send({
      email: 'test@example.com',
      password: 'Password123',
      firstName: 'John',
      lastName: 'Doe',
    });

    expect(response.status).toBe(201); 
    expect(response.body).toEqual({
      success: true,
      message: 'User registered successfully',
      data: expect.objectContaining({
        id: expect.any(String),
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: EUserRoles.VIEWER, 
      }),
    });
  });

  it('should login a user', async () => {
    const response = await request(server).post('/auth/login').send({
      email: 'test@example.com',
      password: 'Password123',
    });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'User logged in',
      data: expect.objectContaining({
        accessToken: expect.any(String),
        user: expect.objectContaining({
          id: expect.any(String),
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: EUserRoles.VIEWER, 
        }),
      }),
    });

    accessToken = response.body.data.accessToken;
  });

  it('should logout a user', async () => {
    const response = await request(server)
      .get('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'User logged out successfully', 
    });
  });

  it('should prevent unauthorized role change', async () => {
    const response = await request(server)
      .patch('/auth/role')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ email: 'test@example.com', role: 'ADMIN' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      message: 'Access denied: Only admins can change roles', 
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserRepository, SessionRepository } from 'src/data/repositories';
import { JwtService } from '@nestjs/jwt';
import { Argon2Utils, GetEnvVariables } from '@app/utils';
import { EUserRoles } from '@app/enums';
import {
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { SessionEntity, UserEntity } from '@app/entities';
import {
  LoginCredentialsDto,
  RegisterCredentialsDto,
  ChangeRoleBodyDto,
} from './dto';
import { UpdateResult } from 'typeorm';

describe('AuthService', () => {
  let authService: AuthService;
  let userRepository: jest.Mocked<UserRepository>;
  let sessionRepository: jest.Mocked<SessionRepository>;
  let argon2Utils: jest.Mocked<Argon2Utils>;
  let jwtService: jest.Mocked<JwtService>;
  let getEnvVariables: jest.Mocked<GetEnvVariables>;

  beforeEach(async () => {
    userRepository = {
      getUserAndPassword: jest.fn(),
      getExistingUser: jest.fn(),
      createUserAndPassword: jest.fn(),
      getUserAndSession: jest.fn(),
      changeUserRole: jest.fn(),
    } as any;

    sessionRepository = {
      createSession: jest.fn(),
      getSessions: jest.fn(),
      removeSession: jest.fn(),
    } as any;

    argon2Utils = {
      verifyPassword: jest.fn(),
      encPassword: jest.fn(),
    } as any;

    jwtService = {
      sign: jest.fn(),
    } as any;

    getEnvVariables = {
      jwtSecret: 'test_secret',
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserRepository, useValue: userRepository },
        { provide: SessionRepository, useValue: sessionRepository },
        { provide: Argon2Utils, useValue: argon2Utils },
        { provide: JwtService, useValue: jwtService },
        { provide: GetEnvVariables, useValue: getEnvVariables },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('login', () => {
    it('should login user and return response', async () => {
      const input: LoginCredentialsDto = {
        email: 'test@example.com',
        password: 'Password123',
      };

      const user = {
        id: '1',
        email: input.email,
        password: [{ password: 'hashed_password' }],
        blockedAt: null,
      } as UserEntity;

      userRepository.getUserAndPassword.mockResolvedValue(user);
      argon2Utils.verifyPassword.mockResolvedValue(true);

      const result = await authService.login(input);
      expect(result).toEqual(user);
    });
  });

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const input: RegisterCredentialsDto = {
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const newUser = <UserEntity>{};
      userRepository.getExistingUser.mockResolvedValue(null);
      argon2Utils.encPassword.mockResolvedValue('hashed_password');
      userRepository.createUserAndPassword.mockResolvedValue(newUser);

      const result = await authService.registerUser(input);
      expect(result).toEqual({
        data: newUser,
        success: true,
        message: 'User registered successfully',
      });
    });

    it('should throw conflict exception if user exists', async () => {
      userRepository.getExistingUser.mockResolvedValue(<UserEntity>{
        email: 'example.com',
      });
      await expect(
        authService.registerUser({
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('logoutUser', () => {
    it('should remove session and return response', async () => {
      sessionRepository.getSessions.mockResolvedValue([
        <SessionEntity>{ id: 'session1', token: 'test_token' },
      ]);
      sessionRepository.removeSession.mockResolvedValue(<UpdateResult>{});

      const result = await authService.logoutUser({
        userId: '1',
        currentToken: 'test_token',
      });
      expect(result).toEqual({
        success: true,
        message: 'User logged out',
      });
    });

    it('should throw BadRequestException if session not found', async () => {
      sessionRepository.getSessions.mockResolvedValue([]);
      await expect(
        authService.logoutUser({ userId: '1', currentToken: 'test_token' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('changeUserRole', () => {
    it('should change user role and return response', async () => {
      const input: ChangeRoleBodyDto = {
        email: 'test@example.com',
        role: EUserRoles.EDITOR,
      };

      const user = { id: '1', email: input.email } as UserEntity;
      userRepository.getUserAndPassword.mockResolvedValue(user);
      userRepository.changeUserRole.mockResolvedValue(<UpdateResult>{});

      const result = await authService.changeUserRole(input);
      expect(result).toEqual({
        success: true,
        message: `User converted to ${input.role}`,
      });
    });
  });
});

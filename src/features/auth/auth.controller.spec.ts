import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity } from '@app/entities';
import {
  LoginResponseDto,
  RegisterResponseDto,
  ChangeRoleResponseDto,
  RegisterCredentialsDto,
} from './dto';
import { EUserRoles } from '@app/enums';
import { ResponseDto, UserDto } from 'src/libs/dto';
import { ChangeRoleBodyDto } from './dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const mockAuthService = {
      createTokens: jest.fn(),
      registerUser: jest.fn(),
      logoutUser: jest.fn(),
      changeUserRole: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('login', () => {
    it('should return access tokens', async () => {
      const user: UserEntity = {
        id: '1',
        email: 'test@example.com',
      } as UserEntity;
      const tokenResponse: LoginResponseDto = {
        data: { accessToken: 'test_token', user },
        success: true,
        message: 'Login successful',
      };

      jest.spyOn(authService, 'createTokens').mockResolvedValue(tokenResponse);

      const result = await authController.login(user);
      expect(result).toEqual(tokenResponse);
      expect(authService.createTokens).toHaveBeenCalledWith(user);
    });
  });

  describe('registerUser', () => {
    it('should return registered user', async () => {
      const registerDto = <RegisterCredentialsDto>{
        email: 'test@example.com',
        password: 'Password123',
        firstName: 'Test',
        lastName: 'User',
      };
      const user = <UserDto>{ id: '1', email: 'test@example.com' };
      const registerResponse = <RegisterResponseDto>{
        data: user,
        success: true,
        message: 'User registered successfully',
      };

      jest
        .spyOn(authService, 'registerUser')
        .mockResolvedValue(registerResponse);

      const result = await authController.registerUser(registerDto);
      expect(result).toEqual(registerResponse);
      expect(authService.registerUser).toHaveBeenCalledWith(registerDto);
    });
  });

  describe('logoutUser', () => {
    it('should logout a user', async () => {
      const user: UserEntity = { id: '1' } as UserEntity;
      const req = { headers: { authorization: 'Bearer test_token' } } as any;
      const response: ResponseDto = {
        success: true,
        message: 'Logged out successfully',
      };

      jest.spyOn(authService, 'logoutUser').mockResolvedValue(response);

      const result = await authController.logoutUser(user, req);
      expect(result).toEqual(response);
      expect(authService.logoutUser).toHaveBeenCalledWith({
        userId: user.id,
        currentToken: 'test_token',
      });
    });
  });

  describe('changeUserRole', () => {
    it('should change user role and return ChangeRoleResponseDto', async () => {
      const input: ChangeRoleBodyDto = {
        email: 'test@example.com',
        role: EUserRoles.EDITOR,
      };
      const changeRoleResponse: ChangeRoleResponseDto = {
        success: true,
        message: 'Role changed successfully',
      };

      jest
        .spyOn(authService, 'changeUserRole')
        .mockResolvedValue(changeRoleResponse);

      const result = await authController.changeUserRole(input);
      expect(result).toEqual(changeRoleResponse);
      expect(authService.changeUserRole).toHaveBeenCalledWith(input);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BlockUserBodyDto, BlocUnblockkUserParamDto } from './dto';
import { EUserRoles } from '@app/enums';
import { UserEntity } from '@app/entities';
import { BlockUserResponseDto, UnblockUserResponseDto } from './dto';

describe('UserController', () => {
  let controller: UserController;
  let userService: UserService;

  const mockUserService = {
    blockUnblockUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('should return current user details', async () => {
      const mockUser: UserEntity = {
        id: 'user123',
        email: 'test@example.com',
        role: EUserRoles.VIEWER,
      } as UserEntity;

      const result = await controller.getCurrentUser(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('blockUser', () => {
    it('should block a user and return response', async () => {
      const param: BlocUnblockkUserParamDto = { email: 'target@example.com' };
      const body: BlockUserBodyDto = { blockReason: 'spam activity' };
      const expectedResult: BlockUserResponseDto = {
        success: true,
        message: 'User blocked successfully',
      };

      mockUserService.blockUnblockUser.mockResolvedValue(expectedResult);

      const result = await controller.blockUser(param, body);

      expect(userService.blockUnblockUser).toHaveBeenCalledWith({
        email: param.email,
        blockReason: body.blockReason,
      });

      expect(result).toEqual(expectedResult);
    });
  });

  describe('unblockUser', () => {
    it('should unblock a user and return response', async () => {
      const param: BlocUnblockkUserParamDto = { email: 'target@example.com' };
      const expectedResult: UnblockUserResponseDto = {
        success: true,
        message: 'User unblocked successfully',
      };

      mockUserService.blockUnblockUser.mockResolvedValue(expectedResult);

      const result = await controller.unblockUser(param);

      expect(userService.blockUnblockUser).toHaveBeenCalledWith({
        email: param.email,
      });

      expect(result).toEqual(expectedResult);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { UserRepository } from 'src/data/repositories';
import { BadRequestException } from '@nestjs/common';
import { UserEntity } from '@app/entities';
import { UserDto } from 'src/libs/dto';

describe('UserService', () => {
  let service: UserService;
  let userRepository: jest.Mocked<UserRepository>;

  beforeEach(async () => {
    const mockUserRepository = {
      getUserAndPassword: jest.fn(),
      blockUser: jest.fn(),
      unblockUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    userRepository = module.get(UserRepository);
  });

  describe('blockUnblockUser', () => {
    const email = 'test@example.com';
    const userId = 'user-123';

    it('should block a user if not blocked already', async () => {
      const mockUser = { id: userId, blockedAt: null };
      const blockReason = 'spam';
      const mockDate = new Date('2025-03-25T17:42:57.375Z'); 
    
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);
    
      userRepository.getUserAndPassword.mockResolvedValue(mockUser as UserEntity);
      userRepository.blockUser.mockResolvedValue(mockDate);
    
      const result = await service.blockUnblockUser({ email, blockReason });
    
      expect(result).toEqual({
        data: mockDate,
        success: true,
        message: 'User blocked successfully',
      });
    
      jest.restoreAllMocks();
    });

    it('should unblock a user if already blocked', async () => {
      const mockUser = { id: userId, blockedAt: new Date() };

      userRepository.getUserAndPassword.mockResolvedValue(mockUser as UserEntity);
      userRepository.unblockUser.mockResolvedValue({
        affected: 1,
        raw: [],
        generatedMaps: [],
      });

      const result = await service.blockUnblockUser({ email });

      expect(userRepository.getUserAndPassword).toHaveBeenCalledWith({ email });
      expect(userRepository.unblockUser).toHaveBeenCalledWith({ userId });
      expect(result).toEqual({
        success: true,
        message: 'User unblocked successfully',
      });
    });

    it('should throw BadRequestException for invalid block action (already blocked)', async () => {
      const mockUser = { id: userId, blockedAt: new Date() };
      userRepository.getUserAndPassword.mockResolvedValue(mockUser as UserEntity);

      await expect(
        service.blockUnblockUser({ email, blockReason: 'spam' }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid unblock action (not blocked)', async () => {
      const mockUser = { id: userId, blockedAt: null };
      userRepository.getUserAndPassword.mockResolvedValue(mockUser as UserEntity);

      await expect(service.blockUnblockUser({ email })).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});

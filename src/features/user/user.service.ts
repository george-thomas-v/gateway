import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/data/repositories';
import {
  BlockUserResponseDto,
  BlocUnblockkUserParamDto,
  UnblockUserResponseDto,
} from './dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async blockUnblockUser(
    input: BlocUnblockkUserParamDto & { blockReason?: string },
  ): Promise<BlockUserResponseDto | UnblockUserResponseDto> {
    const { email, blockReason } = input;
    const user = await this.userRepository.getUserAndPassword({ email });
    if ((user.blockedAt && blockReason) || (!user.blockedAt && !blockReason))
      throw new BadRequestException('Invalid action');
    if (blockReason)
      return {
        data: await this.userRepository.blockUser({
          userId: user.id,
          blockedReason: blockReason,
        }),
        success: true,
        message: 'User blocked successfully',
      };
    await this.userRepository.unblockUser({ userId: user.id });
    return {
      success: true,
      message: 'User unblocked successfully',
    };
  }
}

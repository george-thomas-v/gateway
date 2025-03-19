import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { tags } from 'src/libs/swagger';
import { CurrentUser, Roles } from '@app/libs';
import { UserEntity } from '@app/entities';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { UserDto } from 'src/libs/dto';
import { EUserRoles } from '@app/enums';
import {
  BlockUserBodyDto,
  BlockUserResponseDto,
  BlocUnblockkUserParamDto,
  UnblockUserResponseDto,
} from './dto';

@Controller('user')
@ApiTags(tags.user.name)
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  @ApiResponse({
    status: 404,
    example: {
      statusCode: 404,
      message: 'No user found',
      error: 'Not Found',
    },
  })
  @ApiResponse({
    status: 401,
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    },
  })
  @ApiResponse({
    status: 200,
    type: UserDto,
  })
  async getCurrentUser(@CurrentUser() user: UserEntity): Promise<UserDto> {
    return user;
  }

  @Patch('/:email/block')
  @UseGuards(RolesGuard)
  @Roles(EUserRoles.ADMIN)
  @ApiBody({
    type: BlockUserBodyDto,
  })
  @ApiResponse({
    status: 404,
    example: {
      statusCode: 404,
      message: 'No user found',
      error: 'Not Found',
    },
  })
  @ApiResponse({
    status: 401,
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    },
  })
  @ApiResponse({
    status: 403,
    example: {
      statusCode: 403,
      message: 'Forbidden Resource',
      error: 'Forbidden',
    },
  })
  @ApiResponse({
    status: 400,
    example: {
      statusCode: 400,
      message: 'Invalid action',
      error: 'Bad Request',
    },
  })
  @ApiResponse({
    status: 200,
    type: BlockUserResponseDto,
  })
  async blockUser(
    @Param() input: BlocUnblockkUserParamDto,
    @Body() body: BlockUserBodyDto,
  ): Promise<BlockUserResponseDto> {
    return this.userService.blockUnblockUser({ ...input, ...body });
  }

  @Patch('/:email/unblock')
  @UseGuards(RolesGuard)
  @Roles(EUserRoles.ADMIN)
  @ApiResponse({
    status: 404,
    example: {
      statusCode: 404,
      message: 'No user found',
      error: 'Not Found',
    },
  })
  @ApiResponse({
    status: 401,
    example: {
      statusCode: 401,
      message: 'Unauthorized',
      error: 'Unauthorized',
    },
  })
  @ApiResponse({
    status: 403,
    example: {
      statusCode: 403,
      message: 'Forbidden Resource',
      error: 'Forbidden',
    },
  })
  @ApiResponse({
    status: 400,
    example: {
      statusCode: 400,
      message: 'Invalid action',
      error: 'Bad Request',
    },
  })
  @ApiResponse({
    status: 200,
    type: UnblockUserResponseDto,
  })
  async unblockUser(
    @Param() input: BlocUnblockkUserParamDto,
  ): Promise<UnblockUserResponseDto> {
    return this.userService.blockUnblockUser({ ...input });
  }
}

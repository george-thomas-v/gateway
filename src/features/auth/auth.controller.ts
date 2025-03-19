import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import {
  ChangeRoleBodyDto,
  ChangeRoleResponseDto,
  LoginCredentialsDto,
  LoginResponseDto,
  RegisterCredentialsDto,
  RegisterResponseDto,
} from './dto';
import { JwtAuthGuard, LocalAuthGuard, RolesGuard } from './guards';
import { CurrentUser, ResponseInterceptor, Roles } from '@app/libs';
import { UserEntity } from '@app/entities';
import { tags } from 'src/libs/swagger';
import { ResponseDto } from 'src/libs/dto';
import { EUserRoles } from '@app/enums';

@Controller('auth')
@ApiTags(tags.auth.name)
@ApiBearerAuth()
@UseInterceptors(ResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login a user' })
  @ApiBody({
    type: LoginCredentialsDto,
    description: 'Login credentials',
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
    status: 200,
    type: LoginResponseDto,
  })
  @UseGuards(LocalAuthGuard)
  async login(@CurrentUser() user: UserEntity): Promise<LoginResponseDto> {
    return this.authService.createTokens(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiBody({
    type: RegisterCredentialsDto,
  })
  @ApiResponse({
    status: 409,
    example: {
      statusCode: 409,
      message: 'User already exists',
      error: 'Conflict',
    },
  })
  @ApiResponse({
    status: 200,
    type: RegisterResponseDto,
  })
  async registerUser(
    @Body() input: RegisterCredentialsDto,
  ): Promise<RegisterResponseDto> {
    return this.authService.registerUser(input);
  }

  @Get('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user session' })
  @ApiResponse({
    status: 400,
    example: {
      statusCode: 400,
      message: 'No session found',
      error: 'Bad Request',
    },
  })
  @ApiResponse({
    status: 200,
    type: ResponseDto,
  })
  async logoutUser(
    @CurrentUser() user: UserEntity,
    @Req() req: Request,
  ): Promise<ResponseDto> {
    return this.authService.logoutUser({
      userId: user.id,
      currentToken: req.headers['authorization']?.split(' ')[1],
    });
  }

  @Patch('role')
  @UseGuards(JwtAuthGuard, RolesGuard)
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
    status: 200,
    type: ChangeRoleResponseDto,
  })
  async changeUserRole(@Body() input: ChangeRoleBodyDto):Promise<ChangeRoleResponseDto> {
    return this.authService.changeUserRole({ ...input });
  }
}

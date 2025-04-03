import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ChangeRoleBodyDto,
  ChangeRoleResponseDto,
  LoginCredentialsDto,
  LoginResponseDto,
  RegisterCredentialsDto,
  RegisterResponseDto,
} from './dto';
import { SessionRepository, UserRepository } from 'src/data/repositories';
import { JwtService } from '@nestjs/jwt';
import { ETokenType, JwtUser } from 'src/types/jwt-user.type';
import { UserEntity } from '@app/entities';
import { ResponseDto } from '@app/libs';
import { Argon2Utils, GetEnvVariables } from '@app/utils';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly argon2Utils: Argon2Utils,
    private readonly jwtService: JwtService,
    private readonly getEnvVariables: GetEnvVariables,
  ) {}
  async login(input: LoginCredentialsDto) {
    const { email, password } = input;
    const user = await this.userRepository.getUserAndPassword({ email });
    if (user.blockedAt) throw new UnauthorizedException('Account blocked');
    if (user.password.length === 0)
      throw new UnauthorizedException('User not yet verified');
    if (
      !(await this.argon2Utils.verifyPassword({
        password,
        encPassword: user.password[0]?.password as string,
      }))
    )
      throw new UnauthorizedException('Invalid credentials');
    return user;
  }

  async createTokens(user: UserEntity): Promise<LoginResponseDto> {
    const { id, role } = user;
    const accessToken = this.jwtService.sign(
      <JwtUser>{
        role,
        sub: id,
        type: ETokenType.ACCESS_TOKEN,
      },
      {
        secret: this.getEnvVariables.jwtSecret,
      },
    );

    await this.sessionRepository.createSession({
      userId: user.id,
      token: accessToken,
    });
    return {
      data: {
        accessToken,
        user: { ...user, password: [] },
      },
      success: true,
      message: 'User logged in',
    };
  }

  async validateUserToken(input: { payload: JwtUser; currentToken: string }) {
    const { payload, currentToken } = input;
    const user = await this.userRepository.getUserAndSession({
      userId: payload.sub,
    });
    if (!user.session.find(({ token }) => token === currentToken))
      throw new UnauthorizedException('No session found');
    return user;
  }

  async registerUser(
    input: RegisterCredentialsDto,
  ): Promise<RegisterResponseDto> {
    const { email, password, firstName, lastName } = input;
    const existingUser = await this.userRepository.getExistingUser({ email });
    if (existingUser) throw new ConflictException('User already exists');
    const encPassword = await this.argon2Utils.encPassword({ password });
    return {
      data: await this.userRepository.createUserAndPassword({
        firstName,
        lastName,
        email,
        password: encPassword,
      }),
      success: true,
      message: 'User registered successfully',
    };
  }

  async logoutUser(input: {
    currentToken: string;
    userId: string;
  }): Promise<ResponseDto> {
    const { userId, currentToken } = input;
    const sessions = await this.sessionRepository.getSessions({ userId });
    const session = sessions.find(({ token }) => token === currentToken);
    if (!session) throw new BadRequestException('No session found');
    await this.sessionRepository.removeSession({
      sessionId: session.id,
    });
    return {
      success: true,
      message: 'User logged out',
    };
  }

  async changeUserRole(
    input: ChangeRoleBodyDto,
  ): Promise<ChangeRoleResponseDto> {
    const { email, role } = input;
    const user = await this.userRepository.getUserAndPassword({ email });
    await this.userRepository.changeUserRole({ userId: user.id, role });
    return {
      success: true,
      message: `User converted to ${role}`,
    };
  }
}

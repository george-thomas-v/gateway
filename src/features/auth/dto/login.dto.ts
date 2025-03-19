import { UserEntity } from '@app/entities';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ResponseDto, UserDto } from 'src/libs/dto';

export class LoginCredentialsDto {
  @ApiProperty({
    example: 'kumar@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Kumar@123',
    description:
      'Password must be 8-16 characters, include uppercase, lowercase, number, and special character',
  })
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(16)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()\-_=+{}[\]|;:'",.<>/~`])[A-Za-z\d@$!%*?&^#()\-_=+{}[\]|;:'",.<>/~`]{8,}$/,
    {
      message:
        'Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;
}

export class LoginResponseDataDto {
  @ApiProperty({
    example: 'Access token jwt',
  })
  accessToken: string;

  @ApiProperty({
    type: UserDto,
    example: 'User data',
  })
  user: UserDto;
}

export class LoginResponseDto extends ResponseDto {
  @ApiProperty({
    type: LoginResponseDataDto,
  })
  data: LoginResponseDataDto;
}

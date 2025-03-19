import { UserEntity } from '@app/entities';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';
import { ResponseDto, UserDto } from 'src/libs/dto';

export class RegisterCredentialsDto {
  @ApiProperty({ example: 'Kumar', description: 'First name of the user' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Singh', description: 'Last name of the user' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: 'kumar@example.com',
    description: 'Email address of the user',
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
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&^#()\-_=+{}[\]|;:'",.<>/~`]).{8,16}$/,
    {
      message:
        'Password must be 8-16 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  password: string;
}


export class RegisterResponseDto extends ResponseDto {
    @ApiProperty({
        type:UserDto,
    })
    data:UserEntity;
}
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ResponseDto } from 'src/libs/dto';

export class BlocUnblockkUserParamDto {
  @ApiProperty({
    example: 'kumar@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class BlockUserBodyDto {
  @ApiProperty({
    example: 'kumar@example.com',
  })
  @IsString()
  @IsNotEmpty()
  blockReason: string;
}

export class BlockUserResponseDto extends ResponseDto {
  @ApiProperty({
    example: '2025-02-27 11:00:53.983',
  })
  data?: Date;
}

export class UnblockUserResponseDto extends ResponseDto {}

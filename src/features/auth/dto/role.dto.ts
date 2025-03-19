import { EUserRoles } from '@app/enums';
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
import { ResponseDto } from 'src/libs/dto';

export enum EAvailableRoles {
  EDITOR = EUserRoles.EDITOR,
  VIEWER = EUserRoles.VIEWER,
}

export class ChangeRoleBodyDto {
  @ApiProperty({
    example: 'kumar@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: EAvailableRoles.EDITOR,
  })
  @IsEnum(EAvailableRoles)
  role: EUserRoles;
}

export class ChangeRoleResponseDto extends ResponseDto {}
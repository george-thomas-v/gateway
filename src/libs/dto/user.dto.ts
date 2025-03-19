import { ApiProperty } from '@nestjs/swagger';
import { PasswordEntity } from '@app/entities';
import { EUserRoles } from '@app/enums';

export class UserDto {
  @ApiProperty({
    example: 'c12bcd34-e89b-12d3-a456-426614174000',
    description: 'Unique user ID',
  })
  id: string;

  @ApiProperty({
    example: 'John',
    description: 'First name of the user',
  })
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    description: 'Last name of the user',
  })
  lastName: string;

  @ApiProperty({
    example: 'john.doe@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiProperty({
    enum: EUserRoles,
    example: EUserRoles.VIEWER,
    description: 'User role',
  })
  role: EUserRoles;

  @ApiProperty({
    example: '2025-03-18T10:00:00.000Z',
    description: 'Date when the user was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-03-18T12:00:00.000Z',
    description: 'Date when the user was last updated',
  })
  updatedAt: Date;

  @ApiProperty({
    example: null,
    description: 'Date when the user was soft deleted (null if not deleted)',
    required: false,
  })
  deletedAt?: Date;

  @ApiProperty({
    example: "Password won't come to fronted",
  })
  password: PasswordEntity[];
}

import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto {
  @ApiProperty({
    example: true,
  })
  success: boolean;

  @ApiProperty({
    example: 'Success Message',
  })
  message: string;
}

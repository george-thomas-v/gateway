import { EDocumentStatus } from '@app/enums';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class GetAllDocumentsQueryDto {
  @ApiProperty({
    example: '',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: EDocumentStatus.COMPLETED,
    required: false,
  })
  @IsEnum(EDocumentStatus)
  @IsOptional()
  documentStatus: EDocumentStatus;

  @ApiProperty({
    description: 'Skip',
    example: 0,
  })
  @IsNotEmpty()
  @IsNumber({}, { message: 'Skip should be a number' })
  @Min(0)
  @Transform(({ value }) => parseInt(value, 10))
  skip: number;

  @ApiProperty({
    description: 'Limit',
    example: 10,
  })
  @IsNotEmpty()
  @IsNumber({}, { message: 'Limit should be a number' })
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  limit: number;
}

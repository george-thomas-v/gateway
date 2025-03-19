import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { DocumentService } from './document.service';
import { JwtAuthGuard, RolesGuard } from '../auth/guards';
import { CurrentUser, Roles } from '@app/libs';
import { UserEntity } from '@app/entities';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AssetDto, ResponseDto } from 'src/libs/dto';
import { EUserRoles } from '@app/enums';
import { GetAllAssetsQueryDto } from './dto';

@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiTags('Documents')
@ApiBearerAuth()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload multiple files' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'No user found',
  })
  @ApiResponse({
    status: 200,
    type: ResponseDto,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], {
      limits: { fileSize: 1000 * 1024 * 1024 },
    }),
  )
  async uploadFiles(
    @UploadedFiles() files: { files: Express.Multer.File[] },
    @CurrentUser() user: UserEntity,
  ): Promise<ResponseDto> {
    return this.documentService.uploadFiles({
      files: files.files,
      userId: user.id,
    });
  }

  @Put('/:assetId/update')
  @ApiOperation({ summary: 'Update asset file by assetId' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Unauthorized',
  })
  @ApiNotFoundResponse({
    description: 'No user found',
  })
  @ApiResponse({
    status: 200,
    type: ResponseDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 100 * 1024 * 1024 },
    }),
  )
  async updateAssetFile(
    @Param('assetId', new ParseUUIDPipe()) assetId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserEntity,
  ): Promise<ResponseDto> {
    return this.documentService.updateAssetFile({
      assetId,
      file,
      userId: user.id,
    });
  }

  @Delete('/:assetId')
  @ApiNotFoundResponse({
    description: 'No file found to delete',
  })
  @ApiResponse({
    status: 200,
    type: ResponseDto,
  })
  async deleteAsset(
    @CurrentUser() user: UserEntity,
    @Param('assetId', new ParseUUIDPipe()) assetId: string,
  ): Promise<ResponseDto> {
    return this.documentService.deleteAsset({ assetId, userId: user.id });
  }

  @Get('/get-all')
  @UseGuards(RolesGuard)
  @Roles(EUserRoles.ADMIN)
  @ApiResponse({
    status: 200,
    type: AssetDto,
  })
  async getAllAssets(
    @Query() input: GetAllAssetsQueryDto,
  ): Promise<AssetDto[]> {
    return this.documentService.getAllAssets({ ...input });
  }

  @Get('/user-assets')
  @ApiResponse({
    status: 200,
    type: AssetDto,
  })
  async getUserAssets(
    @Query() input: GetAllAssetsQueryDto,
    @CurrentUser() user: UserEntity,
  ): Promise<AssetDto[]> {
    console.log(input)
    return this.documentService.getAllAssets({ ...input, userId: user.id });
  }

  @Get('/:assetId')
  @ApiNotFoundResponse({
    description: 'No asset found',
  })
  @ApiResponse({
    status: 200,
    type: AssetDto,
  })
  async getAsset(
    @Param('assetId', new ParseUUIDPipe()) assetId: string,
  ): Promise<AssetDto> {
    return this.documentService.getAsset({ assetId });
  }
}

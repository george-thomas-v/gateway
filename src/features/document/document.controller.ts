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
import { DocumentDto, ResponseDto } from 'src/libs/dto';
import { EUserRoles } from '@app/enums';
import { GetAllDocumentsQueryDto } from './dto';

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

  @Put('/:documentId/update')
  @ApiOperation({ summary: 'Update document file by documentId' })
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
  async updateDocumentFile(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserEntity,
  ): Promise<ResponseDto> {
    return this.documentService.updateDocumentFile({
      documentId,
      file,
      userId: user.id,
    });
  }

  @Delete('/:documentId')
  @ApiNotFoundResponse({
    description: 'No file found to delete',
  })
  @ApiResponse({
    status: 200,
    type: ResponseDto,
  })
  async deleteDocument(
    @CurrentUser() user: UserEntity,
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
  ): Promise<ResponseDto> {
    return this.documentService.deleteDocument({ documentId, userId: user.id });
  }

  @Get('/get-all')
  @UseGuards(RolesGuard)
  @Roles(EUserRoles.ADMIN)
  @ApiResponse({
    status: 200,
    type: DocumentDto,
  })
  async getAllDocuments(
    @Query() input: GetAllDocumentsQueryDto,
  ): Promise<DocumentDto[]> {
    return this.documentService.getAllDocuments({ ...input });
  }

  @Get('/user-documents')
  @ApiResponse({
    status: 200,
    type: DocumentDto,
  })
  async getUserDocuments(
    @Query() input: GetAllDocumentsQueryDto,
    @CurrentUser() user: UserEntity,
  ): Promise<DocumentDto[]> {
    return this.documentService.getAllDocuments({ ...input, userId: user.id });
  }

  @Get('/:documentId')
  @ApiNotFoundResponse({
    description: 'No document found',
  })
  @ApiResponse({
    status: 200,
    type: DocumentDto,
  })
  async getDocument(
    @Param('documentId', new ParseUUIDPipe()) documentId: string,
  ): Promise<DocumentDto> {
    return this.documentService.getDocument({ documentId });
  }
}

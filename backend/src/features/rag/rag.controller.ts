import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { RagService } from './rag.service';
import { IngestTextDto } from './dto/ingest-text.dto';
import { RagQueryDto } from './dto/query.dto';

@ApiTags('rag')
@Controller('rag')
export class RagController {
  constructor(private readonly ragService: RagService) {}

  @Post('ingest-text')
  async ingestText(@Body() body: IngestTextDto) {
    const metadata = body.metadata ? this.safeParseMetadata(body.metadata) : undefined;
    return this.ragService.ingestText(body.text, body.sourceId, metadata);
  }

  @Post('ingest-file')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        sourceId: { type: 'string', nullable: true },
        metadata: { type: 'string', nullable: true, description: 'JSON string' },
      },
    },
  })
  async ingestFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('sourceId') sourceId?: string,
    @Body('metadata') metadataRaw?: string,
  ) {
    const metadata = metadataRaw ? this.safeParseMetadata(metadataRaw) : undefined;
    return this.ragService.ingestFile(file, sourceId, metadata);
  }

  @Post('query')
  async query(@Body() body: RagQueryDto) {
    return this.ragService.answer(body.question, body.topK);
  }

  private safeParseMetadata(raw: string) {
    try {
      return JSON.parse(raw);
    } catch {
      throw new BadRequestException('metadata must be valid JSON string');
    }
  }
}

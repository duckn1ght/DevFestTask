import { BadRequestException, Body, Controller, Post, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { GeminiService } from './gemini.service';
import { SendPromptDto } from './dto/send-prompt.dto';

@ApiTags('gemini')
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('send-prompt')
  async sendPrompt(@Body() body: SendPromptDto) {
    const response = await this.geminiService.sendPrompt(body.prompt);
    return response;
  }

  @Post('read-doc')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        ingest: { type: 'boolean', default: false },
        sourceId: { type: 'string', nullable: true },
      },
    },
  })
  async readDoc(
    @UploadedFile() file: Express.Multer.File,
    @Body('ingest') ingest?: string,
    @Body('sourceId') sourceId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const ingestFlag = ingest === 'true' || ingest === '1' || ingest === 'yes';

    const response = await this.geminiService.readDoc(file, {
      ingest: ingestFlag,
      sourceId,
    });
    return response;
  }
}
  
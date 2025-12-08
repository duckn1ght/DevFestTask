import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { RagModule } from '../rag/rag.module';

@Module({
  imports: [RagModule],
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}

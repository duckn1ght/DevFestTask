import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chunk } from './entities/chunk.entity';
import { EmbeddingService } from './embedding.service';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chunk])],
  providers: [EmbeddingService, RagService],
  controllers: [RagController],
  exports: [TypeOrmModule, EmbeddingService, RagService],
})
export class RagModule {}

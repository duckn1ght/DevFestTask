import { Module } from '@nestjs/common';
import { GeminiService } from './gemini.service';
import { GeminiController } from './gemini.controller';
import { RagModule } from '../rag/rag.module';
import { ReportsModule } from '../reports/reports.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

@Module({
  imports: [RagModule, ReportsModule, TransactionsModule],
  controllers: [GeminiController],
  providers: [GeminiService],
})
export class GeminiModule {}

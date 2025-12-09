import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Express } from 'express';
import { GoogleGenAI } from '@google/genai';
import { EmbeddingService } from './embedding.service';
import { Chunk } from './entities/chunk.entity';

@Injectable()
export class RagService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    @InjectRepository(Chunk)
    private readonly chunkRepository: Repository<Chunk>,
  ) {}

  private readonly genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  async ingestText(text: string, userId: string, sourceId?: string, metadata?: Record<string, unknown>) {
    if (!text?.trim()) {
      throw new BadRequestException('Text is required');
    }

    const chunks = await this.embeddingService.embedChunks(text);

    const entities = chunks.map(({ chunk, embedding }) =>
      this.chunkRepository.create({
        content: chunk,
        embedding,
        user: { id: userId },
        metadata: {
          ...(metadata ?? {}),
          sourceId,
          type: 'text',
        },
      }),
    );

    return this.chunkRepository.save(entities);
  }

  async ingestFile(file: Express.Multer.File, userId: string, sourceId?: string, metadata?: Record<string, unknown>) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const supported = ['text/plain', 'text/csv', 'application/json', 'text/markdown'];
    if (!supported.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    const text = this.bufferToText(file);
    return this.ingestText(text, userId, sourceId, {
      ...(metadata ?? {}),
      filename: file.originalname,
      mimeType: file.mimetype,
    });
  }

  private bufferToText(file: Express.Multer.File) {
    const content = file.buffer.toString('utf8');
    if (file.mimetype === 'application/json') {
      try {
        const obj = JSON.parse(content);
        return JSON.stringify(obj);
      } catch {
        return content;
      }
    }
    return content;
  }

  async answer(question: string, userId: string, topK = 5) {
    if (!question?.trim()) {
      throw new BadRequestException('Question is required');
    }

    const queryEmbedding = await this.embeddingService.embedText(question);

    const chunks = await this.chunkRepository.find({ where: { user: { id: userId } } });
    if (!chunks.length) {
      // Instead of throwing error, return a friendly message
      return {
        answer: 'В базе знаний пока нет документов. Пожалуйста, загрузите документы для анализа.',
        sources: []
      };
    }

    const scored = chunks
      .map((c) => ({
        chunk: c,
        score: this.cosineSimilarity(queryEmbedding, c.embedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);

    const contextText = scored
      .map((s, idx) => `# Source ${idx + 1}\n${s.chunk.content}`)
      .join('\n\n');

    const prompt = `You are a concise assistant. Use the provided sources to answer the question.
You are also an expert tax calculator for Kazakhstan (2025 rates).

🛠️ Исходные данные (Базовые ставки 2025 г.)
МЗП (Минимальная ЗП): 85 000 тнг
МРП (Месячный расчетный показатель): 3 932 тнг
ОПВ (Работник): 10 %
ВОСМС (Работник): 2 %
ИПН (Работник): 10 %
Социальные отчисления (Работодатель): 5 %
ООСМС (Работодатель): 3 %
Социальный налог (Работодатель): 11 %
НДС (Налог на добавленную стоимость): 12 %
КПН (Корпоративный подоходный налог): 20 %
Стандартный налоговый вычет (ИПН): 14 * МРП

📝 Требуемые Входные Параметры
Если пользователь не предоставил данные, запросите:
1. Общая валовая выручка за период (тнг).
2. Установленный оклад (Gross) на одного сотрудника (тнг).
3. Количество сотрудников (чел.).
4. (Опционально) Сумма операционных расходов.

🧮 Алгоритм расчета (Строгая последовательность)
1. Налоги с выручки (по организации)
НДС (12%): Рассчитать, если Выручка является облагаемым оборотом.
КПН (20%): Сообщить, что точный КПН требует данных о прибыли (Выручка - Расходы). Рассчитать КПН только в случае предоставления Суммы операционных расходов.

2. Расчет заработной платы (на 1 сотрудника)
ОПВ (10%): Оклад * 10%
ВОСМС (2%): Оклад * 2%
ИПН (10%):
Сначала рассчитать Стандартный вычет: 14 * МРП
Облагаемый доход: Оклад - ОПВ - Стандартный вычет
Сумма ИПН: Облагаемый доход * 10%
Чистая зарплата (На руки): Оклад - ОПВ - ВОСМС - ИПН

3. Налоги и отчисления работодателя (на 1 сотрудника)
База для Социальных отчислений/налога: Оклад - ОПВ
Социальные отчисления (5%): База * 5%
ООСМС (3%): Оклад * 3%
Социальный налог (11%): (База * 11%) - Социальные отчисления

4. Итоговые данные и Форматирование
Рассчитать Общие начисления по всем сотрудникам (ФОТ, налоги, чистая зарплата), умножив результаты Шагов 2 и 3 на Количество сотрудников.
Все результаты представлять в формате тенге (тнг).
Предоставлять ответ в виде сводной таблицы или маркированного списка.

If the answer is not present in sources and cannot be calculated using the rules above, say you do not have enough information.
Provide JSON with fields { answer: string, sources: string[] }.

Sources:
${contextText}

Question: ${question}`;

    try {
      const response = await this.genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
      });

      const text = this.extractText(response);
      const parsed = this.parseJsonSafe(text);

      return {
        answer: parsed?.answer ?? text,
        sources: parsed?.sources ?? scored.map((s) => s.chunk.id),
        raw: text,
        chunks: scored.map((s) => ({ id: s.chunk.id, score: s.score, snippet: s.chunk.content })),
      };
    } catch (err) {
      console.error('RAG Generation Error:', err);
      throw new InternalServerErrorException('Failed to generate answer');
    }
  }

  private cosineSimilarity(a: number[], b: number[]) {
    if (!a?.length || !b?.length || a.length !== b.length) return 0;
    let dot = 0;
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private extractText(response: any): string {
    const parts = response?.candidates?.[0]?.content?.parts ?? [];
    const texts = parts
      .map((p: any) => p.text)
      .filter((t: unknown): t is string => typeof t === 'string');
    return texts.join('\n').trim();
  }

  private parseJsonSafe(raw: string) {
    if (!raw) return null;
    const match = raw.match(/```json\s*([\s\S]*?)```/i);
    const candidate = (match ? match[1] : raw).trim();
    try {
      return JSON.parse(candidate);
    } catch {
      return null;
    }
  }
}

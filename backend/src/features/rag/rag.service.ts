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

  async ingestText(text: string, sourceId?: string, metadata?: Record<string, unknown>) {
    if (!text?.trim()) {
      throw new BadRequestException('Text is required');
    }

    const chunks = await this.embeddingService.embedChunks(text);

    const entities = chunks.map(({ chunk, embedding }) =>
      this.chunkRepository.create({
        content: chunk,
        embedding,
        metadata: {
          ...(metadata ?? {}),
          sourceId,
          type: 'text',
        },
      }),
    );

    return this.chunkRepository.save(entities);
  }

  async ingestFile(file: Express.Multer.File, sourceId?: string, metadata?: Record<string, unknown>) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const supported = ['text/plain', 'text/csv', 'application/json', 'text/markdown'];
    if (!supported.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }

    const text = this.bufferToText(file);
    return this.ingestText(text, sourceId, {
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

  async answer(question: string, topK = 5) {
    if (!question?.trim()) {
      throw new BadRequestException('Question is required');
    }

    const queryEmbedding = await this.embeddingService.embedText(question);

    const chunks = await this.chunkRepository.find();
    if (!chunks.length) {
      throw new BadRequestException('No chunks indexed yet');
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

    const prompt = `You are a concise assistant. Use the provided sources to answer the question. If the answer is not present, say you do not have enough information. Provide JSON with fields { answer: string, sources: string[] }.\n\nSources:\n${contextText}\n\nQuestion: ${question}`;

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

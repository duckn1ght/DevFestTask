import { GoogleGenAI } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmbeddingService {
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.model = this.configService.get<string>('EMBEDDING_MODEL') ?? 'text-embedding-004';
  }

  private genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  async embedText(text: string): Promise<number[]> {
    try {
      const result = await this.genai.models.embedContent({
        model: this.model,
        contents: [{ parts: [{ text }] }],
      });
      return result.embeddings?.[0]?.values ?? [];
    } catch (err) {
      throw new InternalServerErrorException('Failed to embed text');
    }
  }

  chunkText(text: string, maxChars = 2000): string[] {
    const normalized = text.replace(/\s+/g, ' ').trim();
    const chunks: string[] = [];
    for (let i = 0; i < normalized.length; i += maxChars) {
      chunks.push(normalized.slice(i, i + maxChars));
    }
    return chunks;
  }

  async embedChunks(text: string, maxChars = 2000) {
    const chunks = this.chunkText(text, maxChars);
    const embeddings = await Promise.all(chunks.map((chunk) => this.embedText(chunk)));
    return chunks.map((chunk, idx) => ({ chunk, embedding: embeddings[idx] }));
  }
}

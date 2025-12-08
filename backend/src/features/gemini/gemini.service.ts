import { GoogleGenAI } from '@google/genai';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { Express } from 'express';
import { RagService } from '../rag/rag.service';

@Injectable()
export class GeminiService {
  genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  constructor(private readonly ragService: RagService) {}
  async sendPrompt(prompt: string) {
    const response = await this.genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response;
  }

  async readDoc(file: Express.Multer.File, options?: { ingest?: boolean; sourceId?: string }) {
    const allowedMimeTypes = [
      'application/pdf',
      'text/plain',
      'text/csv',
      'application/json',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Unsupported file type: ${file.mimetype}. Please upload PDF, TXT, CSV, JSON, or Excel (.xlsx/.xls).`,
      );
    }

    const isExcel =
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel';

    // For Excel, convert to CSV text so Gemini can ingest supported mime.
    if (isExcel) {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);

      const response = await this.genai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            parts: [
              {
                text: `Analyze the following CSV (converted from Excel) and provide data for the following fields in JSON format:
              report: {
                taxes: [{ amount: number, type: string }],
                salaries: [{ amount: number, employeePosition: string, employeeName: string }]
              }`,
              },
              {
                text: csv,
              },
            ],
          },
        ],
      });

      const text = this.extractText(response);

      if (options?.ingest) {
        await this.ragService.ingestText(text, options.sourceId ?? file.originalname, {
          filename: file.originalname,
          mimeType: file.mimetype,
          from: 'gemini-excel',
        });
      }

      return {
        raw: text,
        parsed: this.parseGeminiJson(text),
      };
    }

    const base64 = file.buffer.toString('base64');
    const response = await this.genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                data: base64,
                mimeType: file.mimetype || 'application/octet-stream',
              },
            },
            {
              text: `Analyze the document and provide data for the following fields in JSON format:
              report: {
                taxes: [{
                    amount: number,
                    type: string
                }],
                salaries: [{
                    amount: number,
                    employeePosition: string,
                    employeeName: string,
                }]
              }`,
            },
          ],
        },
      ],
    });
    const text = this.extractText(response);

    if (options?.ingest) {
      await this.ragService.ingestText(text, options.sourceId ?? file.originalname, {
        filename: file.originalname,
        mimeType: file.mimetype,
        from: 'gemini-doc',
      });
    }

    return {
      raw: text,
      parsed: this.parseGeminiJson(text),
    };
  }

  private extractText(response: any): string {
    const parts = response?.candidates?.[0]?.content?.parts ?? [];
    const texts = parts
      .map((p: any) => p.text)
      .filter((t: unknown): t is string => typeof t === 'string');
    return texts.join('\n').trim();
  }

  private parseGeminiJson(raw: string) {
    if (!raw) return null;

    const match = raw.match(/```json\s*([\s\S]*?)```/i);
    const candidate = (match ? match[1] : raw).trim();

    try {
      return JSON.parse(candidate);
    } catch (e) {
      // If parsing fails, return raw for debugging; caller can handle null/undefined.
      return null;
    }
  }
}

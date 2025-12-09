import { GoogleGenAI } from '@google/genai';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as XLSX from 'xlsx';
import type { Express } from 'express';
import { RagService } from '../rag/rag.service';
import { ReportsService } from '../reports/reports.service';
import { TransactionsService } from 'src/transactions/transactions.service';

@Injectable()
export class GeminiService {
  genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  constructor(
    private readonly ragService: RagService,
    private readonly reportsService: ReportsService,
    private readonly transactionsService: TransactionsService,
  ) {}
  async sendPrompt(prompt: string) {
    const response = await this.genai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ parts: [{ text: prompt }] }],
    });
    return response;
  }

  async readDoc(file: Express.Multer.File, userId: string, options?: { ingest?: boolean; sourceId?: string }) {
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
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      const csv = XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName]);

      const transactionsData: any[] = [];
      const taxesData: any[] = [];
      const salariesData: any[] = [];
      let totalIncome = 0;
      let totalConsumption = 0;

      for (const row of rows) {
        const rowJson = JSON.stringify(row);
        const response = await this.genai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              parts: [
                {
                  text: `Analyze the following JSON record (one row from an Excel file) and extract transaction details.
              If the record represents an expense, payment made, or money flowing OUT, it is an 'expense'.
              If the record represents income, revenue, or money flowing IN, it is an 'income'.
              Look for any date field in the record and extract it as 'date' in ISO 8601 format (YYYY-MM-DD).
              
              Determine if the transaction is a 'tax' payment or a 'salary' payment.
              If it is a tax, provide 'taxDetails' with 'type' (e.g., 'НДС', 'ИПН', 'Социальный налог'). MUST BE IN RUSSIAN.
              If it is a salary, provide 'salaryDetails' with 'employeeName' and 'employeePosition' (MUST BE IN RUSSIAN).
              
              Output format:
              {
                "transaction": {
                    "date": "string (ISO 8601)",
                    "amount": number,
                    "type": "income" | "expense",
                    "description": "string",
                    "category": "tax" | "salary" | "other",
                    "taxDetails": { "type": "string" },
                    "salaryDetails": { "employeeName": "string", "employeePosition": "string" }
                  }
              }`,
                },
                {
                  text: rowJson,
                },
              ],
            },
          ],
        });

        const text = this.extractText(response);
        const parsed = this.parseGeminiJson(text);

        if (parsed?.transaction) {
          transactionsData.push(parsed.transaction);
          if (parsed.transaction.type === 'income') {
            totalIncome += parsed.transaction.amount;
          } else {
            totalConsumption += parsed.transaction.amount;
          }

          if (parsed.transaction.category === 'tax' && parsed.transaction.taxDetails) {
            taxesData.push({
              amount: parsed.transaction.amount,
              type: parsed.transaction.taxDetails.type || 'Unknown Tax',
            });
          } else if (parsed.transaction.category === 'salary' && parsed.transaction.salaryDetails) {
            salariesData.push({
              amount: parsed.transaction.amount,
              employeeName: parsed.transaction.salaryDetails.employeeName || 'Unknown',
              employeePosition: parsed.transaction.salaryDetails.employeePosition || 'Employee',
            });
          }
        }
      }

      // Create ONE report
      const report = await this.reportsService.create({
        totalIncome,
        totalConsumption,
        filename: file.originalname,
        type: 'Uploaded',
        date: new Date(),
        taxes: taxesData,
        salaries: salariesData,
      }, userId);

      // Create Transactions linked to Report
      const transactionDtos = transactionsData.map((t) => ({
        ...t,
        type: t.type === 'income' || t.type === 'expense' ? t.type : 'expense', // Fallback
        reportId: report.id,
        date: t.date ? new Date(t.date) : new Date(),
      }));

      await this.transactionsService.createMany(transactionDtos, userId);

      if (options?.ingest) {
        await this.ragService.ingestText(csv, userId, options.sourceId ?? file.originalname, {
          filename: file.originalname,
          mimeType: file.mimetype,
          from: 'gemini-excel',
        });
      }

      return {
        raw: 'Processed ' + rows.length + ' rows.',
        parsed: { report, transactions: transactionsData },
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
              text: `Analyze the document and provide data in JSON format.
              Extract all financial transactions found in the document.
              If the transaction represents an expense, payment made, or money flowing OUT, it is an 'expense'.
              If the transaction represents income, revenue, or money flowing IN, it is an 'income'.
              
              Determine if the transaction is a 'tax' payment or a 'salary' payment.
              If it is a tax, provide 'taxDetails' with 'type' (e.g., 'НДС', 'ИПН', 'Социальный налог'). MUST BE IN RUSSIAN.
              If it is a salary, provide 'salaryDetails' with 'employeeName' and 'employeePosition' (MUST BE IN RUSSIAN).

              Output format:
              {
                "transactions": [
                  {
                    "date": "string (ISO 8601)",
                    "amount": number,
                    "type": "income" | "expense",
                    "description": "string",
                    "category": "tax" | "salary" | "other",
                    "taxDetails": { "type": "string" },
                    "salaryDetails": { "employeeName": "string", "employeePosition": "string" }
                  }
                ]
              }`,
            },
          ],
        },
      ],
    });
    const text = this.extractText(response);
    const parsed = this.parseGeminiJson(text);

    if (options?.ingest) {
      await this.ragService.ingestText(text, userId, options.sourceId ?? file.originalname, {
        filename: file.originalname,
        mimeType: file.mimetype,
        from: 'gemini-doc',
      });
    }

    if (parsed?.transactions && Array.isArray(parsed.transactions)) {
      let totalIncome = 0;
      let totalConsumption = 0;
      const taxesData: any[] = [];
      const salariesData: any[] = [];

      for (const t of parsed.transactions) {
        if (t.type === 'income') totalIncome += t.amount;
        else totalConsumption += t.amount;

        if (t.category === 'tax' && t.taxDetails) {
          taxesData.push({
            amount: t.amount,
            type: t.taxDetails.type || 'Unknown Tax',
          });
        } else if (t.category === 'salary' && t.salaryDetails) {
          salariesData.push({
            amount: t.amount,
            employeeName: t.salaryDetails.employeeName || 'Unknown',
            employeePosition: t.salaryDetails.employeePosition || 'Employee',
          });
        }
      }

      const report = await this.reportsService.create({
        totalIncome,
        totalConsumption,
        filename: file.originalname,
        type: 'Uploaded',
        date: new Date(),
        taxes: taxesData,
        salaries: salariesData,
      }, userId);

      const transactionDtos = parsed.transactions.map((t: any) => ({
        ...t,
        type: t.type === 'income' || t.type === 'expense' ? t.type : 'expense', // Fallback to expense if type is missing/invalid
        reportId: report.id,
        date: t.date ? new Date(t.date) : new Date(),
      }));

      await this.transactionsService.createMany(transactionDtos, userId);
    }

    return {
      raw: text,
      parsed,
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

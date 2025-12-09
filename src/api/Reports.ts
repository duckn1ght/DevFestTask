import { getAuthHeaders } from '../lib/utils';

const API_URL = 'http://localhost:3000';

export interface ReportSummaryQueryDto {
  period?: 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

export interface ReportSummary {
  period: string;
  startDate?: string;
  endDate?: string;
  totals: {
    income: number;
    consumption: number;
    salaries: number;
    taxes: number;
  };
  breakdown: {
    salaries: Record<string, number>;
    taxes: Record<string, number>;
    revenue?: { date: string; value: number }[];
  };
}

export const reportsApi = {
  async getSummary(query: ReportSummaryQueryDto): Promise<ReportSummary> {
    const params = new URLSearchParams();
    if (query.period) params.append('period', query.period);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    const response = await fetch(`${API_URL}/reports/summary/aggregate?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch report summary');
    }

    return response.json();
  },

  async getAll(): Promise<any[]> {
    const response = await fetch(`${API_URL}/reports`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }

    return response.json();
  },
};

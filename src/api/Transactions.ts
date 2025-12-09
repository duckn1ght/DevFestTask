import { getAuthHeaders } from '../lib/utils';

const API_URL = 'http://localhost:3000';

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  report?: { id: string };
}

export interface TransactionQuery {
  startDate?: string;
  endDate?: string;
}

export const transactionsApi = {
  async getAll(query?: TransactionQuery): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (query?.startDate) params.append('startDate', query.startDate);
    if (query?.endDate) params.append('endDate', query.endDate);

    const response = await fetch(`${API_URL}/transactions?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch transactions');
    }

    return response.json();
  }
};

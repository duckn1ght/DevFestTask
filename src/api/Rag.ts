import { getAuthHeaders } from '../lib/utils';

const API_URL = 'http://localhost:3000';

export interface RagQueryDto {
  question: string;
  topK?: number;
}

export interface RagResponse {
  answer: string;
  sources: string[];
}

export interface IngestTextDto {
  text: string;
  sourceId?: string;
  metadata?: Record<string, any>;
}

export const ragApi = {
  async query(data: RagQueryDto): Promise<RagResponse> {
    const response = await fetch(`${API_URL}/rag/query`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to query RAG');
    }

    return response.json();
  },

  async ingestText(data: IngestTextDto): Promise<any> {
    const response = await fetch(`${API_URL}/rag/ingest-text`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to ingest text');
    }

    return response.json();
  },

  async ingestFile(file: File, sourceId?: string): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('ingest', 'true');
    if (sourceId) formData.append('sourceId', sourceId);
    
    const token = localStorage.getItem('token');
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}/gemini/read-doc`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to ingest file');
    }

    return response.json();
  },
};

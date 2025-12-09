import { getAuthHeaders } from '../lib/utils';

const API_URL = 'http://localhost:3000';

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  position: string;
  salary: number;
  email?: string;
  hireDate?: string;
}

export interface CreateEmployeeDto {
  firstName: string;
  lastName: string;
  position: string;
  salary: number;
  email?: string;
  hireDate?: string;
}

export const employeesApi = {
  async getAll(): Promise<Employee[]> {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    return response.json();
  },

  async create(data: CreateEmployeeDto): Promise<Employee> {
    const response = await fetch(`${API_URL}/employees`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create employee');
    }

    return response.json();
  },

  async update(id: string, data: Partial<CreateEmployeeDto>): Promise<Employee> {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update employee');
    }

    return response.json();
  },

  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/employees/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete employee');
    }
  },
};

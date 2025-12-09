import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Employee } from './entities/employee.entity';
import { RagService } from '../features/rag/rag.service';

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
    private readonly ragService: RagService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto, userId: string) {
    const employee = this.employeeRepository.create({
      ...createEmployeeDto,
      user: { id: userId }
    });
    const savedEmployee = await this.employeeRepository.save(employee);

    // Ingest into RAG
    const ragText = `Сотрудник: ${savedEmployee.firstName} ${savedEmployee.lastName}. 
    Должность: ${savedEmployee.position}. 
    Оклад (Gross): ${savedEmployee.salary} тнг.
    Email: ${savedEmployee.email || 'Не указан'}.
    Дата найма: ${savedEmployee.hireDate || 'Не указана'}.
    ID: ${savedEmployee.id}`;

    await this.ragService.ingestText(ragText, userId, `employee-${savedEmployee.id}`, {
      type: 'employee',
      employeeId: savedEmployee.id,
    });

    return savedEmployee;
  }

  findAll(userId: string) {
    return this.employeeRepository.find({ where: { user: { id: userId } } });
  }

  async findOne(id: string, userId: string) {
    const employee = await this.employeeRepository.findOne({ where: { id, user: { id: userId } } });
    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`);
    }
    return employee;
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto, userId: string) {
    const employee = await this.findOne(id, userId);
    Object.assign(employee, updateEmployeeDto);
    const savedEmployee = await this.employeeRepository.save(employee);

    // Re-ingest into RAG (Note: ideally we should update/delete old chunk, but appending new info works for now)
    const ragText = `Обновление данных сотрудника.
    Сотрудник: ${savedEmployee.firstName} ${savedEmployee.lastName}. 
    Должность: ${savedEmployee.position}. 
    Оклад (Gross): ${savedEmployee.salary} тнг.
    Email: ${savedEmployee.email || 'Не указан'}.
    Дата найма: ${savedEmployee.hireDate || 'Не указана'}.
    ID: ${savedEmployee.id}`;

    await this.ragService.ingestText(ragText, userId, `employee-${savedEmployee.id}-update-${Date.now()}`, {
      type: 'employee',
      employeeId: savedEmployee.id,
      isUpdate: true,
    });

    return savedEmployee;
  }

  async remove(id: string, userId: string) {
    const employee = await this.findOne(id, userId);
    return this.employeeRepository.remove(employee);
  }
}

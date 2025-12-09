import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  create(createTransactionDto: CreateTransactionDto, userId: string) {
    const transaction = this.transactionRepository.create({
      ...createTransactionDto,
      user: { id: userId }
    });
    return this.transactionRepository.save(transaction);
  }

  async createMany(createTransactionDtos: CreateTransactionDto[], userId: string) {
    const transactions = this.transactionRepository.create(
      createTransactionDtos.map(dto => ({ ...dto, user: { id: userId } }))
    );
    return this.transactionRepository.save(transactions);
  }

  findAll(userId: string, startDate?: string, endDate?: string) {
    const where: any = { user: { id: userId } };
    if (startDate && endDate) {
      where.date = Between(new Date(startDate), new Date(endDate));
    }
    return this.transactionRepository.find({ 
      where,
      relations: ['report'],
      order: { date: 'DESC' }
    });
  }

  findOne(id: string, userId: string) {
    return this.transactionRepository.findOne({ where: { id, user: { id: userId } }, relations: ['report'] });
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, userId: string) {
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return this.transactionRepository.update(id, updateTransactionDto);
  }

  async remove(id: string, userId: string) {
    const transaction = await this.findOne(id, userId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    return this.transactionRepository.delete(id);
  }
}

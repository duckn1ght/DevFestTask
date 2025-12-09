import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { Salary } from './entities/salary.entity';
import { Tax } from './entities/tax.entity';
import { ReportSummaryQueryDto } from './dto/report-summary-query.dto';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async create(createReportDto: CreateReportDto, userId: string) {
    const report = this.reportRepository.create({
      totalIncome: createReportDto.totalIncome,
      totalConsumption: createReportDto.totalConsumption,
      salaries: createReportDto.salaries,
      taxes: createReportDto.taxes,
      filename: createReportDto.filename,
      type: createReportDto.type,
      date: createReportDto.date || new Date(),
      user: { id: userId },
    });

    return this.reportRepository.save(report);
  }

  findAll(userId: string) {
    return this.reportRepository.find({ 
      where: { user: { id: userId } },
      relations: ['salaries', 'taxes'] 
    });
  }

  async findOne(id: string, userId: string) {
    const report = await this.reportRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['salaries', 'taxes'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto, userId: string) {
    const report = await this.findOne(id, userId);
    Object.assign(report, updateReportDto);
    return this.reportRepository.save(report);
  }

  async remove(id: string, userId: string) {
    const report = await this.findOne(id, userId);
    await this.reportRepository.remove(report);
    return { deleted: true };
  }

  async summary(query: ReportSummaryQueryDto, userId: string) {
    const { startDate, endDate, period } = this.resolveDates(query);

    // 1. Transactions (Income/Expense/Revenue)
    const transactionWhere: any = { user: { id: userId } };
    if (startDate && endDate) {
      transactionWhere.date = Between(startDate, endDate);
    }

    const transactions = await this.transactionRepository.find({
      where: transactionWhere,
      order: { date: 'ASC' }
    });

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const totalConsumption = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const revenueByDate: Record<string, number> = {};
    transactions.forEach(t => {
      const d = t.date instanceof Date ? t.date : new Date(t.date);
      const dateStr = d.toISOString().split('T')[0];
      const amount = t.type === 'income' ? t.amount : -t.amount;
      revenueByDate[dateStr] = (revenueByDate[dateStr] ?? 0) + amount;
    });

    const revenueChartData = Object.entries(revenueByDate)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 2. Taxes & Salaries (via Report Date)
    const reportWhere: any = { user: { id: userId } };
    if (startDate && endDate) {
        reportWhere.date = Between(startDate, endDate);
    }
    
    const taxes = await this.taxRepository.find({
        relations: ['report'],
        where: {
            report: reportWhere
        }
    });

    const salaries = await this.salaryRepository.find({
        relations: ['report'],
        where: {
            report: reportWhere
        }
    });

    const totalTaxes = taxes.reduce((sum, t) => sum + t.amount, 0);
    const taxByType: Record<string, number> = {};
    taxes.forEach(t => {
        taxByType[t.type] = (taxByType[t.type] ?? 0) + t.amount;
    });

    const totalSalaries = salaries.reduce((sum, s) => sum + s.amount, 0);
    const salaryByPosition: Record<string, number> = {};
    salaries.forEach(s => {
        salaryByPosition[s.employeePosition] = (salaryByPosition[s.employeePosition] ?? 0) + s.amount;
    });

    return {
      period,
      startDate,
      endDate,
      totals: {
        income: totalIncome,
        consumption: totalConsumption,
        salaries: totalSalaries,
        taxes: totalTaxes,
      },
      breakdown: {
        salaries: salaryByPosition,
        taxes: taxByType,
        revenue: revenueChartData,
      },
    };
  }

  private resolveDates(query: ReportSummaryQueryDto) {
    const now = new Date();

    if (query.startDate && query.endDate) {
      return { startDate: query.startDate, endDate: query.endDate, period: 'range' as const };
    }

    if (query.period === 'month') {
      const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { startDate, endDate, period: 'month' as const };
    }

    if (query.period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      const startMonth = quarter * 3;
      const startDate = new Date(now.getFullYear(), startMonth, 1);
      const endDate = new Date(now.getFullYear(), startMonth + 3, 0, 23, 59, 59, 999);
      return { startDate, endDate, period: 'quarter' as const };
    }

    if (query.period === 'year') {
      const startDate = new Date(now.getFullYear(), 0, 1);
      const endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return { startDate, endDate, period: 'year' as const };
    }

    return { startDate: undefined, endDate: undefined, period: 'all' as const };
  }
}

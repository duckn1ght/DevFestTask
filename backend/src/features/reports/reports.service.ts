import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './entities/report.entity';
import { Salary } from './entities/salary.entity';
import { Tax } from './entities/tax.entity';
import { ReportSummaryQueryDto } from './dto/report-summary-query.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report)
    private readonly reportRepository: Repository<Report>,
    @InjectRepository(Salary)
    private readonly salaryRepository: Repository<Salary>,
    @InjectRepository(Tax)
    private readonly taxRepository: Repository<Tax>,
  ) {}

  async create(createReportDto: CreateReportDto) {
    const report = this.reportRepository.create({
      totalIncome: createReportDto.totalIncome,
      totalConsumption: createReportDto.totalConsumption,
      salaries: createReportDto.salaries,
      taxes: createReportDto.taxes,
    });

    return this.reportRepository.save(report);
  }

  findAll() {
    return this.reportRepository.find({ relations: ['salaries', 'taxes'] });
  }

  async findOne(id: string) {
    const report = await this.reportRepository.findOne({
      where: { id },
      relations: ['salaries', 'taxes'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async update(id: string, updateReportDto: UpdateReportDto) {
    const report = await this.findOne(id);
    Object.assign(report, updateReportDto);
    return this.reportRepository.save(report);
  }

  async remove(id: string) {
    const report = await this.findOne(id);
    await this.reportRepository.remove(report);
    return { deleted: true };
  }

  async summary(query: ReportSummaryQueryDto) {
    const { startDate, endDate, period } = this.resolveDates(query);

    const where = startDate && endDate ? { createdAt: Between(startDate, endDate) } : {};

    const reports = await this.reportRepository.find({
      where,
      relations: ['salaries', 'taxes'],
    });

    const totalIncome = reports.reduce((sum, r) => sum + (r.totalIncome ?? 0), 0);
    const totalConsumption = reports.reduce((sum, r) => sum + (r.totalConsumption ?? 0), 0);

    const salaryByPosition: Record<string, number> = {};
    const totalSalaries = reports.reduce((sum, r) => {
      (r.salaries ?? []).forEach((s) => {
        salaryByPosition[s.employeePosition] =
          (salaryByPosition[s.employeePosition] ?? 0) + s.amount;
      });
      return sum + (r.salaries ?? []).reduce((s2, s) => s2 + s.amount, 0);
    }, 0);

    const taxByType: Record<string, number> = {};
    const totalTaxes = reports.reduce((sum, r) => {
      (r.taxes ?? []).forEach((t) => {
        taxByType[t.type] = (taxByType[t.type] ?? 0) + t.amount;
      });
      return sum + (r.taxes ?? []).reduce((s2, t) => s2 + t.amount, 0);
    }, 0);

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
      salaries: salaryByPosition,
      taxes: taxByType,
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

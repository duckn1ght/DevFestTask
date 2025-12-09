import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tax } from './entities/tax.entity';
import { Salary } from './entities/salary.entity';
import { Report } from './entities/report.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Salary, Tax, Transaction])],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}

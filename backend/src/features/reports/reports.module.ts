import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tax } from './entities/tax.entity';
import { Salary } from './entities/salary.entity';
import { Report } from './entities/report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Report, Salary, Tax])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}

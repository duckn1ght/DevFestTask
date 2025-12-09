import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { ReportSummaryQueryDto } from './dto/report-summary-query.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  create(@Body() createReportDto: CreateReportDto, @Req() req) {
    return this.reportsService.create(createReportDto, req.user.id);
  }

  @Get()
  findAll(@Req() req) {
    return this.reportsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.reportsService.findOne(id, req.user.id);
  }

  @Get('summary/aggregate')
  summary(@Query() query: ReportSummaryQueryDto, @Req() req) {
    return this.reportsService.summary(query, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReportDto: UpdateReportDto, @Req() req) {
    return this.reportsService.update(id, updateReportDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.reportsService.remove(id, req.user.id);
  }
}

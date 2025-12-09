import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from '../features/auth/jwt-auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req) {
    return this.transactionsService.create(createTransactionDto, req.user.id);
  }

  @Get()
  findAll(@Req() req, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    return this.transactionsService.findAll(req.user.id, startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.transactionsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransactionDto: UpdateTransactionDto, @Req() req) {
    return this.transactionsService.update(id, updateTransactionDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.transactionsService.remove(id, req.user.id);
  }
}

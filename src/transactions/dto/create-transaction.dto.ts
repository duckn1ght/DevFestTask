import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTransactionDto {
  @IsDateString()
  date: Date;

  @IsNumber()
  amount: number;

  @IsEnum(['income', 'expense'])
  type: 'income' | 'expense';

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUUID()
  reportId?: string;
}

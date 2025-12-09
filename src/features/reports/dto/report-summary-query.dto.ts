import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional } from 'class-validator';

export class ReportSummaryQueryDto {
  @ApiPropertyOptional({ enum: ['month', 'quarter', 'year'] })
  @IsOptional()
  @IsIn(['month', 'quarter', 'year'])
  period?: 'month' | 'quarter' | 'year';

  @ApiPropertyOptional({ type: String, description: 'ISO date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({ type: String, description: 'ISO date' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;
}

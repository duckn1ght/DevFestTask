import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class IngestTextDto {
  @ApiProperty({ description: 'Plain text content to ingest' })
  @IsString()
  text: string;

  @ApiPropertyOptional({ description: 'Optional source identifier' })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiPropertyOptional({ description: 'Optional metadata as JSON string' })
  @IsOptional()
  @IsString()
  metadata?: string;
}
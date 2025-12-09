import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateEmployeeDto {
  @ApiProperty({ example: 'Ivan' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Ivanov' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'Developer' })
  @IsString()
  position: string;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  @Min(0)
  salary: number;

  @ApiProperty({ example: 'ivan@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '2025-01-01', required: false })
  @IsOptional()
  hireDate?: Date;
}

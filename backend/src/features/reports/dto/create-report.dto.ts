import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';

class CreateTaxDto {
	@ApiProperty({ example: 'IPN' })
	@IsString()
	type: string;

	@ApiProperty({ example: 1250000 })
	@IsNumber()
	@Min(0)
	amount: number;
}

class CreateSalaryDto {
	@ApiProperty({ example: 4500000 })
	@IsNumber()
	@Min(0)
	amount: number;

	@ApiProperty({ example: 'Developer' })
	@IsString()
	employeePosition: string;

	@ApiProperty({ required: false, example: 'John Doe' })
	@IsOptional()
	@IsString()
	employeeName?: string;
}

export class CreateReportDto {
	@ApiProperty({ example: 33600000 })
	@IsNumber()
	@Min(0)
	totalIncome: number;

	@ApiProperty({ example: 12000000 })
	@IsNumber()
	@Min(0)
	totalConsumption: number;

	@ApiProperty({ type: [CreateSalaryDto], required: false })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateSalaryDto)
	@IsOptional()
	salaries?: CreateSalaryDto[];

	@ApiProperty({ type: [CreateTaxDto], required: false })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => CreateTaxDto)
	@IsOptional()
	taxes?: CreateTaxDto[];
}

export { CreateTaxDto, CreateSalaryDto };

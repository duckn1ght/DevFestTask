import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
	@ApiProperty({ example: 'user@example.com' })
	@IsEmail()
	email: string;

	@ApiProperty({ minLength: 6, example: 'strongPassword' })
	@IsString()
	@MinLength(6)
	password: string;

	@ApiProperty({ example: 'My Org' })
	@IsString()
	orgName: string;

	@ApiProperty({ required: false, example: 'John Doe' })
	@IsOptional()
	@IsString()
	fullname?: string;
}

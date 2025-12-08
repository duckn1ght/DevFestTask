import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class SendPromptDto {
  @IsString()
  @ApiProperty({ example: 'Explain the theory of relativity in simple terms.' })
  prompt: string;
}

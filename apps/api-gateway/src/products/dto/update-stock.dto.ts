import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class UpdateStockDto {
  @ApiProperty({ example: 50, minimum: 0, type: 'integer' })
  @IsInt()
  @Min(0)
  stockQuantity!: number;
}

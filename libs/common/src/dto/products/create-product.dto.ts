import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Laptop Pro 16' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Yüksek performanslı dizüstü bilgisayar' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ example: 1299.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 100, minimum: 0 })
  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  @IsOptional()
  categoryId?: string;
}

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
  @IsString()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @IsNumber()
  @Min(0)
  stockQuantity!: number;

  @IsUUID()
  @IsOptional()
  categoryId?: string;
}

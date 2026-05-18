import {
  IsString,
  IsNumber,
  IsOptional,
  IsMongoId,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO for creating a new product variant
 * POST /product-variants
 */
export class CreateProductVariantDto {
  @ApiProperty({
    description: 'MongoDB ObjectId of the parent product',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId({ message: 'productId must be a valid MongoDB ID' })
  productId?: string;

  @ApiPropertyOptional({
    description: 'Variant color name',
    example: 'Black',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Variant size label',
    example: 'Medium',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiProperty({
    description: 'Image URL for this variant',
    example: 'https://res.cloudinary.com/example/image/upload/v123/shirt-black-m.jpg',
  })
  @IsString()
  image: string;

  @ApiPropertyOptional({
    description: 'Stock quantity for this variant',
    example: 25,
    minimum: 0,
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Stock cannot be negative' })
  stock?: number;

  @ApiProperty({
    description: 'Price for this variant',
    example: 29999,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price: number;

  @ApiPropertyOptional({
    description: 'Stock Keeping Unit — unique identifier for this variant',
    example: 'DG-SHIRT-BLK-M',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'SKU must not exceed 100 characters' })
  sku?: string;
}

/**
 * DTO for updating an existing product variant
 * PATCH /product-variants/:id
 * All fields optional — partial update.
 */
export class UpdateProductVariantDto {
  @ApiPropertyOptional({
    description: 'MongoDB ObjectId of the parent product',
    example: '507f1f77bcf86cd799439011',
  })
  @IsOptional()
  @IsMongoId({ message: 'productId must be a valid MongoDB ID' })
  productId?: string;

  @ApiPropertyOptional({
    description: 'Updated color name',
    example: 'White',
  })
  @IsOptional()
  @IsString()
  color?: string;

  @ApiPropertyOptional({
    description: 'Updated size label',
    example: 'Large',
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    description: 'Updated image URL',
    example: 'https://res.cloudinary.com/example/image/upload/v123/shirt-white-l.jpg',
  })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({
    description: 'Updated stock quantity',
    example: 50,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Stock cannot be negative' })
  stock?: number;

  @ApiPropertyOptional({
    description: 'Updated price for this variant',
    example: 31999,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Price must be a positive number' })
  price?: number;

  @ApiPropertyOptional({
    description: 'Updated SKU',
    example: 'DG-SHIRT-WHT-L',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: 'SKU must not exceed 100 characters' })
  sku?: string;
}

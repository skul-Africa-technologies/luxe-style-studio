import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductVariant } from '../entities/product-variant.entity';
import { CreateProductVariantDto, UpdateProductVariantDto } from '../dto';
import { ItemService } from '../../items/services/items.service';

/**
 * ProductVariantsService
 *
 * Manage variants (sub-items) for a parent Item / product.
 * Each variant carries its own color, size, image, stock, price and SKU.
 */
@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectModel(ProductVariant.name)
    private readonly variantModel: Model<ProductVariant>,
    private readonly itemsService: ItemService,
  ) {}

  /**
   * Create a new variant for a parent product.
   * Validates that the parent product exists before linking.
   */
  async create(
    createVariantDto: CreateProductVariantDto,
  ): Promise<ProductVariant> {
    if (!createVariantDto.productId) {
      throw new BadRequestException('productId is required');
    }

    // Verify parent product exists
    await this.itemsService.findOne(createVariantDto.productId);

    const variant = new this.variantModel(createVariantDto);
    return variant.save();
  }

  /**
   * Get all variants that belong to a single parent product.
   * Uses an indexed find on `productId` — no N+1.
   */
  async findByProductId(productId: string): Promise<ProductVariant[]> {
    if (!productId) {
      throw new BadRequestException('productId is required');
    }

    return this.variantModel
      .find({ productId: new (require('mongoose').Types.ObjectId)(productId) })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get all variants — optional filter by productId.
   * Admin use-case.
   */
  findAll(productId?: string): Promise<ProductVariant[]> {
    const filter = productId
      ? { productId: new (require('mongoose').Types.ObjectId)(productId) }
      : {};
    return this.variantModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  /**
   * Get a single variant by its own ID.
   * Throws 404 when not found.
   */
  async findOne(variantId: string): Promise<ProductVariant> {
    const variant = await this.variantModel.findById(variantId).exec();
    if (!variant) {
      throw new NotFoundException(`ProductVariant with ID ${variantId} not found`);
    }
    return variant;
  }

  /**
   * Update a variant by its own ID.
   * Throws 404 when not found.
   */
  async update(
    variantId: string,
    updateVariantDto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    if (updateVariantDto.productId) {
      await this.itemsService.findOne(updateVariantDto.productId);
    }

    const variant = await this.variantModel
      .findByIdAndUpdate(
        variantId,
        { $set: updateVariantDto },
        { new: true, runValidators: true },
      )
      .exec();

    if (!variant) {
      throw new NotFoundException(`ProductVariant with ID ${variantId} not found`);
    }

    return variant;
  }

  /**
   * Remove a variant permanently.
   * Throws 404 when not found.
   */
  async remove(variantId: string): Promise<void> {
    const result = await this.variantModel.findByIdAndDelete(variantId).exec();
    if (!result) {
      throw new NotFoundException(`ProductVariant with ID ${variantId} not found`);
    }
  }

  /**
   * Get one specific variant for a product by matching color + size.
   * Returns null when no match exists — used by the frontend selector.
   */
  async findVariantByAttributes(
    productId: string,
    color?: string,
    size?: string,
  ): Promise<ProductVariant | null> {
    const query: Record<string, any> = { productId };
    if (color !== undefined && color !== null && color !== '') {
      query.color = color;
    }
    if (size !== undefined && size !== null && size !== '') {
      query.size = size;
    }

    return this.variantModel.findOne(query).exec();
  }
}

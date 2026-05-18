import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { ProductVariantsController } from './controllers/product-variants.controller';
import { ProductVariantsService } from './services/product-variants.service';
import {
  ProductVariant,
  ProductVariantSchema,
} from './entities/product-variant.entity';
import { ItemsModule } from '../items/items.module';

/**
 * ProductVariantsModule
 *
 * Manages product variants (sub-items) attached to a parent product (Item).
 * A variant carries its own color, size, image, stock, price and SKU.
 */
@Module({
  imports: [
    MongooseModule.forFeature([{ name: ProductVariant.name, schema: ProductVariantSchema }]),
    // ItemsModule gives access to the parent Item store
    ItemsModule,
  ],
  controllers: [ProductVariantsController],
  providers: [ProductVariantsService],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}

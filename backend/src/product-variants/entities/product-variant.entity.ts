import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProductVariant extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Item', required: true })
  productId: Types.ObjectId;

  @Prop({ required: false })
  color?: string;

  @Prop({ required: false })
  size?: string;

  @Prop({ required: true })
  image: string;

  @Prop({ default: 0, min: 0 })
  stock: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: false, unique: false, sparse: true })
  sku?: string;
}

export const ProductVariantSchema = SchemaFactory.createForClass(ProductVariant);

// Index to quickly find all variants for a given product
ProductVariantSchema.index({ productId: 1 });
// Sparse unique index on sku — multiple variants may coexist with a null/absent sku
ProductVariantSchema.index({ sku: 1 }, { unique: true, sparse: true });

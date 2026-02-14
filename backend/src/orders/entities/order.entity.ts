import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Item', required: true })
  itemId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', nullable: true })
  userId?: Types.ObjectId;

  @Prop({ type: [OrderItemSchema], required: true })
  items: OrderItem[];

  @Prop({ required: true, min: 0 })
  total: number;

  @Prop({ default: 'pending', enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] })
  status: string;

  @Prop()
  shippingAddress?: string;

    @Prop()
  shippingLocation?: string;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'Payment', nullable: true })
  paymentId?: Types.ObjectId;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

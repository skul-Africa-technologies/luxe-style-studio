import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

/* ---------------- ORDER ITEM ---------------- */
@Schema({ _id: false })
export class OrderItem {
  @Prop({ type: Types.ObjectId, ref: 'Item', required: false })
  itemId?: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop()
  image?: string;

  @Prop()
  size?: string;

  @Prop()
  color?: string;

  @Prop()
  slug?: string;

  @Prop()
  category?: string;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;
}

export const OrderItemSchema = SchemaFactory.createForClass(OrderItem);

/* ---------------- ORDER ---------------- */
@Schema({ timestamps: true })
export class Order extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: false })
  userId?: Types.ObjectId;

  @Prop()
  fullName?: string;

  @Prop()
  email?: string;

  @Prop()
  phone?: string;

  @Prop({ type: [OrderItemSchema], required: true })
  items?: OrderItem[];

  @Prop({ required: true, min: 0 })
  total?: number;

  @Prop({ default: 'NGN' })
  currency?: string;

  @Prop({
    default: 'pending',
    enum: ['pending', 'paid', 'shipped', 'delivered', 'cancelled'],
  })
  status?: string;

  @Prop()
  shippingAddress?: string;

  @Prop()
  deliveryAddress?: string;

  @Prop()
  deliveryLat?: number;

  @Prop()
  deliveryLng?: number;

  @Prop()
  googleMapsLink?: string;

  @Prop()
  notes?: string;

  @Prop({ type: Types.ObjectId, ref: 'Payment', required: false })
  paymentId?: Types.ObjectId;

  // New fields
  @Prop({ default: false })
  isPaid: boolean;

  @Prop()
  paidAt?: Date;

  @Prop()
  customerNote?: string;

  @Prop()
  adminNote?: string;

  @Prop()
  trackingNumber?: string;

  @Prop()
  paystackReference?: string;
}

export const OrderSchema = SchemaFactory.createForClass(Order);
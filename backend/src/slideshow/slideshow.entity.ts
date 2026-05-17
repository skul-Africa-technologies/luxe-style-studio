import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SlideshowDocument = Slideshow & Document;

@Schema({ timestamps: true })
export class Slideshow {
  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  displayText: string;

  @Prop({ default: 0 })
  order: number;

  @Prop({ default: true })
  isActive: boolean;
}

export const SlideshowSchema = SchemaFactory.createForClass(Slideshow);
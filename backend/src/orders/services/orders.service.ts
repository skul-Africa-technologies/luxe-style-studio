import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto';

/**
 * OrdersService - Handles order-related business logic
 */
@Injectable()
export class OrdersService {
  constructor(@InjectModel(Order.name) private orderModel: Model<Order>) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = new this.orderModel({
      ...createOrderDto,
      userId: createOrderDto.userId ? new Types.ObjectId(createOrderDto.userId) : undefined,
      items: createOrderDto.items.map(item => ({
        ...item,
        itemId: new Types.ObjectId(item.itemId),
      })),
    });
    return order.save();
  }

  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.orderModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel.findById(id).populate('items.itemId');
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findByIdAndUpdate(
      id,
      { $set: updateStatusDto },
      { new: true },
    );

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  async remove(id: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndDelete(id);
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  async getOrderCount(): Promise<number> {
    return this.orderModel.countDocuments();
  }

  async getTotalSales(): Promise<number> {
    const result = await this.orderModel.aggregate([
      { $match: { status: { $in: ['paid', 'shipped', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);
    return result[0]?.total || 0;
  }

  async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderModel.find({ userId: new Types.ObjectId(userId) }).sort({ createdAt: -1 });
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto';
import { UsersService } from '../../users/services/users.service';

/**
 * OrdersService - Handles order-related business logic
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly usersService: UsersService,
  ) {}

   async create(createOrderDto: CreateOrderDto): Promise<Order> {
     let userId: Types.ObjectId | undefined;
     let isNewUser = false;

     // If email is provided, find or create user
     if (createOrderDto.email) {
       const { user, isNew } = await this.usersService.findOrCreateFromCheckout({
         email: createOrderDto.email,
         name: createOrderDto.fullName || '',
         phone: createOrderDto.phone,
         address: createOrderDto.shippingAddress || createOrderDto.deliveryAddress,
       });
       userId = user._id as Types.ObjectId;
       isNewUser = isNew;
     }

     const order = new this.orderModel({
       ...createOrderDto,
       currency: createOrderDto.currency || 'NGN',
       userId,
       fullName: createOrderDto.fullName,
       email: createOrderDto.email,
       phone: createOrderDto.phone,
       items: createOrderDto.items.map(item => ({
         ...item,
         itemId: new Types.ObjectId(item.itemId),
       })),
     });

    const savedOrder = await order.save();

    // Add order to user's orders array if user exists
    if (userId) {
      await this.usersService.addOrderToUser(userId.toString(), savedOrder._id.toString());
    }

    return savedOrder;
  }

  async findAll(page: number = 1, limit: number = 10, status?: string) {
    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.orderModel.find(query)
        .populate('userId', 'name email phone address city country postalCode')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 }),
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
    const order = await this.orderModel.findById(id)
      .populate('userId', 'name email phone address city country postalCode');
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

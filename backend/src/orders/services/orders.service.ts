import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Order } from '../entities/order.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto';
import { UsersService } from '../../users/services/users.service';
import { ItemsService } from '../../items/services/items.service';

/**
 * OrdersService - Handles order-related business logic
 */
@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<Order>,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
  ) {}

  /**
   * CREATE ORDER (PRODUCTION SAFE VERSION)
   */
  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    let userId: Types.ObjectId | undefined;

    // Create or find user
    if (createOrderDto.email) {
      const { user } = await this.usersService.findOrCreateFromCheckout({
        email: createOrderDto.email,
        name: createOrderDto.fullName || '',
        phone: createOrderDto.phone,
        address:
          createOrderDto.shippingAddress || createOrderDto.deliveryAddress,
      });

      userId = user._id as Types.ObjectId;
    }

    // Build safe product snapshot for each item
    const processedItems = await Promise.all(
      createOrderDto.items.map(async (item) => {
        let product = null;

        try {
          product = await this.itemsService.findOne(item.itemId);
        } catch (err) {
          product = null; // prevent crash if product missing
        }

        return {
          itemId: new Types.ObjectId(item.itemId),

          name: product?.name || item.name || 'Unknown Product',

          image:
            product?.imageUrl ||
            product?.images?.[0] ||
            null,

          price: product?.price || item.price || 0,

          quantity: item.quantity || 1,

          size: item.size || null,

          color: item.color || null,

          slug: product?.slug || null,

          category: product?.category || null,
        };
      }),
    );

    // Create order
    const order = new this.orderModel({
      ...createOrderDto,
      currency: createOrderDto.currency || 'NGN',
      userId,
      fullName: createOrderDto.fullName,
      email: createOrderDto.email,
      phone: createOrderDto.phone,
      items: processedItems,
    });

    const savedOrder = await order.save();

    // Attach order to user if exists
    if (userId) {
      await this.usersService.addOrderToUser(
        userId.toString(),
        savedOrder._id.toString(),
      );
    }

    return savedOrder;
  }

  /**
   * GET ALL ORDERS (ADMIN)
   */
  async findAll(page = 1, limit = 10, status?: string) {
    const query: any = {};
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.orderModel
        .find(query)
        .populate(
          'userId',
          'name email phone address city country postalCode',
        )
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

  /**
   * GET SINGLE ORDER
   */
  async findOne(id: string): Promise<Order> {
    const order = await this.orderModel
      .findById(id)
      .populate(
        'userId',
        'name email phone address city country postalCode',
      );

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * UPDATE ORDER STATUS
   */
  async updateStatus(
    id: string,
    updateStatusDto: UpdateOrderStatusDto,
  ): Promise<Order> {
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

  /**
   * DELETE ORDER
   */
  async remove(id: string): Promise<Order> {
    const order = await this.orderModel.findByIdAndDelete(id);

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    return order;
  }

  /**
   * ORDER COUNT
   */
  async getOrderCount(): Promise<number> {
    return this.orderModel.countDocuments();
  }

  /**
   * TOTAL SALES
   */
  async getTotalSales(): Promise<number> {
    const result = await this.orderModel.aggregate([
      {
        $match: {
          status: { $in: ['paid', 'shipped', 'delivered'] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$total' },
        },
      },
    ]);

    return result[0]?.total || 0;
  }

  /**
   * GET USER ORDERS
   */
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Payment } from '../entities/payment.entity';
import { CreatePaymentDto, UpdatePaymentStatusDto } from '../dto';
import { OrdersService } from '../../orders/services/orders.service';

/**
 * PaymentsService - Handles payment-related business logic
 * Manual payment system for now, ready for 3PL integration
 */
@Injectable()
export class PaymentsService {
  constructor(
    @InjectModel(Payment.name) private paymentModel: Model<Payment>,
    private ordersService: OrdersService,
  ) {}

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    // Verify order exists
    await this.ordersService.findOne(createPaymentDto.orderId);

    const payment = new this.paymentModel({
      ...createPaymentDto,
      orderId: new Types.ObjectId(createPaymentDto.orderId),
    });

    const savedPayment = await payment.save();

    // Update order payment status
    await this.ordersService.updateStatus(createPaymentDto.orderId, {
      status: 'paid',
    });

    return savedPayment;
  }

  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.paymentModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.paymentModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentModel.findById(id);
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async updateStatus(id: string, updateStatusDto: UpdatePaymentStatusDto): Promise<Payment> {
    const payment = await this.paymentModel.findByIdAndUpdate(
      id,
      { $set: updateStatusDto },
      { new: true },
    );

    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }

    return payment;
  }

  async getPaymentsByOrder(orderId: string): Promise<Payment[]> {
    return this.paymentModel.find({ orderId: new Types.ObjectId(orderId) });
  }

  async getTotalRevenue(): Promise<number> {
    const result = await this.paymentModel.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    return result[0]?.total || 0;
  }
}

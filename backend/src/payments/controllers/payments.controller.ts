import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from '@/orders/services/orders.service';
import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  Req,
  Res,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';
import { Response } from 'express';
import * as crypto from 'crypto';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize payment', description: 'Initialize a payment for an order via Paystack' })
  async initializePayment(@Body() body: { orderId: string }, @Res({ passthrough: true }) res: Response) {
    const order = await this.ordersService.findOne(body.orderId);

    if (!order.email) {
      throw new Error('Order email is required for payment initialization');
    }

    if (!order.total) {
      throw new Error('Order total is required for payment initialization');
    }

    const response = await this.paymentsService.initializePayment(
      order.email,
      order.total,
      order._id.toString(),
    );

    // Save paystack reference on the order
    const reference = response.data?.data?.reference;
    if (reference) {
      await this.ordersService.updateStatus(order._id.toString(), {
        paystackReference: reference,
      });
    }

    // Return the full paystack response body
    res.json(response.data);
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify payment', description: 'Verify payment status via Paystack and update order status' })
  async verify(@Query('reference') reference: string) {
    const result = await this.paymentsService.verifyPayment(reference);
    const paystackPayload = result.data;

    if (paystackPayload.status === true && paystackPayload.data.status === 'success') {
      // Find order by paystack reference — more reliable than metadata
      const order = await this.ordersService.findByPaystackReference(reference);
      await this.ordersService.markAsPaid(order._id.toString());
      return { success: true, orderId: order._id.toString(), reference };
    }

    return { success: false, orderId: paystackPayload.data.metadata?.orderId, reference };
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Paystack webhook', description: 'Handle Paystack charge.success webhook events' })
  async webhook(@Req() req: any) {
    const logger = new Logger('PaymentsController');

    // Verify Paystack signature using raw body bytes
    const paystackSignature = req.headers['x-paystack-signature'];
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      logger.error('PAYSTACK_SECRET_KEY is not set');
      return { received: false };
    }

    const signature = crypto
      .createHmac('sha512', secretKey)
      .update(req.rawBody)
      .digest('hex');

    if (signature !== paystackSignature) {
      logger.warn('Invalid Paystack webhook signature');
      return { received: false };
    }

    // Parse the already-verified body
    const event = req.body?.event;
    const data = req.body?.data;

    try {
      if (event === 'charge.success') {
        const reference = data?.data?.reference;
        if (reference) {
          const order = await this.ordersService.findByPaystackReference(reference);
          // Idempotent — markAsPaid only acts if not already paid
          await this.ordersService.markAsPaid(order._id.toString());
          logger.log(`Order ${order._id.toString()} marked as paid via webhook`);
        }
      }
    } catch (err) {
      // Never throw — always return 200 to avoid Paystack retrying
      logger.error('Error processing webhook', err as Error);
    }

    // Always return 200 so Paystack does not retry
    return { received: true };
  }
}

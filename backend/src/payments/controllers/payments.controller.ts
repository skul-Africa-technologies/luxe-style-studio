import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from '@/orders/services/orders.service';
import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { PaymentsService } from '../services/payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize payment', description: 'Initialize a payment for an order via Paystack' })
  async initializePayment(@Body() body: { orderId: string }) {
    const order = await this.ordersService.findOne(body.orderId);

    if (!order.email) {
      throw new Error('Order email is required for payment initialization');
    }

    if (!order.total) {
      throw new Error('Order total is required for payment initialization');
    }

    return this.paymentsService.initializePayment(
      order.email,
      order.total,
      order._id.toString(),
    );
  }

  @Get('verify')
  @ApiOperation({ summary: 'Verify payment', description: 'Verify payment status via Paystack and update order status' })
  async verify(@Query('reference') reference: string) {
    const result = await this.paymentsService.verifyPayment(reference);

    const orderId = result.data.metadata.orderId;

    if (result.data.status === 'success') {
      await this.ordersService.updateStatus(orderId, {
        status: 'paid',
      });

      await this.ordersService.markAsPaid(orderId);
    }

    return result;
  }
}

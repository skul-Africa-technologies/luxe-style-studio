import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PaymentsService } from '../services/payments.service';
import { CreatePaymentDto, UpdatePaymentStatusDto } from '../dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

/**
 * PaymentsController - Handles payment management endpoints (Admin only)
 * Ready for future 3PL payment integration
 */
@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment', description: 'Record a manual payment' })
  @ApiResponse({ status: 201, description: 'Payment recorded successfully' })
  async create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all payments', description: 'Retrieve paginated list of payments' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  @ApiResponse({ status: 200, description: 'List of payments' })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.paymentsService.findAll(page ? Number(page) : 1, limit ? Number(limit) : 10);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment by ID', description: 'Retrieve single payment details' })
  @ApiResponse({ status: 200, description: 'Payment details' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update payment status', description: 'Update payment status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Payment status updated' })
  @ApiResponse({ status: 404, description: 'Payment not found' })
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdatePaymentStatusDto) {
    return this.paymentsService.updateStatus(id, updateStatusDto);
  }
}

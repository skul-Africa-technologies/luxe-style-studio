import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from '../dto';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles, Public, CurrentUser } from '../../common/decorators';
import { JwtPayload } from '../../common/interfaces';

/**
 * OrdersController - Handles order management endpoints
 */
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create order', description: 'Create a new order (manual payment)' })
  @ApiResponse({ status: 201, description: 'Order created successfully' })
  async create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Get all orders', description: 'Retrieve paginated list of orders' })
  @ApiBearerAuth()
  @ApiQuery({ name: 'status', required: false })
  @ApiResponse({ status: 200, description: 'List of orders' })
  async findAll(@Query('status') status?: string) {
    return this.ordersService.findAll(1, 10, status);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID', description: 'Retrieve single order details (Public access)' })
  @ApiResponse({ status: 200, description: 'Order details' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status', description: 'Update order status (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Cancel order', description: 'Cancel/delete an order (Admin only)' })
  @ApiBearerAuth()
  @ApiResponse({ status: 200, description: 'Order cancelled' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }
}

import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from '../services/admin.service';
import { JwtAuthGuard, RolesGuard } from '../../common/guards';
import { Roles } from '../../common/decorators';

/**
 * AdminController - Handles admin dashboard endpoints
 * Aggregates analytics data for the admin dashboard
 */
@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get dashboard data', description: 'Retrieve aggregated analytics for admin dashboard' })
  @ApiResponse({ status: 200, description: 'Dashboard data with total sales, users, orders, and items' })
  async getDashboard() {
    return this.adminService.getDashboardData();
  }
}

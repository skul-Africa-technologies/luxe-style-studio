import { Injectable } from '@nestjs/common';
import { ItemsService } from '../../items/services/items.service';
import { UsersService } from '../../users/services/users.service';
import { OrdersService } from '../../orders/services/orders.service';
import { PaymentsService } from '../../payments/services/payments.service';

@Injectable()
export class AdminService {
  constructor(
    private itemsService: ItemsService,
    private usersService: UsersService,
    private ordersService: OrdersService,
    private paymentsService: PaymentsService,
  ) {}

  // ✅ Helper: Trend Calculator
  private calculateTrend(current: number, previous: number) {
    if (previous === 0) return 100;
    return ((current - previous) / previous) * 100;
  }

  async getDashboardData() {
    // ---------- DATE RANGES ----------
    const now = new Date();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfYesterday.getDate() - 1);

    const startOfWeek = new Date();
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

    // ---------- TOTAL COUNTS ----------
    const [totalItems, totalUsers, totalOrders, totalSales, recentOrders] =
      await Promise.all([
        this.itemsService.getItemCount(),
        this.usersService.getUserCount(),
        this.ordersService.getOrderCount(),
        this.ordersService.getTotalRevenue(),
        this.ordersService.findAll(1, 5),
      ]);

    // ---------- ORDERS TODAY vs YESTERDAY ----------
    const ordersToday = await this.ordersService['orderModel'].countDocuments({
      createdAt: { $gte: startOfToday },
    });

    const ordersYesterday =
      await this.ordersService['orderModel'].countDocuments({
        createdAt: { $gte: startOfYesterday, $lt: startOfToday },
      });

    // ---------- SALES TODAY vs YESTERDAY ----------
    const salesTodayAgg = await this.ordersService['orderModel'].aggregate([
      { $match: { createdAt: { $gte: startOfToday } } },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const salesYesterdayAgg = await this.ordersService['orderModel'].aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYesterday, $lt: startOfToday },
        },
      },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    const salesToday = salesTodayAgg[0]?.total || 0;
    const salesYesterday = salesYesterdayAgg[0]?.total || 0;

    // ---------- WEEKLY ORDERS ----------
    const ordersThisWeek =
      await this.ordersService['orderModel'].countDocuments({
        createdAt: { $gte: startOfWeek },
      });

    const ordersLastWeek =
      await this.ordersService['orderModel'].countDocuments({
        createdAt: { $gte: startOfLastWeek, $lt: startOfWeek },
      });

    // ---------- RETURN FULL DASHBOARD ----------
    return {
      // Totals
      totalSales,
      totalUsers,
      totalOrders,
      totalItems,

      // Recent Orders
      recentOrders: recentOrders.data,

      // Analytics Trends (REAL)
      analytics: {
        orders: {
          today: ordersToday,
          yesterday: ordersYesterday,
          trend: this.calculateTrend(ordersToday, ordersYesterday),
        },

        sales: {
          today: salesToday,
          yesterday: salesYesterday,
          trend: this.calculateTrend(salesToday, salesYesterday),
        },

        weeklyOrders: {
          thisWeek: ordersThisWeek,
          lastWeek: ordersLastWeek,
          trend: this.calculateTrend(ordersThisWeek, ordersLastWeek),
        },
      },

      // Existing Aggregations
      salesByStatus: await this.getSalesByOrderStatus(),
      ordersTrend: await this.getOrdersTrend(),
    };
  }

  // ✅ Sales grouped by status
  private async getSalesByOrderStatus() {
    return await this.ordersService['orderModel'].aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          total: { $sum: '$total' },
        },
      },
    ]);
  }

  // ✅ Orders trend (last 30 days)
  private async getOrdersTrend() {
    return await this.ordersService['orderModel'].aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]);
  }

  // ✅ Clear all dashboard data (for resetting)
  async clearAllDashboardData() {
    const [ordersDeleted, usersDeleted, itemsDeleted, paymentsDeleted] =
      await Promise.all([
        this.ordersService['orderModel'].deleteMany({}),
        this.usersService['userModel'].deleteMany({}),
        this.itemsService['itemModel'].deleteMany({}),
        this.paymentsService['paymentModel'].deleteMany({}),
      ]);

    return {
      message: 'All dashboard data cleared successfully',
      deleted: {
        orders: ordersDeleted.deletedCount,
        users: usersDeleted.deletedCount,
        items: itemsDeleted.deletedCount,
        payments: paymentsDeleted.deletedCount,
      },
    };
  }
}

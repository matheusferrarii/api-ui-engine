import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AIQueryable } from '../ai/decorators/ai-queryable.decorator';
import { z } from 'zod';

@ApiTags('Mock Endpoints')
@Controller('sales')
export class SalesController {
  
  @ApiOperation({ summary: 'Retorna KPIs e dados comerciais', description: 'Fornece o panorama de vendas para alimentar a IU do Dashboard de Vendas.' })
  @Get()
  @AIQueryable({
    description: 'Fetch total sales and KPI data for either a specific month or year to date.',
    filters: z.object({
      period: z.enum(['month', 'year']).optional().nullable().describe('Filter by month or year'),
    }),
  })
  getSalesData(@Query('period') period?: string) {
    // Mock data reflecting the user's Sales Dashboard JSON
    return {
      totalSales: { value: 48230, unit: 'BRL', trend: 'up', trendValue: '+12.4%' },
      ordersCount: 342,
      averageTicket: 141,
      newCustomers: 87,
      monthlySalesData: [
        { month: 'Jan', value: 32000 },
        { month: 'Feb', value: 28000 },
        { month: 'Mar', value: 41000 },
        { month: 'Apr', value: 37500 },
        { month: 'May', value: 48230 },
      ],
      categories: [
        { name: 'Electronics', percentage: 45 },
        { name: 'Clothes', percentage: 25 },
        { name: 'Food', percentage: 20 },
        { name: 'Others', percentage: 10 },
      ],
      recentSales: [
        { product: 'Notebook Pro', customer: 'João Silva', value: 4500, status: 'Paid' },
        { product: 'Mouse Gamer', customer: 'Ana Souza', value: 250, status: 'Shipped' },
      ]
    };
  }
}

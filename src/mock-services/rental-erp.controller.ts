import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AIQueryable } from '../ai/decorators/ai-queryable.decorator';
import { z } from 'zod';

@ApiTags('Mock Endpoints')
@Controller('rental')
export class RentalController {
  
  @ApiOperation({ summary: 'Retorna dados do sistema de locação', description: 'Traz balanços de contratos ativos, inadimplência e taxa de ocupação.' })
  @Get()
  @AIQueryable({
    description: 'Fetch data regarding rental contracts, assets, and financial delinquencies.',
    filters: z.object({
      status: z.enum(['active', 'expired', 'delinquent', 'all']).optional().nullable(),
    }),
  })
  getRentalData(@Query('status') status?: string) {
    return {
      activeContracts: 312,
      monthlyRevenue: 94500,
      delinquentCount: 18,
      occupancyRate: 83,
      contractsExpiringSoon: [
        'Contract #4821 - Client Alfa - expires in 2 days',
        'Contract #4834 - Client Beta - expires in 5 days'
      ],
      revenueByCategory: [
        { category: 'Vehicles', value: 42000 },
        { category: 'Equipment', value: 28500 },
        { category: 'Real Estate', value: 18000 },
      ],
      delinquentList: [
        { client: 'Cia Industrial', contract: '#3912', amountDue: 4200, daysLate: 45, action: 'Notify' },
        { client: 'Transp. Norte', contract: '#4102', amountDue: 2800, daysLate: 30, action: 'Charge' }
      ]
    };
  }
}

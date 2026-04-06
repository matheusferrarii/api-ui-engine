import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AIQueryable } from '../ai/decorators/ai-queryable.decorator';
import { z } from 'zod';

@ApiTags('Mock Endpoints')
@Controller('pharmacy')
export class PharmacyController {
  
  @ApiOperation({ summary: 'Retorna dados farmacêuticos e controle de vencimentos', description: 'Monitora medicações, prazos de validade e nível de perigo de vencimento.' })
  @Get()
  @AIQueryable({
    description: 'Fetch data regarding pharmacy stock, impending expirations, and daily sales/prescriptions.',
    filters: z.object({
      category: z.string().optional().nullable(),
    }),
  })
  getPharmacyData(@Query('category') category?: string) {
    return {
      totalMedicines: 2140,
      salesTodayValue: 4280,
      prescriptionsToday: 312,
      expiringWithin30DaysCount: 47,
      expiringItems: [
        'Amoxicilina 500mg - 120 units expiring in 15 days',
        'Dipirona 1g - 80 units expiring in 22 days'
      ],
      salesByCategory: [
        { category: 'Analgesics', value: 340 },
        { category: 'Antibiotics', value: 210 },
      ],
      topSellingToday: [
        { name: 'Dipirona 500mg', type: 'Analgesic', quantity: 48 },
        { name: 'Amoxicilina 500mg', type: 'Antibiotic', quantity: 32 },
      ],
      dailyPrescriptions: [
        { patient: 'M. Oliveira', doctor: 'Dr. Costa', medicine: 'Amoxicilina 500mg', quantity: 21, status: 'Dispensed' }
      ]
    };
  }
}

import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AIQueryable } from '../ai/decorators/ai-queryable.decorator';
import { z } from 'zod';

@ApiTags('Mock Endpoints')
@Controller('events')
export class EventsController {
  
  @ApiOperation({ summary: 'Retorna a agenda de eventos', description: 'Puxa dados de eventos, inscritos e receita de ingressos para a IU do Painel de Eventos.' })
  @Get()
  @AIQueryable({
    description: 'Fetch data about events, event registrations, and revenue for standard panels.',
    filters: z.object({
      status: z.enum(['upcoming', 'past', 'all']).optional().nullable(),
    }),
  })
  getEventsData(@Query('status') status?: string) {
    // Mock data reflecting the user's Events Panel JSON
    return {
      eventsToday: 5,
      totalRegistrations: 1240,
      totalRevenue: 32400,
      averageOccupancyRate: 74,
      upcomingEvents: [
        { name: 'Tech Summit 2025', date: '10 May', location: 'Main Auditorium', registrations: 420 },
        { name: 'Workshop UX Design', date: '12 May', location: 'Online', registrations: 180 },
        { name: 'DevConf Brasil', date: '15 May', location: 'São Paulo', registrations: 350 },
      ],
      occupancyByEvent: [
        { event: 'Tech Summit', percentage: 84 },
        { event: 'Workshop UX', percentage: 90 },
      ],
      recentRegistrations: [
        { name: 'Ana Beatriz', event: 'Tech Summit', date: '2025-05-01', ticketType: 'VIP' },
        { name: 'Pedro Alves', event: 'AI Forum', date: '2025-05-01', ticketType: 'Standard' },
      ]
    };
  }
}

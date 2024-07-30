import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { ErrorResult, Result } from '../../common/exceptions/result';
import { AvailableTicketDto } from './dto.types';
import { TicketService } from './ticket.service';

@Controller('ticket')
export class TicketController {
  constructor(private readonly ticketService: TicketService) {}

  @Get('available/:id')
  async getAvailableTickets(@Param('id') eventId: number): Promise<AvailableTicketDto[]> {
    const ticketsResult: Result<AvailableTicketDto[]> =
      await this.ticketService.getAvailableTickets(eventId);

    if (ticketsResult.isSuccess()) {
      return ticketsResult.getValue();
    }

    const error: ErrorResult = ticketsResult.getError();
    throw new HttpException(error.message, error.code);
  }
}

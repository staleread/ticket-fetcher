import { Controller, Get, HttpException, Param } from '@nestjs/common';
import { Result } from '../../common/exceptions/result';
import { AvailableTicketDto } from './dto/available-ticket.dto';
import { TicketService } from './ticket.service';

@Controller('ticket')
export class TicketController {
  constructor(private readonly _ticketService: TicketService) {}

  @Get('available/:id')
  async getAvailableTickets(
    @Param('id') eventId: number,
  ): Promise<AvailableTicketDto[]> {
    const ticketsResult: Result<AvailableTicketDto[]> =
      await this._ticketService.getAvailableTickets(eventId);

    if (ticketsResult.isSuccess()) {
      return ticketsResult.value;
    }
    throw new HttpException('Oops', 500);
  }
}

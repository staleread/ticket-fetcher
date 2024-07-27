import { Injectable } from '@nestjs/common';
import { Result } from '../../common/exceptions/result';
import { PriceDto } from '../../infrastructure/theater-api/dto/price.dto';
import { SeatDto } from '../../infrastructure/theater-api/dto/seat.dto';
import { SectionDto } from '../../infrastructure/theater-api/dto/section.dto';
import { TheaterLayoutDto } from '../../infrastructure/theater-api/dto/theater-layout.dto';
import { TheaterApiService } from '../../infrastructure/theater-api/theater-api.service';
import { AvailableTicketDto } from './dto/available-ticket.dto';

@Injectable()
export class TicketService {
  constructor(private readonly theaterApiService: TheaterApiService) {}

  async getAvailableTickets(eventId: number): Promise<Result<AvailableTicketDto[]>> {
    if (eventId < 1) {
      return Result.failure('Event id should be greater than zero', 400);
    }

    const pricesResult: Result<PriceDto[]> =
      await this.theaterApiService.getPricesPerZone(eventId);

    if (pricesResult.isFailure()) {
      return Result.fromFailure(pricesResult.getError());
    }

    const theaterLayoutResult: Result<TheaterLayoutDto> =
      await this.theaterApiService.getTheaterLayout(eventId);

    if (theaterLayoutResult.isFailure()) {
      return Result.fromFailure(theaterLayoutResult.getError());
    }

    const prices: PriceDto[] = pricesResult.getValue();
    const { seats, sections } = theaterLayoutResult.getValue();

    const AVAILABLE_SEAT_STATUS = '0';

    const availableSeats: SeatDto[] = seats.filter(
      (seat: SeatDto) => seat.statusCode === AVAILABLE_SEAT_STATUS,
    );

    return this.toAvailableTicketsResult(availableSeats, sections, prices);
  }

  private toAvailableTicketsResult(
    availableSeats: SeatDto[],
    sections: SectionDto[],
    prices: PriceDto[],
  ): Result<AvailableTicketDto[]> {
    const priceByZoneIdMap = new Map<string, PriceDto>(prices.map((p) => [p.zoneId, p]));
    const sectionByIdMap = new Map<string, SectionDto>(sections.map((s) => [s.id, s]));

    const tickets: AvailableTicketDto[] = [];

    for (const seat of availableSeats) {
      const price: PriceDto | undefined = priceByZoneIdMap.get(seat.zoneId);

      if (price === undefined) {
        return Result.failure('Price not found', 404);
      }

      const section: SectionDto | undefined = sectionByIdMap.get(seat.sectionId);

      if (section === undefined) {
        return Result.failure('Section not found', 404);
      }

      tickets.push({
        seatId: seat.id,
        seatNumber: seat.seatNumber,
        rowNumber: seat.rowNumber,
        price: price.price,
        section: section,
      });
    }
    return Result.success(tickets);
  }
}

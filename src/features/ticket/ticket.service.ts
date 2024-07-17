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
  constructor(private readonly _theaterApiService: TheaterApiService) {}

  async getAvailableTickets(eventId: number): Promise<Result<AvailableTicketDto[]>> {
    const pricesResult: Result<PriceDto[]> =
      await this._theaterApiService.getPricesPerZone(eventId);

    if (pricesResult.isFailure()) {
      return Result.fromFailure(pricesResult.error);
    }

    const theaterLayoutResult: Result<TheaterLayoutDto> =
      await this._theaterApiService.getTheaterLayout(eventId);

    if (theaterLayoutResult.isFailure()) {
      return Result.fromFailure(theaterLayoutResult.error);
    }

    const prices: PriceDto[] = pricesResult.value;
    const { seats, sections } = theaterLayoutResult.value;

    const AVAILABLE_SEAT_STATUS = '0';

    const availableSeats: SeatDto[] = seats.filter(
      (seat: SeatDto) => seat.statusCode === AVAILABLE_SEAT_STATUS,
    );

    return this._toAvailableTicketsResult(availableSeats, sections, prices);
  }

  private _toAvailableTicketsResult(
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

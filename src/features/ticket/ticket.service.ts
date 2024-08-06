import { Injectable } from '@nestjs/common';
import { Result } from '../../common/exceptions/result';
import {
  PriceDto,
  SeatDto,
  SectionDto,
  TheatreLayoutDto,
} from '../../infrastructure/theatre-api/dto.types';
import { TheatreApiService } from '../../infrastructure/theatre-api/theatre-api.service';
import { AvailableTicketDto } from './dto.types';

@Injectable()
export class TicketService {
  constructor(private readonly theatreApiService: TheatreApiService) {}

  async getAvailableTickets(eventId: number): Promise<Result<AvailableTicketDto[]>> {
    if (eventId < 1) {
      return Result.failure('Event id should be greater than zero', 400);
    }

    const pricesResult: Result<PriceDto[]> =
      await this.theatreApiService.getPricesPerZone(eventId);

    if (pricesResult.isFailure()) {
      return Result.fromFailure(pricesResult.getError());
    }

    const theatreLayoutResult: Result<TheatreLayoutDto> =
      await this.theatreApiService.getTheatreLayout(eventId);

    if (theatreLayoutResult.isFailure()) {
      return Result.fromFailure(theatreLayoutResult.getError());
    }

    const prices: PriceDto[] = pricesResult.getValue();
    const { seats, sections } = theatreLayoutResult.getValue();

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

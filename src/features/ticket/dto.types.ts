import { SectionDto } from '../../infrastructure/theatre-api/dto.types';

export interface AvailableTicketDto {
  seatId: string;
  seatNumber: string;
  rowNumber: string;
  price: number;
  section: SectionDto;
}

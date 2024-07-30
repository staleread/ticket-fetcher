import { SectionDto } from '../../infrastructure/theater-api/dto.types';

export interface AvailableTicketDto {
  seatId: string;
  seatNumber: string;
  rowNumber: string;
  price: number;
  section: SectionDto;
}

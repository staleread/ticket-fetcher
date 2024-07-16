import { SectionDto } from '../../../infrastructure/theater-api/dto/section.dto';

export interface AvailableTicketDto {
  seatId: string;
  seatNumber: string;
  rowNumber: string;
  price: number;
  section: SectionDto;
}

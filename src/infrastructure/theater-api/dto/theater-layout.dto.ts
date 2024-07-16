import { SeatDto } from './seat.dto';
import { SectionDto } from './section.dto';

export interface TheaterLayoutDto {
  seats: SeatDto[];
  sections: SectionDto[];
}

export interface PriceDto {
  zoneId: string;
  price: number;
}

export interface SeatDto {
  id: string;
  statusCode: string;
  zoneId: string;
  rowNumber: string;
  seatNumber: string;
  sectionId: string;
}

export interface SectionDto {
  id: string;
  description: string;
}

export interface TheaterLayoutDto {
  seats: SeatDto[];
  sections: SectionDto[];
}

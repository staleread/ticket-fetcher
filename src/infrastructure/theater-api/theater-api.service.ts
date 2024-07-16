import { Injectable } from '@nestjs/common';
import { Result } from '../../common/exceptions/result';
import { PriceDto } from './dto/price.dto';
import { TheaterLayoutDto } from './dto/theater-layout.dto';

@Injectable()
export class TheaterApiService {
  async getPricesPerZone(eventId: number): Promise<Result<PriceDto[]>> {
    console.log(eventId);

    return new Promise((resolve) => {
      const result = [
        {
          zoneId: '12',
          price: 123,
          description: 'Balcony X',
        },
        {
          zoneId: '13',
          price: 100,
          description: 'Balcony Y',
        },
        {
          zoneId: '14',
          price: 133,
          description: 'Balcony D',
        },
        {
          zoneId: '15',
          price: 153,
          description: 'Balcony A',
        },
      ];
      resolve(Result.success(result));
    });
  }

  async getTheaterLayout(eventId: number): Promise<Result<TheaterLayoutDto>> {
    console.log(eventId);

    return new Promise((resolve) => {
      const result = {
        seats: [
          {
            id: '1',
            statusCode: '16',
            zoneId: '15',
            rowNumber: 'BXC',
            seatNumber: '3',
            sectionId: '1',
          },
          {
            id: '2',
            statusCode: '0',
            zoneId: '15',
            rowNumber: 'BXC',
            seatNumber: '3',
            sectionId: '1',
          },
          {
            id: '3',
            statusCode: '16',
            zoneId: '15',
            rowNumber: 'BXC',
            seatNumber: '3',
            sectionId: '1',
          },
          {
            id: '4',
            statusCode: '0',
            zoneId: '15',
            rowNumber: 'BXC',
            seatNumber: '3',
            sectionId: '1',
          },
        ],
        sections: [
          {
            id: '1',
            description: 'Balcony',
          },
        ],
      };

      resolve(Result.success(result));
    });
  }
}

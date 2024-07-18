import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Result } from '../../common/exceptions/result';
import { PriceDto } from '../../infrastructure/theater-api/dto/price.dto';
import { TheaterLayoutDto } from '../../infrastructure/theater-api/dto/theater-layout.dto';
import { TheaterApiService } from '../../infrastructure/theater-api/theater-api.service';
import { AvailableTicketDto } from './dto/available-ticket.dto';
import { TicketService } from './ticket.service';

describe('TicketService', () => {
  let ticketService: TicketService;

  const mockTheaterAPIService = {
    getPricesPerZone: async (_: number): Promise<Result<PriceDto[]>> => {
      return new Promise((res) => res(Result.success([])));
    },
    getTheaterLayout: async (_: number): Promise<Result<TheaterLayoutDto>> => {
      return new Promise((res) =>
        res(
          Result.success({
            seats: [],
            sections: [],
          }),
        ),
      );
    },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        TicketService,
        {
          provide: TheaterApiService,
          useValue: mockTheaterAPIService,
        },
      ],
    }).compile();

    ticketService = moduleRef.get<TicketService>(TicketService);
  });

  it('should be defined', () => {
    expect(ticketService).toBeDefined();
  });

  describe('getAvailableTickets', () => {
    it('should assemble tickets correctly', async () => {
      const validEventId = 20000;

      const mockPrices: PriceDto[] = [
        {
          zoneId: '1',
          price: 40,
        },
        {
          zoneId: '2',
          price: 80,
        },
      ];

      const mockTheaterLayout: TheaterLayoutDto = {
        seats: [
          {
            id: '111',
            statusCode: '0',
            zoneId: '1',
            rowNumber: '21',
            seatNumber: 'X',
            sectionId: '1',
          },
          {
            id: '222',
            statusCode: '0',
            zoneId: '2',
            rowNumber: '21',
            seatNumber: 'Y',
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

      const expectedTickets: AvailableTicketDto[] = [
        {
          seatId: '111',
          seatNumber: 'X',
          rowNumber: '21',
          price: 40,
          section: {
            id: '1',
            description: 'Balcony',
          },
        },
        {
          seatId: '222',
          seatNumber: 'Y',
          rowNumber: '21',
          price: 80,
          section: {
            id: '1',
            description: 'Balcony',
          },
        },
      ];

      jest
        .spyOn(mockTheaterAPIService, 'getPricesPerZone')
        .mockImplementation(
          (_: number) => new Promise((resolve) => resolve(Result.success(mockPrices))),
        );

      jest
        .spyOn(mockTheaterAPIService, 'getTheaterLayout')
        .mockImplementation(
          (_: number) =>
            new Promise((resolve) => resolve(Result.success(mockTheaterLayout))),
        );

      expect(await ticketService.getAvailableTickets(validEventId)).toEqual(
        Result.success(expectedTickets),
      );
    });

    it('should return only available seats', async () => {
      const validEventId = 20000;

      const mockPrices: PriceDto[] = [
        {
          zoneId: '1',
          price: 40,
        },
        {
          zoneId: '2',
          price: 80,
        },
      ];

      const mockTheaterLayout: TheaterLayoutDto = {
        seats: [
          {
            id: '111',
            statusCode: '0',
            zoneId: '1',
            rowNumber: '21',
            seatNumber: 'X',
            sectionId: '1',
          },
          {
            id: '222',
            statusCode: '8', // not available
            zoneId: '2',
            rowNumber: '21',
            seatNumber: 'Y',
            sectionId: '1',
          },
          {
            id: '333',
            statusCode: '0',
            zoneId: '1',
            rowNumber: '22',
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

      jest
        .spyOn(mockTheaterAPIService, 'getPricesPerZone')
        .mockImplementation(
          (_: number) => new Promise((resolve) => resolve(Result.success(mockPrices))),
        );

      jest
        .spyOn(mockTheaterAPIService, 'getTheaterLayout')
        .mockImplementation(
          (_: number) =>
            new Promise((resolve) => resolve(Result.success(mockTheaterLayout))),
        );

      const result = await ticketService.getAvailableTickets(validEventId);

      expect(result.isSuccess()).toBe(true);
      expect(result.value.length).toBe(2);
    });

    it('should throw if price cannot be found by zoneId', async () => {
      const validEventId = 20000;

      const mockPrices: PriceDto[] = [];

      const mockTheaterLayout: TheaterLayoutDto = {
        seats: [
          {
            id: '333',
            statusCode: '0',
            zoneId: '1', // no such zone
            rowNumber: '22',
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

      jest
        .spyOn(mockTheaterAPIService, 'getPricesPerZone')
        .mockImplementation(
          (_: number) => new Promise((resolve) => resolve(Result.success(mockPrices))),
        );

      jest
        .spyOn(mockTheaterAPIService, 'getTheaterLayout')
        .mockImplementation(
          (_: number) =>
            new Promise((resolve) => resolve(Result.success(mockTheaterLayout))),
        );

      const result = await ticketService.getAvailableTickets(validEventId);

      expect(result.isFailure()).toBe(true);
      expect(result.error.message).toBe('Price not found');
      expect(result.error.code).toBe(404);
    });

    it('should throw if section is not found', async () => {
      const validEventId = 20000;

      const mockPrices: PriceDto[] = [
        {
          zoneId: '1',
          price: 40,
        },
      ];

      const mockTheaterLayout: TheaterLayoutDto = {
        seats: [
          {
            id: '333',
            statusCode: '0',
            zoneId: '1',
            rowNumber: '22',
            seatNumber: '3',
            sectionId: '1', // no such section
          },
        ],
        sections: [],
      };

      jest
        .spyOn(mockTheaterAPIService, 'getPricesPerZone')
        .mockImplementation(
          (_: number) => new Promise((resolve) => resolve(Result.success(mockPrices))),
        );

      jest
        .spyOn(mockTheaterAPIService, 'getTheaterLayout')
        .mockImplementation(
          (_: number) =>
            new Promise((resolve) => resolve(Result.success(mockTheaterLayout))),
        );

      const result = await ticketService.getAvailableTickets(validEventId);

      expect(result.isFailure()).toBe(true);
      expect(result.error.message).toBe('Section not found');
      expect(result.error.code).toBe(404);
    });

    it('should return failure on invalid eventId', async () => {
      const result = await ticketService.getAvailableTickets(-1);
      expect(result.isFailure()).toBe(true);
    });
  });
});

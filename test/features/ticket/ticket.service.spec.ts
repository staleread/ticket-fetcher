import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Result } from '../../../src/common/exceptions/result';
import { PriceDto, TheatreLayoutDto } from '../../../src/infrastructure/theatre-api/dto.types';
import { TheatreApiService } from '../../../src/infrastructure/theatre-api/theatre-api.service';
import { AvailableTicketDto } from '../../../src/features/ticket/dto.types';
import { TicketService } from '../../../src/features/ticket/ticket.service';

describe('TicketService', () => {
  let ticketService: TicketService;

  const mockTheatreAPIService = {
    getPricesPerZone: async (_: number): Promise<Result<PriceDto[]>> => {
      return new Promise((res) => res(Result.success([])));
    },
    getTheatreLayout: async (_: number): Promise<Result<TheatreLayoutDto>> => {
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
          provide: TheatreApiService,
          useValue: mockTheatreAPIService,
        },
      ],
    }).compile();

    ticketService = moduleRef.get<TicketService>(TicketService);
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

      const mockTheatreLayout: TheatreLayoutDto = {
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
        .spyOn(mockTheatreAPIService, 'getPricesPerZone')
        .mockImplementation(
          (_: number) => new Promise((resolve) => resolve(Result.success(mockPrices))),
        );

      jest
        .spyOn(mockTheatreAPIService, 'getTheatreLayout')
        .mockImplementation(
          (_: number) =>
            new Promise((resolve) => resolve(Result.success(mockTheatreLayout))),
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

      const mockTheatreLayout: TheatreLayoutDto = {
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
        .spyOn(mockTheatreAPIService, 'getPricesPerZone')
        .mockImplementation(
          (_: number) => new Promise((resolve) => resolve(Result.success(mockPrices))),
        );

      jest
        .spyOn(mockTheatreAPIService, 'getTheatreLayout')
        .mockImplementation(
          (_: number) =>
            new Promise((resolve) => resolve(Result.success(mockTheatreLayout))),
        );

      const result = await ticketService.getAvailableTickets(validEventId);

      expect(result.isSuccess()).toBe(true);
      expect(result.getValue().length).toBe(2);
    });

    it('should throw if price cannot be found by zoneId', async () => {
      const validEventId = 20000;

      const mockPrices: PriceDto[] = [];

      const mockTheatreLayout: TheatreLayoutDto = {
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
        .spyOn(mockTheatreAPIService, 'getPricesPerZone')
        .mockImplementation(
          (_: number) => new Promise((resolve) => resolve(Result.success(mockPrices))),
        );

      jest
        .spyOn(mockTheatreAPIService, 'getTheatreLayout')
        .mockImplementation(
          (_: number) =>
            new Promise((resolve) => resolve(Result.success(mockTheatreLayout))),
        );

      const result = await ticketService.getAvailableTickets(validEventId);

      expect(result.isFailure()).toBe(true);

      const error = result.getError();

      expect(error.message).toBe('Price not found');
      expect(error.code).toBe(404);
    });

    it('should throw if section is not found', async () => {
      const validEventId = 20000;

      const mockPrices: PriceDto[] = [
        {
          zoneId: '1',
          price: 40,
        },
      ];

      const mockTheatreLayout: TheatreLayoutDto = {
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
        .spyOn(mockTheatreAPIService, 'getPricesPerZone')
        .mockImplementation(
          (_: number) => new Promise((resolve) => resolve(Result.success(mockPrices))),
        );

      jest
        .spyOn(mockTheatreAPIService, 'getTheatreLayout')
        .mockImplementation(
          (_: number) =>
            new Promise((resolve) => resolve(Result.success(mockTheatreLayout))),
        );

      const result = await ticketService.getAvailableTickets(validEventId);

      expect(result.isFailure()).toBe(true);

      const error = result.getError();

      expect(error.message).toBe('Section not found');
      expect(error.code).toBe(404);
    });

    it('should return failure on invalid eventId', async () => {
      const result = await ticketService.getAvailableTickets(-1);
      expect(result.isFailure()).toBe(true);
    });
  });
});

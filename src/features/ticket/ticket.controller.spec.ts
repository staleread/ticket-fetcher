import { HttpException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Result } from '../../common/exceptions/result';
import { AvailableTicketDto } from './dto/available-ticket.dto';
import { TicketController } from './ticket.controller';
import { TicketService } from './ticket.service';

describe('TicketController', () => {
  let ticketController: TicketController;
  let ticketService: TicketService;

  const mockTicketService = {
    getAvailableTickets: async (eventId: number) => {},
  };

  const randomNumberBetween = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1) + min);
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [TicketController],
      providers: [TicketService],
    })
      .overrideProvider(TicketService)
      .useValue(mockTicketService)
      .compile();

    ticketController = moduleRef.get<TicketController>(TicketController);
    ticketService = moduleRef.get<TicketService>(TicketService);
  });

  it('should be defined', () => {
    expect(ticketController).toBeDefined();
  });

  describe('getAvailableTickets', () => {
    it('should return tickets', async () => {
      const validEventId = 20000;

      const tickets: AvailableTicketDto[] = [
        {
          seatId: '3',
          seatNumber: '1',
          rowNumber: 'B',
          price: 100,
          section: {
            id: '1',
            description: 'Balcony',
          },
        },
        {
          seatId: '4',
          seatNumber: '2',
          rowNumber: 'B',
          price: 100,
          section: {
            id: '1',
            description: 'Balcony',
          },
        },
      ];

      jest
        .spyOn(ticketService, 'getAvailableTickets')
        .mockImplementation(
          (eventId: number) => new Promise((resolve) => resolve(Result.success(tickets))),
        );

      expect(await ticketController.getAvailableTickets(validEventId)).toBe(tickets);
    });

    it('should throw on service failure', () => {
      const errorMessage = 'Smth wrong happened';

      jest
        .spyOn(ticketService, 'getAvailableTickets')
        .mockImplementation(
          (eventId: number) =>
            new Promise((resolve) => resolve(Result.failure(errorMessage, 500))),
        );

      expect(
        async () => await ticketController.getAvailableTickets(10000),
      ).rejects.toThrow(errorMessage);
    });
  });
});

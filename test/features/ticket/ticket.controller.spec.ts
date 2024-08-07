import { Test } from '@nestjs/testing';
import { Result } from '../../../src/common/exceptions/result';
import { AvailableTicketDto } from '../../../src/features/ticket/dto.types';
import { TicketController } from '../../../src/features/ticket/ticket.controller';
import { TicketService } from '../../../src/features/ticket/ticket.service';

describe('TicketController', () => {
  let ticketController: TicketController;
  let ticketService: TicketService;

  const mockTicketService = {
    getAvailableTickets: async (_: number) => {},
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
          (_: number) => new Promise((resolve) => resolve(Result.success(tickets))),
        );

      expect(await ticketController.getAvailableTickets(validEventId)).toBe(tickets);
    });

    it('should throw on service failure', () => {
      const errorMessage = 'Smth wrong happened';

      jest
        .spyOn(ticketService, 'getAvailableTickets')
        .mockImplementation(
          (_: number) =>
            new Promise((resolve) => resolve(Result.failure(errorMessage, 500))),
        );

      expect(
        async () => await ticketController.getAvailableTickets(10000),
      ).rejects.toThrow(errorMessage);
    });
  });
});

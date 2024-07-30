import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Axios, AxiosError, AxiosResponse, default as axios } from 'axios';
import { ErrorResult, Result } from '../../common/exceptions/result';
import { LoginInfo } from '../../config/login-info.types';
import { PriceDto, SeatDto, SectionDto, TheaterLayoutDto } from './dto.types';
import {
  PerformanceDetailResult,
  PriceResult,
  SeatBriefResult,
  SeatResult,
  SectionResult,
} from './result.types';

@Injectable()
export class TheaterApiService {
  static REQUEST_ID = 1;

  private readonly loginInfo: LoginInfo;
  private readonly httpClient: Axios;

  constructor(configService: ConfigService) {
    const loginInfo: LoginInfo | undefined =
      configService.get<LoginInfo>('theaterApi.loginInfo');

    if (!loginInfo) {
      throw new Error('Failed to retrieve API login info from config');
    }

    this.loginInfo = loginInfo;

    const domain: string | undefined = configService.get<string>('theaterApi.domain');

    if (!domain) {
      throw new Error('Failed to retrieve API domain from config');
    }

    const timeout: number | undefined = configService.get<number>('theaterApi.timeout');

    if (!timeout) {
      throw new Error('Failed to retrieve API timeout from config');
    }

    this.httpClient = axios.create({
      baseURL: `https://${domain}/tessitura/ctglive`,
      timeout,
    });
  }

  async getPricesPerZone(eventId: number): Promise<Result<PriceDto[]>> {
    const queryBlobParams = {
      SessionKey: this.loginInfo.sessionKey,
      iPerf_no: eventId,
      iModeOfSale: this.loginInfo.modeOfSale,
    };

    try {
      const response: AxiosResponse<PerformanceDetailResult> = await this.httpClient.get(
        '',
        {
          params: {
            id: TheaterApiService.REQUEST_ID,
            method: 'GetPerformanceDetailWithDiscountingEx',
            params: this.toBase64String(queryBlobParams),
          },
        },
      );

      return this.retrievePrices(response.data);
    } catch (err) {
      const errorResult: ErrorResult = this.resolveRequestError(err);
      return Result.fromFailure(errorResult);
    }
  }

  async getTheaterLayout(eventId: number): Promise<Result<TheaterLayoutDto>> {
    const queryBlobParams = {
      sSessionKey: this.loginInfo.sessionKey,
      iModeOfSale: this.loginInfo.modeOfSale,
      iSourceNumber: this.loginInfo.sourceNumber,
      iPerformanceNumber: eventId,
      iPackageNumber: 0,
      cSummaryOnly: 'N',
      cCalcPackageAlloc: 'Y',
      cReturnNonSeats: 'Y',
    };

    try {
      const response = await this.httpClient.get('', {
        params: {
          id: TheaterApiService.REQUEST_ID,
          method: 'GetSeatsBriefWithMOS',
          params: this.toBase64String(queryBlobParams),
        },
      });

      return this.retrieveTheaterLayout(response.data);
    } catch (err) {
      const errorResult: ErrorResult = this.resolveRequestError(err);
      return Result.fromFailure(errorResult);
    }
  }

  private retrievePrices(
    performanceDetailResult: PerformanceDetailResult,
  ): Result<PriceDto[]> {
    if (performanceDetailResult.error) {
      return Result.failure(
        `Error from external API host: ${performanceDetailResult.error}`,
        502,
      );
    }

    const prices: PriceDto[] =
      performanceDetailResult.result.GetPerformanceDetailWithDiscountingExResult.Price.map(
        (p: PriceResult) => ({
          zoneId: p.zone_no,
          price: Number(p.price),
        }),
      );

    return Result.success(prices);
  }

  private retrieveTheaterLayout(
    seatBriefResult: SeatBriefResult,
  ): Result<TheaterLayoutDto> {
    if (seatBriefResult.error) {
      return Result.failure(
        `Error from external API host: ${seatBriefResult.error}`,
        502,
      );
    }

    const seats: SeatDto[] = seatBriefResult.result.GetSeatsBriefExResults.S.filter(
      (seat: SeatResult) => !seat.D.startsWith('0'),
    )
      .map((seat: SeatResult) => seat.D.split(','))
      .map((fields: string[]) => ({
        id: fields[4],
        statusCode: fields[3],
        zoneId: fields[5],
        rowNumber: fields[1],
        seatNumber: fields[2],
        sectionId: fields[0],
      }));

    const sections: SectionDto[] =
      seatBriefResult.result.GetSeatsBriefExResults.Section.map(
        (section: SectionResult) => ({
          id: section.section,
          description: section.section_desc,
        }),
      );

    const layout: TheaterLayoutDto = { seats, sections };

    return Result.success(layout);
  }

  private resolveRequestError(error: AxiosError): ErrorResult {
    if (error.response) {
      return {
        message: `Got bad response from external API with status: "${error.response.status}"`,
        code: 502,
      };
    }
    if (error.request) {
      return {
        message: 'Failed to get the response from the external API',
        code: 504,
      };
    }
    return {
      message: 'Something bad happend while setting up the request to API',
      code: 500,
    };
  }

  private toBase64String(obj: any): string {
    const jsonStr = JSON.stringify(obj);
    return Buffer.from(jsonStr).toString('base64');
  }
}

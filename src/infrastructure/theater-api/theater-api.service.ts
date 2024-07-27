import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { ErrorResult, Result } from '../../common/exceptions/result';
import { LoginInfo } from '../../config/login-info.types';
import { PriceDto } from './dto/price.dto';
import { SeatDto } from './dto/seat.dto';
import { SectionDto } from './dto/section.dto';
import { TheaterLayoutDto } from './dto/theater-layout.dto';

@Injectable()
export class TheaterApiService {
  static REQUEST_ID = 1;

  private readonly loginInfo: LoginInfo;
  private readonly httpClient: any;

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
      const response = await this.httpClient.get('', {
        params: {
          id: TheaterApiService.REQUEST_ID,
          method: 'GetPerformanceDetailWithDiscountingEx',
          params: this.toBase64String(queryBlobParams),
        },
      });

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

  private retrievePrices(responseBody: any): Result<PriceDto[]> {
    if (responseBody.error) {
      return Result.failure(`Error from external API host: ${responseBody.error}`, 502);
    }

    const prices: PriceDto[] =
      responseBody.result.GetPerformanceDetailWithDiscountingExResult.Price.map(
        (p: { zone_no: string; price: string }) => ({
          zoneId: p.zone_no,
          price: Number(p.price),
        }),
      );

    return Result.success(prices);
  }

  private retrieveTheaterLayout(responseBody: any): Result<TheaterLayoutDto> {
    if (responseBody.error) {
      return Result.failure(`Error from external API host: ${responseBody.error}`, 502);
    }

    const seats: SeatDto[] = responseBody.result.GetSeatsBriefExResults.S.filter(
      (seatWrapper: { D: string }) => !seatWrapper.D.startsWith('0'),
    )
      .map((seatWrapper: { D: string }) => seatWrapper.D.split(','))
      .map((fields: string[]) => ({
        id: fields[4],
        statusCode: fields[3],
        zoneId: fields[5],
        rowNumber: fields[1],
        seatNumber: fields[2],
        sectionId: fields[0],
      }));

    const sections: SectionDto[] = responseBody.result.GetSeatsBriefExResults.Section.map(
      (section: { section: string; section_desc: string }) => ({
        id: section.section,
        description: section.section_desc,
      }),
    );

    const layout: TheaterLayoutDto = { seats, sections };

    return Result.success(layout);
  }

  private resolveRequestError(error: any): ErrorResult {
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
